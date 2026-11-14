// The little motion the page has, and that it stays off for a person who asks for less: the first screen arriving, a
// stamp landing as its card scrolls in, a button answering a pointer. The other journeys run with motion off (see
// `playwright.config.ts`); this one turns it on for itself. Motion is only ever a nicety, so what these prove is that it
// always ends fully shown and that it is gone when asked.
import { expect, type Locator, type Page, test } from '@playwright/test'
import { arrive } from './look.ts'
import { SIZES } from './sizes.ts'

/** The phone held upright, and the desktop. */
const SHOWN_AT = [SIZES[0], SIZES[4]]

/** True for the transform a rest position has: none, or the identity. */
const AT_REST = /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/

/** Scrolls so the bottom edge of `target` is `gap` px above the bottom edge of the window. */
async function scrollBottomTo(target: Locator, gap: number): Promise<void> {
  await target.evaluate((element, margin) => {
    const bottom = element.getBoundingClientRect().bottom + window.scrollY
    window.scrollTo({ top: bottom - window.innerHeight + margin, behavior: 'instant' })
  }, gap)
}

/** Turns the wheel down 600 px over the page, and waits for the page to come to rest there. */
async function wheelDown(page: Page): Promise<void> {
  await page.mouse.move(200, 300)
  await page.mouse.wheel(0, 600)
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThanOrEqual(595)
  expect(await page.evaluate(() => Math.round(window.scrollY))).toBeLessThanOrEqual(605)
}

for (const size of SHOWN_AT) {
  test.describe(`${size.name}: with motion`, () => {
    test.use({
      viewport: { width: size.width, height: size.height },
      reducedMotion: 'no-preference',
    })

    test('the first screen arrives once and ends fully shown', async ({ page }) => {
      await page.goto('/')
      for (const selector of ['.hero .tag', 'h1', '.lede', '.actions']) {
        await expect
          .poll(
            () =>
              page
                .locator(selector)
                .first()
                .evaluate((element) => {
                  const s = getComputedStyle(element)
                  return { opacity: s.opacity, transform: s.transform }
                }),
            { message: selector },
          )
          .toEqual({ opacity: '1', transform: expect.stringMatching(AT_REST) })
      }
      // Once: it does not start again when the page is scrolled and scrolled back.
      await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      expect(await page.locator('h1').evaluate((element) => getComputedStyle(element).opacity)).toBe('1')
    })

    test('every stamp is seen once its card is in the window', async ({ page }) => {
      await arrive(page)
      const stamps = await page.locator('.stamp').all()
      expect(stamps).toHaveLength(5)
      for (const stamp of stamps) {
        await stamp.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
        await expect.poll(() => stamp.evaluate((element) => getComputedStyle(element).opacity)).toBe('1')
        await expect(stamp).toBeInViewport()
      }
    })

    // Audit S5: the landing follows the scroll and ends the moment the whole stamp is in the window, so a page at rest
    // never shows the stamp half faded, wherever it rests.
    test('a stamp that is wholly in the window is wholly landed, wherever the page rests', async ({
      page,
    }) => {
      await arrive(page)
      const stamp = page.locator('.stamp.works')
      await scrollBottomTo(stamp, 8)
      const landed = (): Promise<{ opacity: string; scale: string }> =>
        stamp.evaluate((element) => {
          const s = getComputedStyle(element)
          return { opacity: s.opacity, scale: s.scale }
        })
      await expect.poll(landed).toEqual({ opacity: '1', scale: expect.stringMatching(/^(none|1)$/) })
      // Pressing "What works today" in the bar travels there, and the stamp is landed when it arrives.
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      // The bar's link on a wide window, the tag's on a phone, where the bar keeps only its Play button.
      await page.locator('a[href="#today"]:visible').first().click()
      await expect(page.locator('#today h2')).toBeInViewport()
      await expect.poll(landed).toEqual({ opacity: '1', scale: expect.stringMatching(/^(none|1)$/) })
    })

    // Super subtle smoothing (Lenis): a turn of the wheel ends where the browser would have put it.
    test('the wheel is smoothed and still ends exactly where it was sent', async ({ page }) => {
      await arrive(page)
      await expect(page.locator('html')).toHaveClass(/\blenis\b/)
      await wheelDown(page)
    })

    test('a press on "What works today" travels there and stops short of the bar', async ({ page }) => {
      await arrive(page)
      await page.locator('a[href="#today"]:visible').first().click()
      await expect(page.locator('#today h2')).toBeInViewport()
      await expect
        .poll(async () => (await page.locator('#today').boundingBox())?.y ?? -1)
        .toBeGreaterThanOrEqual(78)
      await expect(page).toHaveURL(/#today$/)
    })

    test('a button answers a pointer and a press', async ({ page }) => {
      await arrive(page)
      const button = page.getByRole('button', { name: 'Play it' })
      await button.scrollIntoViewIfNeeded()
      const filter = (): Promise<string> => button.evaluate((element) => getComputedStyle(element).filter)
      const rest = await filter()
      await button.hover()
      await expect.poll(filter).not.toBe(rest)
      const duration = await button.evaluate((element) => getComputedStyle(element).transitionDuration)
      const seconds = parseFloat(duration.split(',')[0] ?? '')
      expect(seconds).toBeGreaterThanOrEqual(0.1)
      expect(seconds).toBeLessThanOrEqual(0.2)
    })
  })
}

test.describe('with reduced motion', () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })

  test('nothing moves', async ({ page }) => {
    await arrive(page)
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
    for (const stamp of await page.locator('.stamp').all())
      expect(await stamp.evaluate((element) => getComputedStyle(element).opacity)).toBe('1')
    const durations = await page
      .locator('a, .btn')
      .evaluateAll((all) => all.map((element) => getComputedStyle(element).transitionDuration))
    expect(durations.length).toBeGreaterThan(10)
    for (const duration of durations) expect(duration.split(', ').every((one) => one === '0s')).toBe(true)
    // A press on a link jumps; it does not travel.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.locator('a[href="#today"]:visible').first().click()
    const rest = await page.evaluate(() => window.scrollY)
    expect(rest).toBeGreaterThan(1000)
    await page.evaluate(() => new Promise((done) => setTimeout(done, 400)))
    expect(await page.evaluate(() => window.scrollY)).toBe(rest)
    await expect(page.locator('#today h2')).toBeInViewport()
  })

  // The Owner's choice (2026-11-14): the smooth wheel is on for everyone, so a device asking for less motion has it too.
  test('the wheel is still smoothed, as it is for everyone', async ({ page }) => {
    await arrive(page)
    await expect(page.locator('html')).toHaveClass(/\blenis\b/)
    await wheelDown(page)
  })
})
