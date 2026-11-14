import { expect, test } from 'vitest'
import { CLAIMS, ClaimError } from '#src/features/claims/claims.ts'
import type { GameFacts } from '#src/features/facts/facts.ts'
import { addresses, FillError, factWords, fillPage } from '#src/features/fill/fill.ts'

const REAL_COMMIT = '05fb33d7c2a1b6e3f8c4d9a0b1e2f3a4b5c6d7e8'
// The real game's values, typed here on purpose: a test that read them from the game would pass whatever they were.
const REAL: GameFacts = {
  name: 'Crate Game',
  commit: REAL_COMMIT,
  files: ['content/levels/level-1.json', 'content/characters/hero.json', 'content/characters/crate.json'],
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
const REPO = 'https://github.com/mcthaydt/AutomataFrameworkExamples'

test('every fact is written as words', () => {
  expect(factWords(REAL)).toEqual({
    name: 'Crate Game',
    version: '05fb33d',
    'level-size': '16 × 9 tiles',
    'engines-count': '4 places',
    'engines-list': 'Node, Chrome, Safari and Firefox',
    steps: '360 steps',
    'files-count': '3 small files',
    licence: 'MIT',
    'level-path': 'content/levels/level-1.json',
    'replay-path': 'replays/level-1.json',
    'replay-ending': '77be68a6e1859241',
  })
})

test('every fact is written into its element, and the element stays', () => {
  const names = Object.keys(factWords(REAL))
  const page = names.map((name) => `<span data-fact="${name}"></span>`).join('')
  const filled = fillPage(page, REAL, CLAIMS)
  for (const [name, words] of Object.entries(factWords(REAL))) {
    expect(filled, name).toContain(`<span data-fact="${name}">${words.replace(/&/g, '&amp;')}</span>`)
  }
})

test('one step and one small file are not plurals', () => {
  const one = { ...REAL, files: ['a.json'], replay: { ...REAL.replay, steps: 1 } }
  expect(factWords(one).steps).toBe('1 step')
  expect(factWords(one)['files-count']).toBe('1 small file')
  expect(factWords({ ...REAL, engines: ['Node'] })['engines-count']).toBe('1 place')
})

test('the addresses are the commit on GitHub', () => {
  expect(addresses(REAL)).toEqual({
    version: `${REPO}/commit/${REAL_COMMIT}`,
    files: `${REPO}/tree/${REAL_COMMIT}`,
    level: `${REPO}/blob/${REAL_COMMIT}/content/levels/level-1.json`,
    checks: `${REPO}/commit/${REAL_COMMIT}/checks`,
  })
})

test('a plain word for a commit gives addresses that still open', () => {
  const off = { ...REAL, commit: 'fixture' }
  expect(addresses(off)).toEqual({
    version: REPO,
    files: REPO,
    level: `${REPO}/blob/main/content/levels/level-1.json`,
    checks: `${REPO}/actions`,
  })
  expect(factWords(off).version).toBe('fixture')
})

test('an address is written as an href, and the element stays', () => {
  expect(fillPage('<a class="btn" data-address="files">See</a>', REAL, CLAIMS)).toBe(
    `<a href="${REPO}/tree/${REAL_COMMIT}" class="btn" data-address="files">See</a>`,
  )
})

test('a name with markup in it is shown as words', () =>
  expect(fillPage('<b data-fact="name"></b>', { ...REAL, name: '<img src=x> & Co' }, CLAIMS)).toBe(
    '<b data-fact="name">&lt;img src=x&gt; &amp; Co</b>',
  ))

test('an unknown fact, address or block stops the build, naming it and the page', () => {
  for (const [html, name] of [
    ['<b data-fact="colour"></b>', 'colour'],
    ['<a data-address="moon">x</a>', 'moon'],
    ['<div data-block="menu"></div>', 'menu'],
  ] as const) {
    expect(() => fillPage(html, REAL, CLAIMS, 'index.html')).toThrow(FillError)
    expect(() => fillPage(html, REAL, CLAIMS, 'index.html')).toThrow(new RegExp(`index\\.html.*"${name}"`))
  }
  expect(() => fillPage('<b data-fact="colour"></b>', REAL, CLAIMS)).toThrow(/^A page asks/)
})

// audit S9: a placeholder with loose ends would ship as a page that looks filled and is not.
test('a fact that is not empty, or an address that already has an href, stops the build', () => {
  expect(() => fillPage('<b data-fact="name">Typed</b>', REAL, CLAIMS, 'index.html')).toThrow(/not empty/)
  expect(() => fillPage('<div data-block="claims">x</div>', REAL, CLAIMS, 'index.html')).toThrow(/not empty/)
  expect(() => fillPage('<a href="/x" data-address="files">x</a>', REAL, CLAIMS, 'index.html')).toThrow(
    /href of its own/,
  )
})

test('one element may carry an address and a fact', () => {
  expect(fillPage('<a data-address="version" data-fact="version"></a>', REAL, CLAIMS)).toBe(
    `<a href="${REPO}/commit/${REAL_COMMIT}" data-address="version" data-fact="version">05fb33d</a>`,
  )
})

test('a block is written inside its element', () => {
  const filled = fillPage('<ul data-block="claims"></ul>', REAL, CLAIMS)
  expect(filled.startsWith('<ul data-block="claims"><li class="claim">')).toBe(true)
  expect(filled.endsWith('</li></ul>')).toBe(true)
})

test('a page with no placeholder comes back unchanged', () => {
  const page =
    '<!doctype html><title>Not found</title><p>No <a href="/">home</a>.</p><i data-icon="house"></i>'
  expect(fillPage(page, REAL, CLAIMS, '404.html')).toBe(page)
})

test('filling checks the claims first', () => {
  const broken = { ...REAL, engines: ['Node'] }
  expect(() => fillPage('<b data-fact="name"></b>', broken, CLAIMS)).toThrow(ClaimError)
})
