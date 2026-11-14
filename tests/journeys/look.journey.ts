// How the page looks, at every size, in every engine: the fonts it is set in, the icons, the colours and the touch sizes.
// Each journey measures what the browser really drew, because a stylesheet that reads right can still draw wrong.
import { readFileSync } from 'node:fs'
import { expect, type Page, test } from '@playwright/test'
import { contrast } from '../fixtures/contrast.ts'
import { siteFacts } from './facts.ts'
import {
  arrive,
  colours,
  fitsSideways,
  groundBehind,
  LABEL,
  loadedFonts,
  MEASURE,
  READABLE,
  TITLE,
  TOKENS,
  tabKey,
} from './look.ts'
import { SIZES } from './sizes.ts'
import { watchForTrouble } from './watch.ts'

/** What the page calls a label: set in capitals by the stylesheet, in Onest, at least 13 px. A label is known by its class. */
const LABELS = '.btn, .kicker, .stamp, .tag b, .note, thead th, .title-block dt, footer h3'
/** What the page shows as a measure or a file's words: set in the number font, at least 15 px. */
const MEASURES = '.code, .panel-head, .number, .panel-foot [data-fact]'

/** The two things the claim, the lede and the first button must all do on a phone that has no fonts: be on the first screen. */
async function firstScreenHolds(page: Page): Promise<void> {
  await expect(page.locator('header.top .wordmark')).toBeInViewport({ ratio: 1 })
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport({ ratio: 1 })
  await expect(page.locator('p.lede')).toBeInViewport({ ratio: 1 })
  await expect(page.getByRole('button', { name: 'Play the first game' })).toBeInViewport({ ratio: 1 })
}

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

    test("the game's own picture is left alone", async ({ page }) => {
      await arrive(page)
      const poster = await page.locator('img.poster').evaluate((node) => {
        const s = getComputedStyle(node)
        return {
          filter: s.filter,
          opacity: s.opacity,
          blend: s.mixBlendMode,
          corner: s.borderTopLeftRadius,
          border: s.borderTopWidth,
          fit: s.objectFit,
        }
      })
      expect(poster).toMatchObject({
        filter: 'none',
        opacity: '1',
        blend: 'normal',
        corner: '0px',
        border: '0px',
      })
      // Nothing is cropped: the picture is shown whole.
      expect(['fill', 'contain']).toContain(poster.fit)
      expect(await page.locator('#game').evaluate((node) => getComputedStyle(node).outlineStyle)).toBe(
        'solid',
      )

      await page.getByRole('button', { name: 'Play it' }).click()
      const frame = page.locator('iframe[title="The demo game"]')
      await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing')
      // The Owner's answer: once the game plays, nothing of the site's is drawn round it, so the line is gone.
      expect(await page.locator('#game').evaluate((node) => getComputedStyle(node).outlineStyle)).toBe('none')
      for (const element of [frame, page.locator('#game')]) {
        const style = await element.evaluate((node) => {
          const s = getComputedStyle(node)
          return {
            filter: s.filter,
            opacity: s.opacity,
            blend: s.mixBlendMode,
            corner: s.borderTopLeftRadius,
            border: s.borderTopWidth,
          }
        })
        expect(style).toEqual({ filter: 'none', opacity: '1', blend: 'normal', corner: '0px', border: '0px' })
      }
      // The frame fills its place edge to edge. Rounded: an engine may report the same edge a hair apart for two boxes
      // (Firefox gave 55.99997 for 56 in Cycle 1).
      const edges = async (selector: string): Promise<number[]> => {
        const box = await page.locator(selector).boundingBox()
        return [box?.x, box?.y, box?.width, box?.height].map((edge) => Math.round(edge ?? -1))
      }
      expect(await edges('iframe[title="The demo game"]')).toEqual(await edges('#game'))
    })

    test('everything that can be pressed is big enough for a thumb', async ({ page }) => {
      await arrive(page)
      const pressable = page.locator('a[href], button').filter({ visible: true })
      expect(await pressable.count()).toBeGreaterThanOrEqual(10)
      for (const element of await pressable.all()) {
        const box = await element.boundingBox()
        const name = (await element.textContent())?.trim() ?? ''
        const classes = (await element.getAttribute('class')) ?? ''
        // The main buttons are 52 px, the two small ones 48 and everything else 44. Rounded: Firefox reports a 56 px
        // button as 55.99997.
        const wanted = classes.includes('btn') ? (classes.includes('small') ? 48 : 52) : 44
        expect(Math.round(box?.height ?? 0), name).toBeGreaterThanOrEqual(wanted)
      }
    })

    // A link inside a sentence must stay in its line (it once dropped to a line of its own on a phone and left a gap) and
    // still be 44 px tall for a thumb.
    test('a link in a sentence stays in its line and is still big enough', async ({ page }) => {
      await arrive(page)
      const lines = await page.evaluate(() => {
        const link = document.querySelector('.panel-foot a') as Element
        const rect = link.getClientRects()[0] as DOMRect
        const range = document.createRange()
        range.selectNodeContents(link.previousSibling as ChildNode)
        const words = range.getClientRects()[range.getClientRects().length - 1] as DOMRect
        return {
          apart: Math.abs((rect.top + rect.bottom) / 2 - (words.top + words.bottom) / 2),
          tall: rect.height,
        }
      })
      // Same line: the middles are within a pixel or two, far less than a line apart (27 px).
      expect(lines.apart, 'Read the whole file').toBeLessThanOrEqual(2)
      expect(Math.round(lines.tall), 'Read the whole file').toBeGreaterThanOrEqual(44)
    })

    test('every icon has its words beside it, is hidden from screen readers and is seen against the ground', async ({
      page,
      request,
    }) => {
      await arrive(page)
      // The icons the page asks for: those in index.html, one a place the game runs, one a claim that works today.
      const asked =
        (readFileSync(new URL('../../index.html', import.meta.url), 'utf8').match(/data-icon=/g) ?? [])
          .length +
        (await siteFacts(request)).engines.length +
        (await page.locator('.stamp.works').count())
      await expect(page.locator('svg.icon')).toHaveCount(asked)
      await expect(page.locator('[data-icon]')).toHaveCount(0)
      const shown = await page.locator('svg.icon').filter({ visible: true }).all()
      expect(shown.length).toBeGreaterThanOrEqual(10)
      for (const icon of shown) {
        await expect(icon).toHaveAttribute('aria-hidden', 'true')
        // The words are the icon's neighbours: its parent says something without it.
        expect(
          (await icon.evaluate((svg) => svg.parentElement?.textContent ?? '')).trim().length,
        ).toBeGreaterThan(3)
        const box = await icon.boundingBox()
        expect(Math.round(box?.width ?? 0)).toBeGreaterThanOrEqual(16)
        expect(Math.round(box?.height ?? 0)).toBeGreaterThanOrEqual(16)
        // An icon is an edge, so it needs 3 to 1 against what is behind it.
        const seen = await icon.evaluate((svg) => {
          const clear = (colour: string): boolean => colour === 'transparent' || /,\s*0\)$/.test(colour)
          let ground = 'rgb(255, 255, 255)'
          for (let node = svg.parentElement; node !== null; node = node.parentElement) {
            const colour = getComputedStyle(node).backgroundColor
            if (!clear(colour)) {
              ground = colour
              break
            }
          }
          return { colour: getComputedStyle(svg).color, ground }
        })
        expect(contrast(seen.colour, seen.ground)).toBeGreaterThanOrEqual(3)
      }
      // The buttons' names are still their words alone.
      for (const name of ['Play the first game', 'Play it'])
        await expect(page.getByRole('button', { name, exact: true })).toBeVisible()
    })
  })
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
    await page.route('**/play/', async (route) => {
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
