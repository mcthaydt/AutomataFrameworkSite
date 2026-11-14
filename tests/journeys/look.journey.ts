// How the page looks, at every size, in every engine: the fonts it is set in, the icons, the colours and the touch sizes.
// Each journey measures what the browser really drew, because a stylesheet that reads right can still draw wrong.
import { expect, test } from '@playwright/test'
import { contrast } from '../fixtures/contrast.ts'
import {
  arrive,
  colours,
  fitsSideways,
  groundBehind,
  LABEL,
  loadedFonts,
  MEASURE,
  READABLE,
  settle,
  TITLE,
  TOKENS,
  tabKey,
} from './look.ts'
import { SIZES } from './sizes.ts'
import { watchForTrouble } from './watch.ts'

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
      await expect(page.locator('#game-version')).toBeVisible()
      await expect
        .poll(() => loadedFonts(page))
        .toEqual([`${TITLE} 100 900`, `${MEASURE} 400`, `${LABEL} 100 900`])
      const family = (selector: string): Promise<string> =>
        page.locator(selector).evaluate((element) => getComputedStyle(element).fontFamily)
      expect(await family('h1')).toContain(TITLE)
      expect(await family('body')).toContain(LABEL)
      expect(await family('#game-version')).toContain(MEASURE)
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
      expect(await style('#game-version', 'color')).toBe(TOKENS.quiet)
      expect(await page.locator('meta[name="color-scheme"]').getAttribute('content')).toBe('dark')
      expect(await page.locator('meta[name="theme-color"]').getAttribute('content')).toBe('#112F2C')
    })

    test('every word can be read: 4.5 to 1 or more against what is behind it', async ({ page }) => {
      await arrive(page)
      await settle(page)
      const found = await colours(page, READABLE)
      expect(found.length).toBeGreaterThanOrEqual(16)
      for (const { what, words, ground } of found)
        expect(contrast(words, ground), what).toBeGreaterThanOrEqual(4.5)
    })

    test('the touch colour means you can touch it, and only that', async ({ page }) => {
      await arrive(page)
      // Every link and the button is the touch colour, in its words or in its ground...
      for (const { what, words, ground } of await colours(page, 'a, button'))
        expect([words, ground], what).toContain(TOKENS.touch)
      // ...and nothing else on the page is.
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

    test('labels are in capitals and sentences are not', async ({ page }) => {
      await arrive(page)
      const transform = (selector: string): Promise<string[]> =>
        page
          .locator(selector)
          .evaluateAll((all) => all.map((element) => getComputedStyle(element).textTransform))
      for (const label of ['button.play', 'footer a'])
        expect(new Set(await transform(label)), label).toEqual(new Set(['uppercase']))
      for (const sentence of ['h1', 'h2', 'p.lede', 'ul.help li', 'p.playing', 'ul.next li', 'ul.next a'])
        expect(new Set(await transform(sentence)), sentence).toEqual(new Set(['none']))
      // Words are at least 18 px, everywhere.
      const sizes = await page
        .locator(READABLE)
        .evaluateAll((all) => all.map((element) => parseFloat(getComputedStyle(element).fontSize)))
      expect(Math.min(...sizes)).toBeGreaterThanOrEqual(18)
    })

    test('the Play button is the touch-coloured thing, with a ring in the words colour when the keyboard reaches it', async ({
      page,
    }) => {
      await arrive(page)
      const button = page.getByRole('button', { name: 'Play the game' })
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
      // The ring is drawn outside the button, so it is seen against the sheet behind it, not against the touch colour.
      expect(await groundBehind(page, 'button.play')).toBe(TOKENS.raised)
      expect(contrast(style.ring, TOKENS.raised)).toBeGreaterThanOrEqual(3)
    })

    test("the game's own picture is left alone", async ({ page }) => {
      await arrive(page)
      await page.getByRole('button', { name: 'Play the game' }).click()
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
      await settle(page)
      const pressable = page.locator('a[href], button').filter({ visible: true })
      expect(await pressable.count()).toBeGreaterThanOrEqual(4)
      for (const element of await pressable.all()) {
        const box = await element.boundingBox()
        const name = (await element.textContent())?.trim() ?? ''
        // Rounded: Firefox reports a 56 px button as 55.99997.
        expect(Math.round(box?.height ?? 0), name).toBeGreaterThanOrEqual(name === 'Play the game' ? 56 : 44)
      }
    })

    // A link inside a sentence must stay in its line (it once dropped to a line of its own on a phone and left a gap) and
    // still be 44 px tall for a thumb. The same goes for the number beside "Game version:".
    test('a link in a sentence stays in its line and is still big enough', async ({ page }) => {
      await arrive(page)
      await settle(page)
      const lines = await page.evaluate(() => {
        // The vertical middle of the first line of `link` and of the words just before it in the same element.
        const middles = (link: Element, before: ChildNode): { link: number; words: number; tall: number } => {
          const rect = link.getClientRects()[0] as DOMRect
          const range = document.createRange()
          range.selectNodeContents(before)
          const words = range.getClientRects()[range.getClientRects().length - 1] as DOMRect
          return {
            link: (rect.top + rect.bottom) / 2,
            words: (words.top + words.bottom) / 2,
            tall: rect.height,
          }
        }
        const sentence = document.querySelector('.next a') as Element
        // The stand-in game's version is plain text, not a link; only the real game's is.
        const version = document.querySelector('#game-version a')
        return {
          sentence: middles(sentence, sentence.previousSibling as ChildNode),
          version: version === null ? undefined : middles(version, version.previousSibling as ChildNode),
        }
      })
      // Same line: the middles are within a pixel or two, far less than a line apart (27 px).
      expect(Math.abs(lines.sentence.link - lines.sentence.words), 'See how it is made').toBeLessThanOrEqual(
        2,
      )
      if (lines.version !== undefined) {
        expect(Math.abs(lines.version.link - lines.version.words), 'Game version').toBeLessThanOrEqual(2)
      }
      expect(Math.round(lines.sentence.tall), 'See how it is made').toBeGreaterThanOrEqual(44)
    })

    test('every icon has its words beside it and is hidden from screen readers', async ({ page }) => {
      await arrive(page)
      const icons = page.locator('svg.icon')
      await expect(icons).toHaveCount(6)
      await expect(page.locator('[data-icon]')).toHaveCount(0)
      for (const icon of await icons.all()) {
        await expect(icon).toHaveAttribute('aria-hidden', 'true')
        // The words are the icon's neighbours: its parent says something without it.
        expect(
          (await icon.evaluate((svg) => svg.parentElement?.textContent ?? '')).trim().length,
        ).toBeGreaterThan(3)
        // ...and it is the colour of those words (the SVG's fill is currentColor, and no rule gives an icon its own).
        expect(
          await icon.evaluate(
            (svg) => getComputedStyle(svg).color === getComputedStyle(svg.parentElement as Element).color,
          ),
        ).toBe(true)
        const box = await icon.boundingBox()
        expect(Math.round(box?.width ?? 0)).toBeGreaterThanOrEqual(20)
        expect(Math.round(box?.height ?? 0)).toBeGreaterThanOrEqual(20)
      }
      // The button's name is still its words alone.
      await expect(page.getByRole('button', { name: 'Play the game', exact: true })).toBeVisible()
    })
  })
}

// Review Focus 1: a slow line or a blocker means the fonts never come. The page must read in the device's own font, and
// the heading, the lede and the Play button must still fit before any scroll. Phone, upright and sideways.
for (const size of [SIZES[0], SIZES[1]]) {
  test.describe(`${size.name}: no fonts`, () => {
    test.use({ viewport: { width: size.width, height: size.height } })

    test('with the fonts blocked, the page still reads and still fits before any scroll', async ({
      page,
    }) => {
      await page.route(/\.woff2?(\?|$)/, (route) => route.abort())
      await page.goto('/')
      await expect(page.getByRole('heading', { level: 1 })).toBeInViewport({ ratio: 1 })
      await expect(page.locator('p.lede')).toBeInViewport({ ratio: 1 })
      await expect(page.getByRole('button', { name: 'Play the game' })).toBeInViewport({ ratio: 1 })
      expect(await loadedFonts(page)).toEqual([])
      expect(await fitsSideways(page)).toBe(true)
    })
  })
}

// Review Focus 2: a narrow phone, 320 px wide. The heading in capitals, set a little apart, must not run off the side.
test.describe('phone-320x568: a 320 px phone', () => {
  test.use({ viewport: { width: 320, height: 568 } })

  test('nothing runs off the side, and the first screen still holds the heading, the lede and the button', async ({
    page,
  }) => {
    await arrive(page)
    expect(await fitsSideways(page)).toBe(true)
    const heading = page.getByRole('heading', { level: 1 })
    const box = await heading.boundingBox()
    expect(Math.round((box?.x ?? 0) + (box?.width ?? 0))).toBeLessThanOrEqual(320)
    await expect(heading).toBeInViewport({ ratio: 1 })
    await expect(page.locator('p.lede')).toBeInViewport({ ratio: 1 })
    await expect(page.getByRole('button', { name: 'Play the game' })).toBeInViewport({ ratio: 1 })
  })
})

// Review Focus 3: JavaScript off. The look and the icons are in the page itself, and the note about JavaScript must read.
test.describe('phone-390x844: with JavaScript off', () => {
  test.use({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false })

  test('the page still looks like itself, shows its icons and says what to do', async ({ page }) => {
    await page.goto('/')
    expect(await page.locator('body').evaluate((body) => getComputedStyle(body).backgroundColor)).toBe(
      TOKENS.ground,
    )
    await expect(page.locator('svg.icon')).toHaveCount(6)
    const note = page.locator('p.no-script')
    await expect(note).toBeVisible()
    const [found] = await colours(page, 'p.no-script')
    expect(contrast(found?.words ?? '', found?.ground ?? '')).toBeGreaterThanOrEqual(4.5)
    await expect(page.getByRole('button', { name: 'Play the game' })).toBeHidden()
  })
})

// Review Focus 4: a person using the keyboard. Every link and the Play button must show the ring when Tab reaches
// it, at 3 to 1 or more against what is behind it.
test.describe('tablet-820x1180: the ring shows on everything Tab reaches', () => {
  test.use({ viewport: { width: 820, height: 1180 } })

  test('every stop has the ring', async ({ page, browserName }) => {
    await arrive(page)
    // The real game's version line is a link, and it must be there before the links are counted.
    await settle(page)
    const stops = await page.locator('a[href], button:not([hidden])').count()
    expect(stops).toBeGreaterThanOrEqual(4)
    // Where Tab has been, by the link's address and words: each stop must be a different thing, so Tab cannot land on
    // one link twice and skip another without this showing.
    const reached = new Set<string>()
    for (let stop = 1; stop <= stops; stop++) {
      await page.keyboard.press(tabKey(browserName))
      const focused = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement
        const style = getComputedStyle(element)
        return {
          which: `${element.tagName} ${element.getAttribute('href') ?? ''} ${(element.textContent ?? '').trim()}`,
          visible: element.matches(':focus-visible'),
          ring: style.outlineColor,
          width: style.outlineWidth,
          name: (element.textContent ?? '').trim().slice(0, 30),
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

  test('"Loading the game…" is a note on the ground, and then it is gone', async ({ page }) => {
    let release: () => void = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    await page.route('**/play/', async (route) => {
      await gate
      await route.continue()
    })
    await arrive(page)
    await page.getByRole('button', { name: 'Play the game' }).click()
    const note = page.getByRole('status')
    await expect(note).toHaveText('Loading the game…')
    const look = await note.evaluate((element) => {
      const s = getComputedStyle(element)
      return { words: s.color, ground: s.backgroundColor, edge: s.borderTopColor, capitals: s.textTransform }
    })
    expect(look).toEqual({
      words: TOKENS.words,
      ground: TOKENS.ground,
      edge: TOKENS.words,
      capitals: 'uppercase',
    })
    // The blank frame is not shown while the game loads (WebKit paints a blank frame white), so the note sits on the sheet.
    expect(
      await page
        .locator('iframe[title="The demo game"]')
        .evaluate((element) => getComputedStyle(element).visibility),
    ).toBe('hidden')
    await page.screenshot({ path: 'tests/journeys/__screenshots__/phone-390x844-loading.png' })
    release()
    await expect(note).toBeHidden()
    // ...and once the game plays, its frame is shown.
    await expect(page.locator('iframe[title="The demo game"]')).toBeVisible()
  })
})
