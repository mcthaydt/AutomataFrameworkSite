// What the page does when something it leans on is missing, in every engine: the fonts never arrive, a 320 px phone, no
// JavaScript, the keyboard's ring on everything Tab reaches, and a slow game. The look of the page itself is in
// `look.journey.ts`.
import { expect, type Page, test } from '@playwright/test'
import { contrast } from '../fixtures/contrast.ts'
import { isGameRequest, isWatchRequest } from './home.ts'
import { arrive, colours, fitsSideways, groundBehind, loadedFonts, TOKENS, tabKey } from './look.ts'
import { SIZES } from './sizes.ts'

/** The two things the claim, the lede and the first button must all do on a phone that has no fonts: be on the first screen. */
async function firstScreenHolds(page: Page): Promise<void> {
  await expect(page.locator('header.top .wordmark')).toBeInViewport({ ratio: 1 })
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport({ ratio: 1 })
  await expect(page.locator('p.lede')).toBeInViewport({ ratio: 1 })
  await expect(page.getByRole('button', { name: 'Play the first game' })).toBeInViewport({ ratio: 1 })
}

// Review Focus 1: a slow line or a blocker means the fonts never come. The page must read in the device's own font, and
// the wordmark, the claim, the lede and the main Play button must still fit before any scroll. Phone, upright and sideways.
for (const size of [SIZES[0], SIZES[1]]) {
  test.describe(`${size.name}: no fonts`, () => {
    test.use({ viewport: { width: size.width, height: size.height } })

    test('with the fonts blocked, the page still reads and still fits before any scroll', async ({
      page,
    }) => {
      await page.route(/\.woff2?(\?|$)/, (route) => route.abort())
      await page.goto('/')
      await firstScreenHolds(page)
      expect(await loadedFonts(page)).toEqual([])
      expect(await fitsSideways(page)).toBe(true)
    })
  })
}

// Review Focus 2: a narrow phone, 320 px wide. The claim, set large, must not run off the side, and the four things of
// the first screen must still be there. The file panel may scroll sideways inside itself; the page may not.
test.describe('phone-320x568: a 320 px phone', () => {
  test.use({ viewport: { width: 320, height: 568 } })

  test('nothing runs off the side, and the first screen still holds the four things', async ({ page }) => {
    await arrive(page)
    expect(await fitsSideways(page)).toBe(true)
    const heading = page.getByRole('heading', { level: 1 })
    const box = await heading.boundingBox()
    expect(Math.round((box?.x ?? 0) + (box?.width ?? 0))).toBeLessThanOrEqual(320)
    await firstScreenHolds(page)
    // The table of places stays inside the window, and a long row of the file scrolls inside its own panel.
    const table = await page.locator('table').boundingBox()
    expect(Math.round((table?.x ?? 0) + (table?.width ?? 0))).toBeLessThanOrEqual(320)
    expect(await fitsSideways(page)).toBe(true)
  })
})

// Review Focus 3: JavaScript off. The look, the icons and the facts are in the page itself, and the note about
// JavaScript must read.
test.describe('phone-390x844: with JavaScript off', () => {
  test.use({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false })

  test('the page still looks like itself, shows its icons and says what to do', async ({ page }) => {
    await page.goto('/')
    expect(await page.locator('body').evaluate((body) => getComputedStyle(body).backgroundColor)).toBe(
      TOKENS.ground,
    )
    expect(await page.locator('svg.icon').count()).toBeGreaterThanOrEqual(16)
    const note = page.locator('p.no-script')
    await expect(note).toBeVisible()
    const [found] = await colours(page, 'p.no-script')
    expect(contrast(found?.words ?? '', found?.ground ?? '')).toBeGreaterThanOrEqual(4.5)
    await expect(page.locator('img.poster')).toBeVisible()
    for (const button of await page.locator('[data-play]').all()) await expect(button).toBeHidden()
  })
})

// Review Focus 4: a person using the keyboard. Every link, every button and the file panel must show the ring when Tab
// reaches it, at 3 to 1 or more against what is behind it.
test.describe('tablet-820x1180: the ring shows on everything Tab reaches', () => {
  test.use({ viewport: { width: 820, height: 1180 } })

  test('every stop has the ring', async ({ page, browserName }) => {
    await arrive(page)
    const stops = await page.locator('a[href], button, [tabindex="0"]').filter({ visible: true }).count()
    expect(stops).toBeGreaterThanOrEqual(12)
    // Where Tab has been, by the element's kind, address, words and place on the page: each stop must be a different
    // thing, so Tab cannot land on one twice and skip another without this showing. (The bar and the footer both have
    // "What works today", so the place is part of the name.)
    const reached = new Set<string>()
    for (let stop = 1; stop <= stops; stop++) {
      await page.keyboard.press(tabKey(browserName))
      const focused = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement
        const style = getComputedStyle(element)
        const box = element.getBoundingClientRect()
        return {
          which: `${element.tagName} ${element.getAttribute('href') ?? ''} ${(element.textContent ?? '').trim()} @${Math.round(box.top + window.scrollY)},${Math.round(box.left)}`,
          visible: element.matches(':focus-visible'),
          ring: style.outlineColor,
          width: style.outlineWidth,
          name: (element.textContent ?? '').trim().slice(0, 30) || element.className,
        }
      })
      expect(focused.visible, `stop ${stop}: ${focused.name}`).toBe(true)
      expect(focused.ring, focused.name).toBe(TOKENS.words)
      expect(focused.width, focused.name).toBe('3px')
      expect(contrast(focused.ring, await groundBehind(page)), focused.name).toBeGreaterThanOrEqual(3)
      reached.add(focused.which)
    }
    expect(reached.size, 'every stop is a different link or button').toBe(stops)
  })
})

// Pressing Play: while the game loads, the note on the sheet must read, and then it must go.
test.describe('phone-390x844: a slow game', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('"Loading the game…" is a note on the sheet, and then it is gone', async ({ page }) => {
    let release: () => void = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    await page.route(isWatchRequest, (route) => route.abort())
    await page.route(isGameRequest, async (route) => {
      await gate
      await route.continue()
    })
    await arrive(page)
    await page.getByRole('button', { name: 'Play it' }).click()
    const note = page.getByRole('status')
    await expect(note).toHaveText('Loading the game…')
    const look = await note.evaluate((element) => {
      const s = getComputedStyle(element)
      return { words: s.color, capitals: s.textTransform }
    })
    expect(look).toEqual({ words: TOKENS.words, capitals: 'none' })
    const [shown] = await colours(page, '[role="status"]')
    expect(contrast(shown?.words ?? '', shown?.ground ?? '')).toBeGreaterThanOrEqual(4.5)
    // The blank frame is not shown while the game loads (WebKit paints a blank frame white), so the picture stays.
    expect(
      await page
        .locator('iframe[title="The demo game"]')
        .evaluate((element) => getComputedStyle(element).visibility),
    ).toBe('hidden')
    await expect(page.locator('img.poster')).toBeVisible()
    await page.screenshot({ path: 'tests/journeys/__screenshots__/phone-390x844-loading.png' })
    release()
    await expect(note).toBeHidden()
    // ...and once the game plays, its frame is shown.
    await expect(page.locator('iframe[title="The demo game"]')).toBeVisible()
  })
})
