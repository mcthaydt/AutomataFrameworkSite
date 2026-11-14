// The stylesheet's colours, read as text: they are palette No. 325's four and the two shades mixed from them, and no
// others; dark is the only theme, and the pairs the page puts together are readable. A browser draws the rest; the
// journeys measure that.
import { existsSync, readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { contrast } from '../fixtures/contrast.ts'

// The book's four (A Dictionary of Color Combinations, No. 325) and the two shades the page mixes from them.
const BOOK = { ground: '#112F2C', words: '#FBE6A0', touch: '#E2B540', mark: '#DA525D' }
const MIXED = { raised: '#1F3A33', quiet: '#B5AF7D' }
const SPEC = { ...BOOK, ...MIXED }
const css = readFileSync(new URL('../../src/styles.css', import.meta.url), 'utf8')
const token = (name: string): string =>
  new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6});`).exec(css)?.[1]?.toUpperCase() ?? ''

test.each(Object.entries(SPEC))("%s is the spec's colour, %s", (name, value) =>
  expect(token(name)).toBe(value),
)

// Each mixed shade is the words colour let into the ground, channel by channel, rounded.
const mix = (from: string, to: string, share: number): string => {
  const channel = (hex: string, at: number): number => Number.parseInt(hex.slice(at, at + 2), 16)
  return `#${[1, 3, 5]
    .map((at) => Math.round(channel(from, at) + (channel(to, at) - channel(from, at)) * share))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`
}

test('the two mixed shades are the words let into the ground', () => {
  expect(mix(BOOK.ground, BOOK.words, 0.06)).toBe(MIXED.raised)
  expect(mix(BOOK.ground, BOOK.words, 0.7)).toBe(MIXED.quiet)
})

test('those six are the only colours the stylesheet names', () => {
  expect((css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).map((c) => c.toUpperCase()).sort()).toEqual(
    Object.values(SPEC).sort(),
  )
  expect(css).not.toMatch(/\brgba?\(|\bhsla?\(/)
})

// A colour written as a word (`color: white`) would slip past the test above. The sheet needs no colour keyword but
// `transparent` and `currentColor`; `none` and the line style `solid` are not colours, nor is a `var(--…)` or a length.
test('no colour is written as a word', () => {
  const COLOUR_PROPERTY =
    /(?:^|[;{\s])(?:color|background(?:-color)?|border(?:-(?:top|right|bottom|left))?(?:-color)?|outline(?:-color)?|fill|stroke|caret-color|accent-color)\s*:\s*([^;}]+)/gm
  const allowed = new Set(['transparent', 'currentcolor', 'none', 'solid', 'dashed'])
  const words: string[] = []
  for (const [, value] of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(COLOUR_PROPERTY)) {
    for (const part of (value ?? '').replace(/var\([^)]*\)/g, ' ').split(/[\s,/()]+/)) {
      if (/^[a-z-]+$/i.test(part) && !allowed.has(part.toLowerCase())) {
        words.push(part)
      }
    }
  }
  expect(words).toEqual([])
})

test('dark is the only theme', () => {
  expect(css).toMatch(/color-scheme:\s*dark;/)
  expect(css).not.toContain('prefers-color-scheme')
  expect(css).not.toContain('--sky')
})

// The one colour named in the pages: a browser reads it before any stylesheet, so it is held to the ground here.
test.each(['index.html', '404.html'])(
  '%s tells the browser the ground colour, and names no other',
  (file) => {
    const html = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8')
    expect(html).toContain(`<meta name="theme-color" content="${BOOK.ground}" />`)
    expect(html).toContain('<meta name="color-scheme" content="dark" />')
    expect(html.match(/#[0-9a-fA-F]{6}\b/g)).toEqual([BOOK.ground])
  },
)

// The tab icon is a square in the touch colour. Task 5 adds the file; until then there is nothing to read.
test.skipIf(!existsSync(new URL('../../public/icon.svg', import.meta.url)))(
  'the tab icon names the touch colour and no other',
  () => {
    const svg = readFileSync(new URL('../../public/icon.svg', import.meta.url), 'utf8')
    expect(svg.match(/#[0-9a-fA-F]{6}\b/gi)?.map((c) => c.toUpperCase())).toEqual([BOOK.touch])
  },
)

test('corners are 2 px', () => {
  expect(css.match(/border-radius:\s*([^;]+);/g)?.every((line) => line.includes('var(--corner)'))).toBe(true)
  expect(css).toMatch(/--corner:\s*2px;/)
})

// The only shadow is the hard offset under the two panels, in the raised colour, with no blur.
test('a shadow is a hard offset in the raised colour', () => {
  const shadows = [...css.matchAll(/box-shadow:\s*([^;]+);/g)].map((match) => match[1] ?? '')
  expect(shadows.every((value) => /^\d+px \d+px 0 var\(--raised\)$/.test(value.trim()))).toBe(true)
})

test('the contrast sum agrees with known pairs', () => {
  expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
  expect(contrast('rgb(17, 47, 44)', 'rgb(251, 230, 160)')).toBeCloseTo(11.54, 1)
})

test.each([
  ['words', 'ground', 11.5],
  ['words', 'raised', 9.8],
  ['quiet', 'ground', 6.3],
  ['quiet', 'raised', 5.4],
  ['touch', 'ground', 7.4],
  ['touch', 'raised', 6.3],
  ['ground', 'touch', 7.4],
  // Mark carries edges and icons only (3 to 1), never words.
  ['mark', 'ground', 3.6],
  ['mark', 'raised', 3.1],
] as const)('%s on %s is at least %d to 1', (words, ground, least) =>
  expect(contrast(SPEC[words], SPEC[ground])).toBeGreaterThanOrEqual(least),
)
