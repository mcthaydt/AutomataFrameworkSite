// How the page looks, at every size, in every engine: the fonts it is set in, the colours, the type and the spacing.
// Each journey measures what the browser really drew, because a stylesheet that reads right can still draw wrong. What
// a thumb meets (targets, icons, the game's picture) is in `touch.journey.ts`; what happens when something is missing
// (no fonts, no script, a slow game, a 320 px phone) is in `fallbacks.journey.ts`.
import { expect, test } from '@playwright/test'
import { contrast } from '../fixtures/contrast.ts'
import {
  arrive,
  colours,
  groundBehind,
  LABEL,
  loadedFonts,
  MEASURE,
  READABLE,
  TITLE,
  TOKENS,
} from './look.ts'
import { SIZES } from './sizes.ts'
import { watchForTrouble } from './watch.ts'

/** What the page calls a label: set in capitals by the stylesheet, in Onest, at least 13 px. A label is known by its class. */
const LABELS = '.btn, .kicker, .stamp, .tag b, .note, thead th, .title-block dt, footer h3'
/** What the page shows as a measure or a file's words: set in the number font, at least 15 px. */
const MEASURES = '.code, .panel-head, .number, .panel-foot [data-fact]'

for (const size of SIZES) {
  test.describe(size.name, () => {
    test.use({ viewport: { width: size.width, height: size.height } })

    test("the words are set in the site's own fonts, from the site's own address", async ({
      page,
      baseURL,
    }) => {
      const trouble = watchForTrouble(page)
      const asked: string[] = []
      page.on('request', (request) => asked.push(request.url()))
      await arrive(page)
      await expect
        .poll(() => loadedFonts(page))
        .toEqual([`${TITLE} 100 900`, `${MEASURE} 400`, `${LABEL} 100 900`])
      const family = (selector: string): Promise<string> =>
        page
          .locator(selector)
          .first()
          .evaluate((element) => getComputedStyle(element).fontFamily)
      expect(await family('h1')).toContain(TITLE)
      expect(await family('.wordmark')).toContain(TITLE)
      expect(await family('body')).toContain(LABEL)
      expect(await family('.btn')).toContain(LABEL)
      expect(await family('.code')).toContain(MEASURE)
      expect(await family('.number')).toContain(MEASURE)
      // Nothing is fetched from anywhere but this site, and no font is an inlined data: address.
      const origin = new URL(baseURL ?? '').origin
      expect(asked.filter((url) => !url.startsWith(`${origin}/`) && url !== 'data:,')).toEqual([])
      expect(asked.filter((url) => /\.woff2(\?|$)/.test(url)).length).toBeGreaterThanOrEqual(3)
      expect(trouble()).toEqual([])
    })

    test('the page is deep green with yellow words, whatever the device is set to', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await arrive(page)
      const style = (selector: string, property: string): Promise<string> =>
        page
          .locator(selector)
          .first()
          .evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property)
      expect(await style('body', 'background-color')).toBe(TOKENS.ground)
      expect(await style('body', 'color')).toBe(TOKENS.words)
      expect(await style('#game', 'background-color')).toBe(TOKENS.raised)
      expect(await style('#game', 'outline-color')).toBe(TOKENS.words)
      expect(await style('#game', 'outline-style')).toBe('solid')
      expect(await style('.numbers', 'background-color')).toBe(TOKENS.raised)
      expect(await style('.closing', 'background-color')).toBe(TOKENS.raised)
      expect(await style('.lede', 'color')).toBe(TOKENS.quiet)
      expect(await page.locator('meta[name="color-scheme"]').getAttribute('content')).toBe('dark')
      expect(await page.locator('meta[name="theme-color"]').getAttribute('content')).toBe('#112F2C')
    })

    test('every word can be read: 4.5 to 1 or more against what is behind it', async ({ page }) => {
      await arrive(page)
      const found = await colours(page, READABLE)
      expect(found.length).toBeGreaterThanOrEqual(40)
      for (const { what, words, ground } of found)
        expect(contrast(words, ground), what).toBeGreaterThanOrEqual(4.5)
    })

    test('the touch colour means you can touch it, and only that', async ({ page }) => {
      await arrive(page)
      // Every link and button but the wordmark is the touch colour, in its words or in its ground...
      const touchable = await colours(page, 'a:not(.wordmark), button')
      expect(touchable.length).toBeGreaterThanOrEqual(10)
      for (const { what, words, ground } of touchable) expect([words, ground], what).toContain(TOKENS.touch)
      // ...and nothing else on the page is, the wordmark and the game's frame apart.
      const others = await page.evaluate((touch) => {
        const found: string[] = []
        for (const element of document.querySelectorAll('body *')) {
          if (element.closest('a, button, iframe')) continue
          const style = getComputedStyle(element)
          if ([style.color, style.backgroundColor, style.borderTopColor, style.outlineColor].includes(touch))
            found.push(element.tagName)
        }
        return found
      }, TOKENS.touch)
      expect(others).toEqual([])
    })

    test('the mark colour is an edge or an icon and never the colour of any words', async ({ page }) => {
      await arrive(page)
      const words = await page.evaluate((mark) => {
        const found: string[] = []
        for (const element of document.querySelectorAll('body *')) {
          const own = [...element.childNodes].some(
            (node) => node.nodeType === 3 && (node.textContent ?? '').trim() !== '',
          )
          if (own && getComputedStyle(element).color === mark) found.push(element.tagName)
        }
        return found
      }, TOKENS.mark)
      expect(words).toEqual([])
    })

    test('a line that divides is never the colour of the ground it lies on', async ({ page }) => {
      await arrive(page)
      const lost = await page.evaluate(() => {
        const clear = (colour: string): boolean => colour === 'transparent' || /,\s*0\)$/.test(colour)
        const found: string[] = []
        for (const element of document.querySelectorAll('body *')) {
          if (element.getClientRects().length === 0) continue
          const style = getComputedStyle(element)
          let ground = 'rgb(255, 255, 255)'
          for (let node: Element | null = element; node !== null; node = node.parentElement) {
            const colour = getComputedStyle(node).backgroundColor
            if (!clear(colour)) {
              ground = colour
              break
            }
          }
          for (const side of ['Top', 'Right', 'Bottom', 'Left'] as const) {
            const width = parseFloat(style[`border${side}Width`])
            const colour = style[`border${side}Color`]
            if (width > 0 && style[`border${side}Style`] !== 'none' && colour === ground)
              found.push(`${element.tagName}.${element.className} ${side}`)
          }
        }
        return found
      })
      expect(lost).toEqual([])
      // The two rows of cards that sit on the raised ground are divided by the ground colour.
      const between = (selector: string, side: 'Left' | 'Top'): Promise<string[]> =>
        page
          .locator(selector)
          .evaluateAll(
            (all, which) =>
              all.map((element) =>
                getComputedStyle(element).getPropertyValue(`border-${which.toLowerCase()}-color`),
              ),
            side,
          )
      const numbers = await between('.numbers > div:nth-child(2)', 'Left')
      const claims = await between('.claim:nth-child(2)', size.width >= 1024 ? 'Left' : 'Top')
      expect([...numbers, ...claims].every((colour) => colour === TOKENS.ground)).toBe(true)
    })

    test('labels are in capitals and sentences are not', async ({ page }) => {
      await arrive(page)
      const transform = (selector: string): Promise<string[]> =>
        page
          .locator(selector)
          .evaluateAll((all) => all.map((element) => getComputedStyle(element).textTransform))
      for (const label of LABELS.split(', '))
        expect(new Set(await transform(label)), label).toEqual(new Set(['uppercase']))
      for (const sentence of [
        'h1',
        'h2',
        '.claim h3',
        '.lede',
        '.sub',
        '.points li',
        '.claims p',
        '.wordmark',
        'nav a',
        '.how',
        '.panel-head',
        '.status',
      ])
        expect(new Set(await transform(sentence)), sentence).toEqual(new Set(['none']))
    })

    test('labels are at least 13 px, files and numbers 15, everything else 18, and the claim at most 84', async ({
      page,
    }) => {
      await arrive(page)
      const sizes = await page.evaluate(
        ([labels, measures, readable]) => {
          const found = { labels: [] as number[], measures: [] as number[], words: [] as number[] }
          for (const element of document.querySelectorAll(readable as string)) {
            const style = getComputedStyle(element)
            if (style.visibility === 'hidden' || element.getClientRects().length === 0) continue
            const own = [...element.childNodes].some(
              (node) => node.nodeType === 3 && (node.textContent ?? '').trim() !== '',
            )
            if (!own) continue
            const px = parseFloat(style.fontSize)
            // A label's own words are measured as a label even when the label is in a file panel's row.
            if (element.closest(labels as string)) found.labels.push(px)
            else if (element.closest(measures as string)) found.measures.push(px)
            else found.words.push(px)
          }
          const claim = parseFloat(getComputedStyle(document.querySelector('h1') as Element).fontSize)
          return { ...found, claim }
        },
        [LABELS, MEASURES, READABLE],
      )
      expect(Math.min(...sizes.labels)).toBeGreaterThanOrEqual(13)
      expect(Math.min(...sizes.measures)).toBeGreaterThanOrEqual(15)
      expect(Math.min(...sizes.words)).toBeGreaterThanOrEqual(18)
      expect(sizes.claim).toBeLessThanOrEqual(84)
      expect(sizes.claim).toBeGreaterThanOrEqual(32)
      // A label is Onest's, never the number font or the title font.
      const families = await page
        .locator(LABELS)
        .evaluateAll((all) => all.map((element) => getComputedStyle(element).fontFamily))
      for (const family of families) expect(family).toContain(LABEL)
    })

    // Audit M5: on a phone "360 steps" and "3 small files" broke into two lines and "4 places" and "MIT" did not.
    test('each of the four numbers stands on one line, so every cell has the same heading', async ({
      page,
    }) => {
      await arrive(page)
      const heights = await page
        .locator('.numbers dt')
        .evaluateAll((all) => all.map((one) => Math.round(one.getBoundingClientRect().height)))
      expect(heights).toHaveLength(4)
      expect(new Set(heights).size, `heights ${heights}`).toBe(1)
    })

    // Audit M4: the version's link was a 44 px line and sat 8 px lower than the words beside it.
    test('the words of the title block sit on one line, whatever the link is made of', async ({ page }) => {
      await arrive(page)
      const tops = await page.evaluate(() =>
        [...document.querySelectorAll('.title-block > div:nth-child(-n + 2) dd')].map((one) => {
          // The first text inside the cell, whatever element it is in: a range over the cell itself would count a link's
          // padding as part of its words.
          const words = document.createTreeWalker(one, NodeFilter.SHOW_TEXT).nextNode()
          if (words === null) return -1
          const range = document.createRange()
          range.selectNodeContents(words)
          return Math.round(range.getClientRects()[0]?.top ?? -1)
        }),
      )
      expect(tops).toHaveLength(2)
      expect(tops[0]).toBe(tops[1])
    })

    test('sections are 128 px apart at 1024 px and wider, and 80 px apart below', async ({ page }) => {
      await arrive(page)
      const padding = await page
        .locator('.part, .closing')
        .evaluateAll((all) =>
          all.map((element) => [
            getComputedStyle(element).paddingTop,
            getComputedStyle(element).paddingBottom,
          ]),
        )
      expect(padding).toHaveLength(4)
      const wanted = size.width >= 1024 ? '128px' : '80px'
      for (const [top, bottom] of padding) expect([top, bottom]).toEqual([wanted, wanted])
    })

    test('a stamp that is done is a crooked mark-coloured one, and one that is not is a dashed one', async ({
      page,
    }) => {
      await arrive(page)
      const look = (selector: string): Promise<Record<string, string>> =>
        page
          .locator(selector)
          .first()
          .evaluate((element) => {
            const s = getComputedStyle(element)
            return {
              width: s.borderTopWidth,
              style: s.borderTopStyle,
              edge: s.borderTopColor,
              words: s.color,
              turned: s.rotate,
            }
          })
      expect(await look('.stamp.works')).toEqual({
        width: '2px',
        style: 'solid',
        edge: TOKENS.mark,
        words: TOKENS.words,
        turned: '-3deg',
      })
      expect(await look('.stamp.building')).toEqual({
        width: '1px',
        style: 'dashed',
        edge: TOKENS.quiet,
        words: TOKENS.quiet,
        turned: 'none',
      })
    })

    test('the main Play button is touch-coloured, with a ring in the words colour when the keyboard reaches it', async ({
      page,
    }) => {
      await arrive(page)
      const button = page.getByRole('button', { name: 'Play the first game' })
      await button.focus()
      expect(await button.evaluate((element) => element.matches(':focus-visible'))).toBe(true)
      const style = await button.evaluate((element) => {
        const s = getComputedStyle(element)
        return {
          ground: s.backgroundColor,
          words: s.color,
          ring: s.outlineColor,
          width: parseFloat(s.outlineWidth),
          corner: s.borderTopLeftRadius,
        }
      })
      expect(style).toEqual({
        ground: TOKENS.touch,
        words: TOKENS.ground,
        ring: TOKENS.words,
        width: 3,
        corner: '2px',
      })
      // The ring is drawn outside the button, so it is seen against the ground behind it, not against the touch colour.
      expect(contrast(style.ring, await groundBehind(page, '.actions .btn.main'))).toBeGreaterThanOrEqual(3)
    })
  })
}
