import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, test } from 'vitest'
import { FactsError, readFacts, sourceFolder } from '#src/features/facts/facts.ts'

const FIXTURE = 'tests/fixtures/game-source'
const made: string[] = []
afterEach(() => {
  for (const dir of made.splice(0)) rmSync(dir, { recursive: true, force: true })
})

test('reads the fixture game from its folder', () => {
  const facts = readFacts({ sourceDir: FIXTURE, commit: 'fixture' })
  expect(facts.name).toBe('Stand-in Game')
  expect(facts.files).toEqual(['content/levels/room.json', 'content/characters/ball.json'])
  expect(facts.level).toEqual({
    path: 'content/levels/room.json',
    id: 'room',
    width: 6,
    height: 3,
    firstRow: '#....#',
    lastRow: '######',
    thing: { character: 'ball', x: 3.5, y: 1.5 },
  })
  expect(facts.replay).toEqual({ path: 'replays/room.json', steps: 12, ending: '0123456789abcdef' })
  expect(facts.licence).toBe('MIT')
})

test('a folder with no automata.toml stops with a sentence that names the folder', () => {
  const empty = mkdtempSync(join(tmpdir(), 'facts-'))
  made.push(empty)
  expect(() => readFacts({ sourceDir: empty, commit: 'fixture' })).toThrow(FactsError)
  expect(() => readFacts({ sourceDir: empty, commit: 'fixture' })).toThrow(empty)
})

test('the stand-in game is used when nothing is set', () => {
  expect(sourceFolder({})).toBe(FIXTURE)
})

test('GAME_SOURCE names the folder when it is set', () => {
  expect(sourceFolder({ GAME_SOURCE: '../game' })).toBe('../game')
  expect(sourceFolder({ GAME_DIR: '../game/dist', GAME_SOURCE: '../game' })).toBe('../game')
})

// audit S6: a real game shown with the stand-in's facts would be an untrue page.
test('GAME_DIR without GAME_SOURCE stops, and says what to set', () => {
  expect(() => sourceFolder({ GAME_DIR: '../game/dist' })).toThrow(FactsError)
  expect(() => sourceFolder({ GAME_DIR: '../game/dist' })).toThrow(
    /GAME_DIR names a built game, and GAME_SOURCE does not say where that game's own files are\. Set GAME_SOURCE to the game's repo folder \(the folder that holds automata\.toml\)\./,
  )
})
