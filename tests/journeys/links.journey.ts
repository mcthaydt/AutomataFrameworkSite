// A press on one of the page's own links (the top bar's, the tag's, the footer's "What works today") moves the keyboard
// and a screen reader to where the page travelled, as a browser's own jump does (audit F3). The page answers these
// presses itself so that it can travel there smoothly, so it has to do that part by hand.
import { expect, type Locator, test } from '@playwright/test'
import { arrive, tabKey } from './look.ts'
import { SIZES } from './sizes.ts'

for (const size of [SIZES[4], SIZES[2], SIZES[0]]) {
  test.describe(`${size.name}: a link to a place on the page`, () => {
    test.use({ viewport: { width: size.width, height: size.height } })

    test('takes the keyboard there, and the next Tab goes on from there', async ({ page, browserName }) => {
      await arrive(page)
      const ways: Locator[] = [
        page.locator('header.top nav a[href="#today"]'),
        page.locator('a.tag[href="#today"]'),
        page.locator('footer a[href="#today"]'),
      ]
      let pressed = 0
      for (const [at, link] of ways.entries()) {
        // The bar's link is not shown on a phone; there the tag's and the footer's are the ways.
        if (!(await link.isVisible())) continue
        await arrive(page)
        await link.click()
        await expect(page.locator('#today h2')).toBeInViewport()
        const target = page.locator('#today')
        await expect(target, `way ${at}`).toBeFocused()
        // A section is not a control, so it draws no ring.
        expect(await target.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('none')
        await page.keyboard.press(tabKey(browserName))
        // The focus moved on from the list, forward in the page: not back to the next thing in the bar.
        const onward = await page.evaluate(() => {
          const here = document.getElementById('today')
          const now = document.activeElement
          if (here === null || now === null || now === here) return false
          return (here.compareDocumentPosition(now) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
        })
        expect(onward, `way ${at}: where Tab went`).toBe(true)
        pressed++
      }
      // At least the tag's and the footer's are on every size.
      expect(pressed).toBeGreaterThanOrEqual(2)
    })
  })
}
