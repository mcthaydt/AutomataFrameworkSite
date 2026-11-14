import { expect, test } from 'vitest'
import { engineNames, FactsError, type GameFacts, parseFacts, writeFacts } from '#src/features/facts/facts.ts'
import { REQUIRED_CHECKS } from '#src/features/pick/pick.ts'

const PROJECT = `name = "Stand-in Game"
start = "room"   # a comment after the value
[[content]]
type = "level"
path = "content/levels/room.json"
[[content]]
type = "character"
path = "content/characters/ball.json"
`
const LEVEL = {
  id: 'room',
  tiles: ['#....#', '#....#', '######'],
  things: [{ id: 'ball-1', character: 'ball', x: 3.5, y: 1.5 }],
}
const FILES: Record<string, string> = {
  'automata.toml': PROJECT,
  'content/levels/room.json': JSON.stringify(LEVEL),
  'content/characters/ball.json': '{"id":"ball"}',
  'replays/room.json': '{"ticks":12,"finalHash":"0123456789abcdef"}',
  LICENSE: 'MIT License\n\nCopyright (c) someone\n',
}
const facts = (files: Record<string, string | undefined> = {}): GameFacts => {
  const all = { ...FILES, ...files }
  return parseFacts({ commit: 'fixture', read: (path) => all[path] })
}

test('the stand-in game', () => {
  expect(facts()).toEqual({
    name: 'Stand-in Game',
    commit: 'fixture',
    files: ['content/levels/room.json', 'content/characters/ball.json'],
    licence: 'MIT',
    engines: ['Node', 'Chrome', 'Safari', 'Firefox'],
    level: {
      path: 'content/levels/room.json',
      id: 'room',
      width: 6,
      height: 3,
      firstRow: '#....#',
      lastRow: '######',
      thing: { character: 'ball', x: 3.5, y: 1.5 },
    },
    replay: { path: 'replays/room.json', steps: 12, ending: '0123456789abcdef' },
  })
})

test('a level with nothing in it has no thing', () => {
  const level = JSON.stringify({ ...LEVEL, things: [] })
  expect(facts({ 'content/levels/room.json': level }).level.thing).toBeUndefined()
  expect('thing' in facts({ 'content/levels/room.json': level }).level).toBe(false)
  const none = JSON.stringify({ id: 'room', tiles: LEVEL.tiles })
  expect(facts({ 'content/levels/room.json': none }).level.thing).toBeUndefined()
})

test('a level of one row has the same first and last row', () => {
  const level = JSON.stringify({ ...LEVEL, tiles: ['#..#'] })
  const found = facts({ 'content/levels/room.json': level }).level
  expect([found.firstRow, found.lastRow, found.height, found.width]).toEqual(['#..#', '#..#', 1, 4])
})

test.each([
  [
    'the first level is not one of the content files',
    { 'automata.toml': PROJECT.replace('start = "room"', 'start = "attic"') },
    /start = "attic".*no level/,
  ],
  ['the level is not JSON', { 'content/levels/room.json': '{ nope' }, /content\/levels\/room\.json/],
  [
    'the level has no rows',
    { 'content/levels/room.json': JSON.stringify({ id: 'room', tiles: [] }) },
    /tiles/,
  ],
  ['there is no recorded play', { 'replays/room.json': undefined }, /replays\/room\.json/],
  [
    'the recorded play has no steps',
    { 'replays/room.json': '{"ticks":0,"finalHash":"0123456789abcdef"}' },
    /ticks/,
  ],
  ['the recorded play has no ending', { 'replays/room.json': '{"ticks":12}' }, /finalHash/],
  ['the licence is not MIT', { LICENSE: 'Some Other Licence\n' }, /LICENSE/],
  ['there is no licence', { LICENSE: undefined }, /LICENSE/],
  [
    'a content file is missing',
    { 'content/characters/ball.json': undefined },
    /content\/characters\/ball\.json/,
  ],
  [
    'a content path climbs out of the game',
    { 'automata.toml': PROJECT.replace('content/characters/ball.json', '../x.json') },
    /\.\.\/x\.json/,
  ],
])('%s: the build stops with a sentence that names the file', (_what, files, sentence) => {
  expect(() => facts(files)).toThrow(FactsError)
  expect(() => facts(files)).toThrow(sentence)
})

test('a commit that is neither a commit nor a plain word stops with a sentence', () => {
  expect(() => parseFacts({ commit: 'not a commit!', read: (path) => FILES[path] })).toThrow(FactsError)
  const sha = 'a'.repeat(40)
  expect(parseFacts({ commit: sha, read: (path) => FILES[path] }).commit).toBe(sha)
})

test('the engines are the checks the site requires of the game', () =>
  expect(engineNames(REQUIRED_CHECKS)).toEqual(['Node', 'Chrome', 'Safari', 'Firefox']))

test('a check the site has no name for stops with a sentence', () =>
  expect(() => engineNames(['check', 'engines (ladybird)'])).toThrow(FactsError))

test('writeFacts gives the same bytes every time, and JSON.parse gives the facts back', () => {
  const found = facts()
  const text = writeFacts(found)
  expect(writeFacts(facts())).toBe(text)
  expect(text.endsWith('}\n')).toBe(true)
  expect(text.startsWith('{\n  "name"')).toBe(true)
  expect(JSON.parse(text)).toEqual(found)
})
