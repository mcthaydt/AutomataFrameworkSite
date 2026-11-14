// The home page as a first-time visitor meets it, at every size, in every engine: what it says, what to press, that
// the first press works, and what happens to a slow game, a double tap, a turned phone and a page with no JavaScript.
// Every word is asserted word for word: a word that changes here must change in index.html on purpose.
import { expect, type FrameLocator, type Page, test } from '@playwright/test'
import { gameCommitUrl, isCommit, parseVersion, shortCommit } from '../../src/features/version/version.ts'
import { SIZES } from './sizes.ts'
import { watchForTrouble } from './watch.ts'

const WORDS = {
  title: 'AutomataFramework',
  lede: 'AutomataFramework is a toolkit for making 2D games that play in a web browser. It is still being built. Below is the first game made with it.',
  play: 'Play the game',
  loading: 'Loading the game…',
  noScript: "This game needs JavaScript. Turn it on in your browser's settings, then load this page again.",
  headings: ['How to play', 'What you are playing', 'What to do next'],
  help: [
    'On a computer: hold the left or right arrow key to move. Press Space to jump.',
    'On a phone or tablet: hold the Left or Right button to move. Tap Jump to jump.',
    'Keys not working? Click the game once, then try again.',
  ],
  playing:
    'You are playing the game exactly as it is saved on GitHub. When someone changes it there and the change passes its checks, this page shows the new game a little while later.',
  next: [
    'Play the game above. It takes a minute.',
    "See how it is made: the game's files are on GitHub.",
    'Make your own game: not yet. The toolkit is still being built, and this page will say when it is ready.',
  ],
  gameLink: "the game's files are on GitHub",
  footer: [
    { name: 'The game on GitHub', href: 'https://github.com/mcthaydt/AutomataFrameworkExamples' },
    { name: 'The toolkit on GitHub', href: 'https://github.com/mcthaydt/AutomataFramework' },
  ],
}

const FRAME = 'iframe[title="The demo game"]'

/** Presses Play and waits until the game inside the frame says it is playing. */
async function play(page: Page): Promise<FrameLocator> {
  await page.getByRole('button', { name: WORDS.play }).click()
  const game = page.frameLocator(FRAME)
  await expect(game.locator('#game[data-state="playing"]')).toBeAttached()
  return game
}

/** True while the document is no wider than the window: no sideways scrolling. */
const fitsSideways = (page: Page): Promise<boolean> =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)

for (const size of SIZES) {
  test.describe(size.name, () => {
    test.use({ viewport: { width: size.width, height: size.height } })

    test('the page says what it is and what to press', async ({ page }) => {
      const trouble = watchForTrouble(page)
      await page.goto('/')
      await expect(page).toHaveTitle('AutomataFramework')
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(WORDS.title)
      await expect(page.locator('p.lede')).toHaveText(WORDS.lede)
      await expect(page.getByRole('heading', { level: 2 })).toHaveText(WORDS.headings)
      await expect(page.locator('ul.help li')).toHaveText(WORDS.help)
      await expect(page.locator('p.playing')).toHaveText(WORDS.playing)
      await expect(page.locator('ul.next li')).toHaveText(WORDS.next)
      await expect(page.getByRole('link', { name: WORDS.gameLink })).toHaveAttribute(
        'href',
        WORDS.footer[0]?.href ?? '',
      )
      for (const link of WORDS.footer) {
        await expect(page.getByRole('link', { name: link.name, exact: true })).toHaveAttribute(
          'href',
          link.href,
        )
      }
      const buttons = page.getByRole('button')
      await expect(buttons).toHaveCount(1)
      await expect(buttons).toHaveText(WORDS.play)
      await expect(buttons).toBeVisible()
      // Rounded: Firefox reports a 56 px button as 55.99997.
      expect(Math.round((await buttons.boundingBox())?.height ?? 0)).toBeGreaterThanOrEqual(56)
      expect(await fitsSideways(page)).toBe(true)
      expect(trouble()).toEqual([])
    })

    test('before any scroll, the heading, the lede and the Play button are all in the window', async ({
      page,
    }) => {
      await page.goto('/')
      expect(await page.evaluate(() => window.scrollY)).toBe(0)
      await expect(page.getByRole('heading', { level: 1 })).toBeInViewport({ ratio: 1 })
      await expect(page.locator('p.lede')).toBeInViewport({ ratio: 1 })
      await expect(page.getByRole('button', { name: WORDS.play })).toBeInViewport({ ratio: 1 })
      // What a newcomer sees first: people look at this picture.
      await page.screenshot({ path: `tests/journeys/__screenshots__/${size.name}-arrival.png` })
    })

    test('pressing Play starts the game inside the page', async ({ page }) => {
      const trouble = watchForTrouble(page)
      await page.goto('/')
      const game = await play(page)
      await expect(page.locator(FRAME)).toHaveCount(1)
      await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing')
      await expect(page.getByRole('status')).toBeHidden()
      await expect(page.getByRole('button', { name: WORDS.play })).toBeHidden()
      const canvas = await game.locator('canvas').boundingBox()
      expect(canvas?.width ?? 0).toBeGreaterThan(100)
      expect(canvas?.height ?? 0).toBeGreaterThan(100)
      const frame = await page.locator(FRAME).boundingBox()
      expect(frame?.x ?? -1).toBeGreaterThanOrEqual(0)
      expect((frame?.x ?? 0) + (frame?.width ?? 0)).toBeLessThanOrEqual(size.width)
      expect(frame?.height ?? 0).toBeGreaterThanOrEqual(200)
      await page.screenshot({ path: `tests/journeys/__screenshots__/${size.name}.png` })
      expect(trouble()).toEqual([])
    })

    test('the keys reach the game with no second click', async ({ page }) => {
      await page.goto('/')
      const game = await play(page)
      const canvas = game.locator('canvas')
      const before = await canvas.screenshot()
      await page.keyboard.down('ArrowRight')
      await expect.poll(async () => (await canvas.screenshot()).equals(before)).toBe(false)
      await page.keyboard.up('ArrowRight')
    })

    test('the version line names the game that is playing', async ({ page, request }) => {
      await page.goto('/')
      const version = parseVersion(await (await request.get('/version.json')).text())
      expect(version).toBeDefined()
      if (version === undefined) return
      await expect(page.locator('#game-version')).toHaveText(`Game version: ${shortCommit(version.game)}`)
      const link = page.locator('#game-version a')
      const url = gameCommitUrl(version)
      if (url === undefined) await expect(link).toHaveCount(0)
      else await expect(link).toHaveAttribute('href', url)
    })
  })
}

// The cases that are about behaviour, not layout, run at the largest and the smallest size only.
for (const size of [SIZES[4], SIZES[0]]) {
  test.describe(`${size.name}: what can go wrong`, () => {
    test.use({ viewport: { width: size.width, height: size.height } })

    test('a slow game says it is loading, and then stops saying it', async ({ page }) => {
      let release: () => void = () => {}
      const gate = new Promise<void>((resolve) => {
        release = resolve
      })
      await page.route('**/play/', async (route) => {
        await gate
        await route.continue()
      })
      await page.goto('/')
      await page.getByRole('button', { name: WORDS.play }).click()
      await expect(page.getByRole('status')).toHaveText(WORDS.loading)
      await expect(page.locator('#game')).toHaveAttribute('data-state', 'loading')
      release()
      await expect(page.getByRole('status')).toBeHidden()
      await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing')
    })

    test('a double press starts one game', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: WORDS.play }).dblclick()
      await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing')
      await expect(page.locator('iframe')).toHaveCount(1)
    })

    test('a missing version file hides the line and breaks nothing', async ({ page }) => {
      await page.route('**/version.json', (route) => route.fulfill({ status: 404, body: 'Not found' }))
      await page.goto('/')
      await expect(page.locator('#game-version')).toBeHidden()
      await play(page)
    })

    test.describe('with JavaScript off', () => {
      test.use({ javaScriptEnabled: false })

      test('the page says what to do and shows no button', async ({ page }) => {
        await page.goto('/')
        // Not getByText: Playwright's text search skips what is inside a <noscript>.
        await expect(page.locator('p.no-script')).toHaveText(WORDS.noScript)
        await expect(page.locator('p.no-script')).toBeVisible()
        await expect(page.getByRole('button')).toBeHidden()
      })
    })
  })
}

test.describe('phone-390x844: turning the phone', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('keeps the same game going', async ({ page }) => {
    await page.goto('/')
    await play(page)
    // A reloaded frame would lose this marker.
    const frame = await (await page.locator(FRAME).elementHandle())?.contentFrame()
    await frame?.evaluate(() => {
      ;(window as unknown as { keptThroughTheTurn: boolean }).keptThroughTheTurn = true
    })
    await page.setViewportSize({ width: 844, height: 390 })
    await expect(page.locator(FRAME)).toBeVisible()
    expect(
      await frame?.evaluate(() => (window as unknown as { keptThroughTheTurn?: boolean }).keptThroughTheTurn),
    ).toBe(true)
    await expect(page.frameLocator(FRAME).locator('#game')).toHaveAttribute('data-state', 'playing')
    expect(await fitsSideways(page)).toBe(true)
  })
})

// The touch buttons are the only way to play on a phone, so a journey presses them: the page's frame must pass touches
// on, and its layout must leave the buttons wholly on screen.
for (const size of [SIZES[0], SIZES[2]]) {
  test.describe(`${size.name}: with a finger`, () => {
    test.use({ viewport: { width: size.width, height: size.height }, hasTouch: true })

    test('the buttons are on screen and holding one moves the game', async ({ page, request }) => {
      await page.goto('/')
      const game = await play(page)
      await page.locator(FRAME).tap()
      const version = parseVersion(await (await request.get('/version.json')).text())
      // The stand-in game has one button; the real game has three.
      const names = version !== undefined && isCommit(version.game) ? ['Left', 'Right', 'Jump'] : ['Right']
      for (const name of names) {
        const button = game.getByRole('button', { name, exact: true })
        await expect(button).toBeVisible()
        const box = await button.boundingBox()
        expect(box?.x ?? -1).toBeGreaterThanOrEqual(0)
        expect(box?.y ?? -1).toBeGreaterThanOrEqual(0)
        expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(size.width)
        expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(size.height)
        expect(box?.width ?? 0).toBeGreaterThanOrEqual(44)
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
      }
      const canvas = game.locator('canvas')
      const before = await canvas.screenshot()
      const right = game.getByRole('button', { name: 'Right', exact: true })
      await right.dispatchEvent('pointerdown', { pointerType: 'touch', isPrimary: true })
      await expect.poll(async () => (await canvas.screenshot()).equals(before)).toBe(false)
      await right.dispatchEvent('pointerup', { pointerType: 'touch', isPrimary: true })
    })
  })
}
