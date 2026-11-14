import { expect, test } from 'vitest'
import { CLAIMS } from '#src/features/claims/claims.ts'
import type { GameFacts } from '#src/features/facts/facts.ts'
import { claimCards, engineRows, escapeHtml, levelFile } from '#src/features/fill/blocks.ts'

const REAL: GameFacts = {
  name: 'Crate Game',
  commit: 'fixture',
  files: ['content/levels/level-1.json'],
  licence: 'MIT',
  engines: ['Node', 'Chrome', 'Safari', 'Firefox'],
  level: {
    path: 'content/levels/level-1.json',
    id: 'level-1',
    width: 16,
    height: 9,
    firstRow: '#..............#',
    lastRow: '################',
    thing: { character: 'crate', x: 9.5, y: 7.5 },
  },
  replay: { path: 'replays/level-1.json', steps: 360, ending: '77be68a6e1859241' },
}
const withLevel = (level: Partial<GameFacts['level']>): GameFacts => ({
  ...REAL,
  level: { ...REAL.level, ...level },
})

/** The text of each `.row`'s code, and its note when it has one. */
function rowsOf(html: string): { text: string; note?: string }[] {
  return [
    ...html.matchAll(
      /<div class="row"><code>(.*?)<\/code>(?:<i class="leader"><\/i><span class="note">(.*?)<\/span>)?<\/div>/g,
    ),
  ].map((match) => ({
    text: (match[1] ?? '').replace(/&quot;/g, '"'),
    ...(match[2] === undefined ? {} : { note: match[2] }),
  }))
}

test('the level file: its id, its first and last row, how many rows are left out, and its first thing', () => {
  expect(rowsOf(levelFile(REAL))).toEqual([
    { text: '"id": "level-1",' },
    { text: '"tiles": [', note: 'The level, row by row' },
    { text: '  "#..............#",' },
    { text: '  … 7 more rows' },
    { text: '  "################"' },
    { text: '],' },
    { text: '"things": [' },
    { text: '  { "character": "crate",', note: 'What it is' },
    { text: '    "x": 9.5, "y": 7.5 }', note: 'Where it starts' },
    { text: ']' },
  ])
})

test('a level of two rows leaves no row out, and of one row shows it once', () => {
  const two = rowsOf(levelFile(withLevel({ height: 2, firstRow: '#.#', lastRow: '###' }))).map((r) => r.text)
  expect(two).toContain('  "#.#",')
  expect(two).toContain('  "###"')
  expect(two.some((text) => text.includes('more'))).toBe(false)
  const one = rowsOf(levelFile(withLevel({ height: 1, firstRow: '#.#', lastRow: '#.#' }))).map((r) => r.text)
  expect(one.filter((text) => text.includes('#.#'))).toEqual(['  "#.#"'])
})

test('one row left out is not a plural', () => {
  const three = rowsOf(levelFile(withLevel({ height: 3 }))).map((r) => r.text)
  expect(three).toContain('  … 1 more row')
})

test('a level with nothing in it shows no things and no notes about them', () => {
  const { thing: _gone, ...bare } = REAL.level
  const rows = rowsOf(levelFile({ ...REAL, level: bare }))
  expect(rows.map((r) => r.text).some((text) => text.includes('things'))).toBe(false)
  expect(rows.map((r) => r.note).filter(Boolean)).toEqual(['The level, row by row'])
  expect(rows[rows.length - 1]?.text).toBe(']')
})

test('a row with markup in it is shown as words', () => {
  const html = levelFile(withLevel({ firstRow: '<b>#</b>', id: '<i>' }))
  expect(html).not.toContain('<b>')
  expect(html).not.toContain('<i>')
  expect(html).toContain('&lt;b&gt;#&lt;/b&gt;')
})

test('escapeHtml writes out the four characters that could open or close markup', () =>
  expect(escapeHtml('<a href="x">&</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;'))

test('the engines: one row each, the engine\'s name and "Same ending"', () => {
  const html = engineRows(REAL)
  const rows = [
    ...html.matchAll(
      /<tr><th scope="row">(.*?)<\/th><td class="same"><i data-icon="check-circle"><\/i><span>(.*?)<\/span><\/td><\/tr>/g,
    ),
  ]
  expect(rows.map((r) => [r[1], r[2]])).toEqual([
    ['Node', 'Same ending'],
    ['Chrome', 'Same ending'],
    ['Safari', 'Same ending'],
    ['Firefox', 'Same ending'],
  ])
})

test("the claims: one card each, numbered 01 to 05, with its title, its line and its stamp's words", () => {
  const html = claimCards(CLAIMS)
  const cards = html.split('</li>').filter(Boolean)
  expect(cards).toHaveLength(5)
  cards.forEach((card, at) => {
    const claim = CLAIMS[at]
    expect(card).toContain(`<span class="number">0${at + 1}</span>`)
    expect(card).toContain(`<h3>${escapeHtml(claim?.title ?? '')}</h3>`)
    expect(card).toContain(`<p>${escapeHtml(claim?.line ?? '')}</p>`)
  })
  // A card that works has class "stamp works" and a check icon; a card being built has "stamp building" and none.
  expect(cards[0]).toContain(
    '<span class="stamp works"><i data-icon="check"></i><span>Works today</span></span>',
  )
  for (const card of cards.slice(1)) {
    expect(card).toContain('<span class="stamp building"><span>Being built</span></span>')
    expect(card).not.toContain('data-icon')
  }
})
