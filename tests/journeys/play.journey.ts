// What happens when Play is pressed, at every size, in every engine: the first press works, a slow game says it is
// loading, a double tap starts one game, a turned phone keeps its game, and a page with no JavaScript says so.
import { expect, test } from '@playwright/test'
import { isCommit, parseVersion } from '../../src/features/version/version.ts'
import { siteFacts } from './facts.ts'
import { button, FRAME, frameHeight, play, playNames, pointsOnPicture, WORDS, whatIsAt } from './home.ts'
import { arrive, fitsSideways, tabKey } from './look.ts'
import { SIZES } from './sizes.ts'
import { watchForTrouble } from './watch.ts'

for (const size of SIZES) {
  test.describe(size.name, () => {
    test.use({ viewport: { width: size.width, height: size.height } })

    test('pressing each Play button starts the game inside the page', async ({ page }) => {
      const trouble = watchForTrouble(page)
      for (const name of playNames(size.width)) {
        await arrive(page)
        const game = await play(page, name)
        await expect(page.locator(FRAME)).toHaveCount(1)
        await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing')
        await expect(page.locator('img.poster')).toBeHidden()
        await expect(button(page, WORDS.play.sheet)).toBeHidden()
        await expect(page.getByRole('status')).toBeHidden()
        const canvas = await game.locator('canvas').boundingBox()
        expect(canvas?.width ?? 0, name).toBeGreaterThan(100)
        expect(canvas?.height ?? 0, name).toBeGreaterThan(100)
        await expect(page.locator(FRAME)).toBeInViewport()
        const frame = await page.locator(FRAME).boundingBox()
        expect(frame?.x ?? -1, name).toBeGreaterThanOrEqual(0)
        expect((frame?.x ?? 0) + (frame?.width ?? 0), name).toBeLessThanOrEqual(size.width)
        expect(frame?.height ?? 0, name).toBeGreaterThanOrEqual(200)
      }
      await page.screenshot({ path: `tests/journeys/__screenshots__/${size.name}.png` })
      expect(trouble()).toEqual([])
    })

    test('the keys reach the game with no second click', async ({ page }) => {
      await arrive(page)
      const game = await play(page)
      const canvas = game.locator('canvas')
      const before = await canvas.screenshot()
      await page.keyboard.down('ArrowRight')
      await expect.poll(async () => (await canvas.screenshot()).equals(before)).toBe(false)
      await page.keyboard.up('ArrowRight')
    })
  })
}

// The cases that are about behaviour, not layout, run at the largest and the smallest size only.
for (const size of [SIZES[4], SIZES[0]]) {
  test.describe(`${size.name}: what can go wrong`, () => {
    test.use({ viewport: { width: size.width, height: size.height } })

    test('a slow game says it is loading beside its picture, and then stops saying it', async ({ page }) => {
      let release: () => void = () => {}
      const gate = new Promise<void>((resolve) => {
        release = resolve
      })
      await page.route('**/play/', async (route) => {
        await gate
        await route.continue()
      })
      await arrive(page)
      await button(page, WORDS.play.sheet).click()
      // The note is in the sheet's bar, where "Play it" was, never over the picture.
      const note = page.locator('.sheet-head').getByRole('status')
      await expect(note).toHaveText(WORDS.loading)
      await expect(note).toBeInViewport()
      await expect(page.locator('#game')).toHaveAttribute('data-state', 'loading')
      await expect(page.locator('img.poster')).toBeVisible()
      expect(await page.locator(FRAME).evaluate((element) => getComputedStyle(element).visibility)).toBe(
        'hidden',
      )
      expect(
        await page.locator('#game').evaluate((game) => [...game.children].map((child) => child.tagName)),
      ).toEqual(['IMG', 'IFRAME'])
      expect(new Set(await whatIsAt(page, await pointsOnPicture(page)))).toEqual(new Set(['img.poster']))
      release()
      await expect(note).toBeHidden()
      await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing')
    })

    test("nothing of the site's is over the game's picture, before Play", async ({ page }) => {
      await arrive(page)
      expect(
        await page.locator('#game').evaluate((game) => [...game.children].map((child) => child.tagName)),
      ).toEqual(['IMG'])
      expect(new Set(await whatIsAt(page, await pointsOnPicture(page)))).toEqual(new Set(['img.poster']))
    })

    test('a double press starts one game', async ({ page }) => {
      await arrive(page)
      await button(page, WORDS.play.sheet).dblclick()
      await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing')
      await expect(page.locator('iframe')).toHaveCount(1)
    })

    test('a press while the game plays goes back to the game and starts no second one', async ({ page }) => {
      await arrive(page)
      await play(page)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      const again = button(page, WORDS.play.main)
      await again.scrollIntoViewIfNeeded()
      await again.click()
      await expect(page.locator('iframe')).toHaveCount(1)
      await expect(page.locator(FRAME)).toBeInViewport()
      await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing')
    })

    test.describe('with JavaScript off', () => {
      test.use({ javaScriptEnabled: false })

      test('the picture, the note, the facts and no Play button', async ({ page, request }) => {
        const facts = await siteFacts(request)
        await page.goto('/')
        // Not getByText: Playwright's text search skips what is inside a <noscript>.
        await expect(page.locator('p.no-script')).toHaveText(WORDS.noScript)
        await expect(page.locator('p.no-script')).toBeVisible()
        await expect(page.locator('img.poster')).toBeVisible()
        await expect(page.locator('[data-play]:visible')).toHaveCount(0)
        await expect(page.locator('.sheet-head b')).toHaveText(facts.name)
        await expect(page.locator('.claims .stamp')).toHaveCount(5)
        expect(
          await page.locator('#game').evaluate((game) => [...game.children].map((child) => child.tagName)),
        ).toEqual(['IMG'])
      })
    })
  })
}

test.describe('phone-390x844: turning the phone', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('keeps the same game going', async ({ page }) => {
    await arrive(page)
    await play(page)
    // A reloaded frame would lose this marker.
    const frame = await (await page.locator(FRAME).elementHandle())?.contentFrame()
    await frame?.evaluate(() => {
      ;(window as unknown as { keptThroughTheTurn: boolean }).keptThroughTheTurn = true
    })
    await page.setViewportSize({ width: 844, height: 390 })
    await expect(page.locator(FRAME)).toBeVisible()
    // Turned sideways, the game still takes the whole window.
    await expect.poll(() => frameHeight(page)).toBeGreaterThanOrEqual(389)
    await expect.poll(() => frameHeight(page)).toBeLessThanOrEqual(391)
    expect(
      await frame?.evaluate(() => (window as unknown as { keptThroughTheTurn?: boolean }).keptThroughTheTurn),
    ).toBe(true)
    await expect(page.frameLocator(FRAME).locator('#game')).toHaveAttribute('data-state', 'playing')
    expect(await fitsSideways(page)).toBe(true)
  })
})

// A phone held sideways has little height, so the playing game must take all of it: a thumb that swipes there has to play,
// not scroll the page.
test.describe('phone-844x390: playing sideways', () => {
  test.use({ viewport: { width: 844, height: 390 } })

  test('the game fills the window, from its top edge to its bottom edge', async ({ page }) => {
    await arrive(page)
    await play(page)
    await expect
      .poll(async () => Math.abs((await page.locator(FRAME).boundingBox())?.y ?? 99))
      .toBeLessThanOrEqual(1)
    await expect.poll(() => frameHeight(page)).toBeGreaterThanOrEqual(389)
    await expect.poll(() => frameHeight(page)).toBeLessThanOrEqual(391)
  })
})

// The same page for a device set to light: the site is dark whatever the device says, so it must look the same.
test.describe('phone-390x844: a device set to light', () => {
  test.use({ viewport: { width: 390, height: 844 }, colorScheme: 'light' })

  test('looks like every other arrival', async ({ page }) => {
    await arrive(page)
    await page.screenshot({ path: 'tests/journeys/__screenshots__/phone-390x844-arrival-light-setting.png' })
  })
})

// A person using the keyboard reaches the main Play button and sees where they are.
test.describe('phone-390x844: reaching the button with the keyboard', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('the main Play button has the focus ring', async ({ page, browserName }) => {
    await arrive(page)
    const main = button(page, WORDS.play.main)
    for (
      let press = 0;
      press < 10 && !(await main.evaluate((element) => element === document.activeElement));
      press++
    )
      await page.keyboard.press(tabKey(browserName))
    await expect(main).toBeFocused()
    await page.screenshot({ path: 'tests/journeys/__screenshots__/phone-390x844-focus.png' })
  })
})

// The touch buttons are the only way to play on a phone, so a journey presses them: the page's frame must pass touches
// on, and its layout must leave the buttons wholly on screen.
for (const size of [SIZES[0], SIZES[2]]) {
  test.describe(`${size.name}: with a finger`, () => {
    test.use({ viewport: { width: size.width, height: size.height }, hasTouch: true })

    test('the buttons are on screen and holding one moves the game', async ({ page, request }) => {
      await arrive(page)
      const game = await play(page)
      await page.locator(FRAME).tap()
      const version = parseVersion(await (await request.get('/version.json')).text())
      // The stand-in game has one button; the real game has three.
      const names = version !== undefined && isCommit(version.game) ? ['Left', 'Right', 'Jump'] : ['Right']
      for (const name of names) {
        const touch = game.getByRole('button', { name, exact: true })
        await expect(touch).toBeVisible()
        const box = await touch.boundingBox()
        expect(box?.x ?? -1).toBeGreaterThanOrEqual(0)
        expect(box?.y ?? -1).toBeGreaterThanOrEqual(0)
        expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(size.width)
        expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(size.height)
        expect(box?.width ?? 0).toBeGreaterThanOrEqual(44)
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
        // A real tap: Playwright checks that this button is what receives the touch at its middle, and fails if a layer
        // of the page or of the game covers it. (A made-up event goes straight to the button and would not notice.)
        await touch.tap()
      }
      const canvas = game.locator('canvas')
      const before = await canvas.screenshot()
      const right = game.getByRole('button', { name: 'Right', exact: true })
      // A tap cannot be held, so the hold alone is sent as events.
      await right.dispatchEvent('pointerdown', { pointerType: 'touch', isPrimary: true })
      await expect.poll(async () => (await canvas.screenshot()).equals(before)).toBe(false)
      await right.dispatchEvent('pointerup', { pointerType: 'touch', isPrimary: true })
    })
  })
}
