// The little motion the page has, and that it stays off for a person who asks for less: the first screen arriving, a
// stamp landing when it is in view, a button answering a pointer. The other journeys run with motion off (see
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

    // Audit F2, and the Owner's answer to Q1: the stamp waits out of sight, lands once on a clock when the whole of it is
    // in the window, and is never left half faded.
    test('the "Works today" stamp waits, lands once when wholly in the window, and stays landed', async ({
      page,
    }) => {
      await arrive(page)
      const stamp = page.locator('.stamp.works')
      const state = (): Promise<{ landing: string | null; opacity: string; scale: string }> =>
        stamp.evaluate((element) => {
          const s = getComputedStyle(element)
          return { landing: element.getAttribute('data-landing'), opacity: s.opacity, scale: s.scale }
        })
      // Far below the window, it is waiting, out of sight and a little large.
      await expect.poll(state).toEqual({ landing: 'waiting', opacity: '0', scale: '1.4' })
      // With a good part of it (16 px) still below the window's edge it has not landed; once all of it is in, it does.
      await stamp.evaluate((element) => {
        const box = element.getBoundingClientRect()
        window.scrollTo({ top: box.bottom + window.scrollY - window.innerHeight - 16, behavior: 'instant' })
      })
      await page.evaluate(() => new Promise((done) => setTimeout(done, 300)))
      expect((await state()).landing).toBe('waiting')
      await scrollBottomTo(stamp, 8)
      await expect
        .poll(state)
        .toEqual({ landing: 'landed', opacity: '1', scale: expect.stringMatching(/^(none|1)$/) })
      // It takes about a fifth of a second (220 ms), on a clock and not on the scroll.
      expect(await stamp.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe(
        '0.22s, 0.22s',
      )
      // Once: away and back, it is landed the whole time and does not wait again.
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      expect((await state()).landing).toBe('landed')
      await scrollBottomTo(stamp, 8)
      expect(await state()).toEqual({
        landing: 'landed',
        opacity: '1',
        scale: expect.stringMatching(/^(none|1)$/),
      })
    })

    test('a press on "What works today" brings the stamp in, and it lands', async ({ page }) => {
      await arrive(page)
      // The bar's link on a wide window, the tag's on a phone, where the bar keeps only its Play button.
      await page.locator('a[href="#today"]:visible').first().click()
      await expect(page.locator('#today h2')).toBeInViewport()
      await expect
        .poll(() => page.locator('.stamp.works').evaluate((element) => element.getAttribute('data-landing')))
        .toBe('landed')
      await expect
        .poll(() => page.locator('.stamp.works').evaluate((element) => getComputedStyle(element).opacity))
        .toBe('1')
    })

    // Super subtle smoothing (Lenis): a turn of the wheel ends where the browser would have put it.
    test('the wheel is smoothed and still ends exactly where it was sent', async ({ page }) => {
      await arrive(page)
      await expect(page.locator('html')).toHaveClass(/\blenis\b/)
      await wheelDown(page)
    })

    // Where the bar is kept (700 px wide and up) a press stops 80 px short of it; on a phone there is no kept bar, so the
    // place is at the window's top edge (audit F4).
    test('a press on "What works today" travels there, and stops short of the bar where there is one', async ({
      page,
    }) => {
      await arrive(page)
      const kept = size.width >= 700
      await page.locator('a[href="#today"]:visible').first().click()
      await expect(page.locator('#today h2')).toBeInViewport()
      const top = async (): Promise<number> =>
        Math.round((await page.locator('#today').boundingBox())?.y ?? -99)
      // 80 where the bar is kept (it clears the bar by 16 px), flush with the window's top where it is not. The page is
      // long enough to scroll all the way there at every size.
      await expect.poll(top).toBeLessThanOrEqual(kept ? 82 : 2)
      expect(await top()).toBeGreaterThanOrEqual(kept ? 78 : -1)
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

  test("nothing moves but the wheel's easing", async ({ page }) => {
    await arrive(page)
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
    for (const stamp of await page.locator('.stamp').all())
      expect(await stamp.evaluate((element) => getComputedStyle(element).opacity)).toBe('1')
    // Nothing is made to wait: with less motion the stamp is simply there (the script does not hide it).
    expect(await page.locator('[data-landing]').count()).toBe(0)
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
