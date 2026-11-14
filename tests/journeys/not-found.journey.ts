// The 404 page, at every size, in every engine: its words, its colours, its one way home, and that the page says the
// same things a browser's tab and address bar say (dark, paper blue). A missing address is the point, so the only
// "trouble" a journey may see is the 404 itself.
import { expect, test } from '@playwright/test'
import { contrast } from '../fixtures/contrast.ts'
import { arrive, colours, fitsSideways, READABLE, TOKENS } from './look.ts'
import { SIZES } from './sizes.ts'
import { watchForTrouble } from './watch.ts'

for (const size of SIZES) {
  test.describe(size.name, () => {
    test.use({ viewport: { width: size.width, height: size.height } })

    test('the 404 page is a sign on the paper, with one way home', async ({ page }) => {
      const trouble = watchForTrouble(page)
      await arrive(page, '/no-such-page')
      await expect(page).toHaveTitle('Page not found: AutomataFramework')
      const heading = page.getByRole('heading', { level: 1 })
      await expect(heading).toHaveText('This page does not exist.')
      const sentence = page.getByText('The address may be mistyped, or the page may have moved.')
      await expect(sentence).toBeVisible()

      expect(await page.locator('body').evaluate((body) => getComputedStyle(body).backgroundColor)).toBe(
        TOKENS.paper,
      )
      for (const { what, words, ground } of await colours(page, READABLE))
        expect(contrast(words, ground), what).toBeGreaterThanOrEqual(4.5)

      // The way home: marker yellow, big enough for a thumb, one icon, and its name is its words alone.
      const home = page.getByRole('link', { name: 'Go to the home page', exact: true })
      await expect(home).toHaveAttribute('href', '/')
      const [link] = await colours(page, 'a.home')
      expect(link?.words).toBe(TOKENS.marker)
      expect(Math.round((await home.boundingBox())?.height ?? 0)).toBeGreaterThanOrEqual(44)
      await expect(home.locator('svg.icon')).toHaveCount(1)

      // A heading is a label, so it is set in capitals; the sentence and the link are not.
      const transform = (locator: typeof heading): Promise<string> =>
        locator.evaluate((element) => getComputedStyle(element).textTransform)
      expect(await transform(heading)).toBe('uppercase')
      expect(await transform(sentence)).toBe('none')
      expect(await transform(home)).toBe('none')

      expect(await page.locator('meta[name="color-scheme"]').getAttribute('content')).toBe('dark')
      expect(await page.locator('meta[name="theme-color"]').getAttribute('content')).toBe('#0A1F3C')
      expect(await fitsSideways(page)).toBe(true)

      // The address itself is a 404, which is the point; anything else the browser reports is a real problem.
      expect(trouble().filter((line) => !line.includes('404'))).toEqual([])
      await page.screenshot({ path: `tests/journeys/__screenshots__/${size.name}-not-found.png` })
    })
  })
}
