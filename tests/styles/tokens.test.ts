// The stylesheet's colours, read as text: they are the spec's five and no others, dark is the only theme, and the
// pairs the page puts together are readable. A browser draws the rest; the journeys measure that.
import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { contrast } from '../fixtures/contrast.ts'

const SPEC = { paper: '#0A1F3C', hatch: '#0E2A50', chalk: '#EAF2FA', pencil: '#8FB0D3', marker: '#FFD447' }
const css = readFileSync(new URL('../../src/styles.css', import.meta.url), 'utf8')
const token = (name: string): string =>
  new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6});`).exec(css)?.[1]?.toUpperCase() ?? ''

test.each(Object.entries(SPEC))("%s is the spec's colour, %s", (name, value) =>
  expect(token(name)).toBe(value),
)

test('those five are the only colours the stylesheet names', () => {
  expect((css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).map((c) => c.toUpperCase()).sort()).toEqual(
    Object.values(SPEC).sort(),
  )
  expect(css).not.toMatch(/\brgba?\(|\bhsla?\(/)
})

test('dark is the only theme', () => {
  expect(css).toMatch(/color-scheme:\s*dark;/)
  expect(css).not.toContain('prefers-color-scheme')
  expect(css).not.toContain('--sky')
})

// The one colour named outside the stylesheet: a browser reads it before any stylesheet, so it is held to paper here.
test.each(['index.html', '404.html'])('%s tells the browser the paper colour, and names no other', (file) => {
  const html = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8')
  expect(html).toContain(`<meta name="theme-color" content="${SPEC.paper}" />`)
  expect(html).toContain('<meta name="color-scheme" content="dark" />')
  expect(html.match(/#[0-9a-fA-F]{6}\b/g)).toEqual([SPEC.paper])
})

test('nothing has a shadow, and corners are 2 px', () => {
  expect(css).not.toContain('box-shadow')
  expect(css.match(/border-radius:\s*([^;]+);/g)?.every((line) => line.includes('var(--corner)'))).toBe(true)
  expect(css).toMatch(/--corner:\s*2px;/)
})

test('the contrast sum agrees with known pairs', () => {
  expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
  expect(contrast('rgb(10, 31, 60)', 'rgb(234, 242, 250)')).toBeCloseTo(14.58, 1)
})

test.each([
  ['chalk', 'paper', 14.5],
  ['chalk', 'hatch', 12.6],
  ['pencil', 'paper', 7.3],
  ['pencil', 'hatch', 6.3],
  ['marker', 'paper', 11.5],
  ['marker', 'hatch', 10],
  ['paper', 'marker', 11.5],
] as const)('%s on %s is at least %d to 1', (words, ground, least) =>
  expect(contrast(SPEC[words], SPEC[ground])).toBeGreaterThanOrEqual(least),
)
