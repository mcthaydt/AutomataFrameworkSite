// Helpers for the journeys that look at how the page is drawn: they wait for the fonts before anything is measured or
// pictured (a late font moves the words), and say which fonts the browser really loaded.
import type { Page } from '@playwright/test'

/** The font for words and labels. */
export const LABEL = 'IBM Plex Sans Condensed'
/** The font for numbers and measures. */
export const MEASURE = 'JetBrains Mono'

/** Opens an address and waits until every font the page asked for so far has arrived (or failed). */
export async function arrive(page: Page, address?: string): Promise<void> {
  await page.goto(address ?? '/')
  await page.evaluate(() => document.fonts.ready)
}

/**
 * Waits until the version line is shown, then for the fonts again. The line arrives after the page's script has fetched
 * `version.json`, and only then does the browser ask for the number font, so `arrive` alone can return before either.
 */
export async function settle(page: Page): Promise<void> {
  await page.locator('#game-version').waitFor({ state: 'visible' })
  await page.evaluate(() => document.fonts.ready)
}

/** Every font face the browser has loaded, as "<family> <weight>", sorted. Quotes round a family are dropped. */
export function loadedFonts(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.fonts]
      .filter((face) => face.status === 'loaded')
      .map((face) => `${face.family.replace(/^["']|["']$/g, '')} ${face.weight}`)
      .sort(),
  )
}

/** The five Blueprint colours as a browser reports them (`rgb(r, g, b)`). The stylesheet's own hex values are in `src/styles.css`. */
export const TOKENS = {
  paper: 'rgb(10, 31, 60)',
  hatch: 'rgb(14, 42, 80)',
  chalk: 'rgb(234, 242, 250)',
  pencil: 'rgb(143, 176, 211)',
  marker: 'rgb(255, 212, 71)',
} as const

/** Everything on the page that says something. A `li` whose words are in a `span` is counted once, by its `span`. */
export const READABLE = 'h1, h2, p, li, span, a, button, [role="status"]'

/** One thing with words on the page: what it is, the colour of its words and the colour behind them. */
export interface Coloured {
  readonly what: string
  readonly words: string
  readonly ground: string
}

/**
 * For every visible element matching `selector` that has words of its own (a text node that is its direct child and is
 * not only spaces): what it is (its tag and its first 30 characters), the computed `color` of its words, and the
 * computed `background-color` of the nearest ancestor-or-self whose background is not fully transparent.
 */
export function colours(page: Page, selector: string): Promise<Coloured[]> {
  return page.evaluate((query) => {
    const clear = (colour: string): boolean => colour === 'transparent' || /,\s*0\)$/.test(colour)
    const groundOf = (start: Element | null): string => {
      for (let node = start; node !== null; node = node.parentElement) {
        const ground = getComputedStyle(node).backgroundColor
        if (!clear(ground)) return ground
      }
      return 'rgb(255, 255, 255)'
    }
    const found: { what: string; words: string; ground: string }[] = []
    for (const element of document.querySelectorAll(query)) {
      const style = getComputedStyle(element)
      if (style.visibility === 'hidden' || element.getClientRects().length === 0) continue
      const own = [...element.childNodes].some(
        (node) => node.nodeType === 3 && (node.textContent ?? '').trim() !== '',
      )
      if (!own) continue
      found.push({
        what: `${element.tagName.toLowerCase()} "${(element.textContent ?? '').trim().slice(0, 30)}"`,
        words: style.color,
        ground: groundOf(element),
      })
    }
    return found
  }, selector)
}

/**
 * The colour a focus ring is seen against: the same walk as `colours`, starting at the element's parent, because a ring
 * is drawn outside its element. Without a selector the element is the one that has the focus.
 */
export function groundBehind(page: Page, selector?: string): Promise<string> {
  return page.evaluate((query) => {
    const clear = (colour: string): boolean => colour === 'transparent' || /,\s*0\)$/.test(colour)
    const element = query === undefined ? document.activeElement : document.querySelector(query)
    for (let node = element?.parentElement ?? null; node !== null; node = node.parentElement) {
      const ground = getComputedStyle(node).backgroundColor
      if (!clear(ground)) return ground
    }
    return 'rgb(255, 255, 255)'
  }, selector)
}

/** True while the document is no wider than the window: no sideways scrolling. */
export function fitsSideways(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)
}

/** The key that moves the keyboard's focus to the next link or button. WebKit reaches links only with Alt held. */
export function tabKey(browserName: string): string {
  return browserName === 'webkit' ? 'Alt+Tab' : 'Tab'
}
