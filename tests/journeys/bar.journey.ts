// The top bar: kept at the top of a window that has room for it and shows its three things, and gone where it has
// nothing to show or no room to spare. A press that brings something up stops flush under the bar, never behind it and
// never with a strip of the page showing between (audit F4).
import { expect, test } from '@playwright/test'
import { BAR_AT, button, FRAME, play, WORDS } from './home.ts'
import { arrive } from './look.ts'
import { SIZES } from './sizes.ts'

for (const size of [SIZES[4], SIZES[2]]) {
  test.describe(`${size.name}: the top bar`, () => {
    test.use({ viewport: { width: size.width, height: size.height } })

    test("the bar's Play button, pressed at the bottom of the page, brings the game up and starts it", async ({
      page,
    }) => {
      await arrive(page)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      // Already in the window: a click that had to scroll back up to find the button would prove nothing.
      const bar = button(page, WORDS.play.bar)
      await expect(bar).toBeInViewport({ ratio: 1 })
      await bar.click()
      await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing')
      await expect(page.locator(FRAME)).toBeInViewport()
      const frame = await page.locator(FRAME).boundingBox()
      const header = await page.locator('header.top').boundingBox()
      expect(frame?.y ?? -1).toBeGreaterThanOrEqual(Math.round((header?.y ?? 0) + (header?.height ?? 0)) - 1)
    })

    test('the bar stays at the top while the page scrolls, and a press on it stops short of the bar', async ({
      page,
    }) => {
      await arrive(page)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      const header = page.locator('header.top')
      expect(Math.round((await header.boundingBox())?.y ?? -1)).toBe(0)
      await expect(button(page, WORDS.play.bar)).toBeInViewport({ ratio: 1 })
      await header.getByRole('link', { name: 'What works today', exact: true }).click()
      const title = page.locator('#today h2')
      await expect(title).toBeInViewport({ ratio: 1 })
      const bottom = Math.round(
        ((await header.boundingBox())?.y ?? 0) + ((await header.boundingBox())?.height ?? 0),
      )
      await expect.poll(async () => Math.round((await title.boundingBox())?.y ?? 0)).toBeGreaterThan(bottom)
    })
  })
}

test.describe('phone-844x390: a short window', () => {
  test.use({ viewport: { width: 844, height: 390 } })

  test('the bar is not kept: it scrolls away, so the playing game can take the whole window', async ({
    page,
  }) => {
    await arrive(page)
    await page.evaluate(() => window.scrollTo(0, 400))
    const header = await page.locator('header.top').boundingBox()
    expect((header?.y ?? 0) + (header?.height ?? 0)).toBeLessThanOrEqual(0)
  })
})

// Audit F4. On a phone the bar held the word alone and took a tenth of the window, and at every size a press that brought
// the game up stopped 16 px short of where it should, with a strip of the sheet's bar showing between the top bar and
// the game. Now the bar is kept only where it has its things, and the game's top edge is the bar's bottom edge (or the
// window's top where there is no bar), to the pixel, with the game at every point between.
for (const size of [SIZES[4], SIZES[2], SIZES[0]]) {
  const kept = size.width >= BAR_AT && size.height >= 500
  test.describe(`${size.name}: ${kept ? 'the bar is kept' : 'the bar scrolls away'}`, () => {
    test.use({ viewport: { width: size.width, height: size.height } })

    test(`the playing game's top edge is ${kept ? "the bar's bottom edge" : "the window's top"}, with no strip between`, async ({
      page,
    }) => {
      await arrive(page)
      const header = page.locator('header.top')
      expect(await header.evaluate((element) => getComputedStyle(element).position)).toBe(
        kept ? 'sticky' : 'relative',
      )
      await play(page)
      const edge = async (): Promise<number> => {
        const bar = await header.boundingBox()
        const frame = await page.locator(FRAME).boundingBox()
        // Where the bar is kept, the frame's top is measured against the bar's bottom; otherwise against the window's.
        const floor = kept ? Math.round((bar?.y ?? 0) + (bar?.height ?? 0)) : 0
        return Math.round(frame?.y ?? 1e6) - floor
      }
      await expect.poll(edge, { message: 'the game flush with what is above it' }).toBe(0)
      // The pixel just under that edge is the game's own frame, not a strip of the page.
      const under = await page.evaluate(() => {
        const frame = document.querySelector('iframe')
        const top = Math.round(frame?.getBoundingClientRect().top ?? 0)
        return document.elementFromPoint(innerWidth / 2, top + 2)?.tagName ?? 'nothing'
      })
      expect(under).toBe('IFRAME')
    })

    if (!kept) {
      test('the bar goes with the page when it scrolls', async ({ page }) => {
        await arrive(page)
        await page.evaluate(() => window.scrollTo(0, 600))
        const bar = await page.locator('header.top').boundingBox()
        expect((bar?.y ?? 0) + (bar?.height ?? 0)).toBeLessThanOrEqual(0)
      })
    }
  })
}
