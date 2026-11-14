import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, expect, test } from 'vitest'
import { AssembleError, addGame, PLAY_FOLDER } from '#src/features/assemble/assemble.ts'
import { parseFacts, writeFacts } from '#src/features/facts/facts.ts'
import { writeVersion } from '#src/features/version/version.ts'

const VERSION = { site: 'a'.repeat(40), game: 'b'.repeat(40) }
const GAME_OWN_FILES: Record<string, string> = {
  'automata.toml': 'name = "Test Game"\nstart = "r"\n[[content]]\ntype = "level"\npath = "r.json"\n',
  'r.json': '{"id":"r","tiles":["#."]}',
  'replays/r.json': '{"ticks":3,"finalHash":"0123456789abcdef"}',
  LICENSE: 'MIT License\n',
}
const FACTS = parseFacts({ commit: 'fixture', read: (path) => GAME_OWN_FILES[path] })
const made: string[] = []

/** A fresh folder under the system's temp folder, removed after the test. */
function folder(): string {
  const dir = mkdtempSync(join(tmpdir(), 'assemble-'))
  made.push(dir)
  return dir
}

/** Writes each file (path -> text) under `dir`, making folders as it goes. */
function put(dir: string, files: Record<string, string>): string {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true })
    writeFileSync(join(dir, path), text)
  }
  return dir
}

const SITE_FILES = { 'index.html': '<!doctype html>', 'assets/site.js': '' }
const GAME_FILES = {
  'index.html': '<script type="module" src="./assets/a.js"></script>',
  'assets/a.js': '',
  'content/levels/level-1.json': '{}',
}

afterEach(() => {
  for (const dir of made.splice(0)) rmSync(dir, { recursive: true, force: true })
})

test('the game is copied to play/ with everything beside it', () => {
  const siteDir = put(folder(), SITE_FILES)
  const gameDir = put(folder(), GAME_FILES)
  addGame({ siteDir, gameDir, version: VERSION, facts: FACTS })
  expect(PLAY_FOLDER).toBe('play')
  for (const path of Object.keys(GAME_FILES)) expect(existsSync(join(siteDir, 'play', path)), path).toBe(true)
})

test('version.json says which site and game', () => {
  const siteDir = put(folder(), SITE_FILES)
  addGame({ siteDir, gameDir: put(folder(), GAME_FILES), version: VERSION, facts: FACTS })
  expect(readFileSync(join(siteDir, 'version.json'), 'utf8')).toBe(writeVersion(VERSION))
})

test('writes facts.json beside version.json', () => {
  const siteDir = put(folder(), SITE_FILES)
  addGame({ siteDir, gameDir: put(folder(), GAME_FILES), version: VERSION, facts: FACTS })
  expect(readFileSync(join(siteDir, 'facts.json'), 'utf8')).toBe(writeFacts(FACTS))
})

test('an older game in play/ is replaced, not mixed in', () => {
  const siteDir = put(folder(), { ...SITE_FILES, 'play/old.js': '' })
  addGame({ siteDir, gameDir: put(folder(), GAME_FILES), version: VERSION, facts: FACTS })
  expect(existsSync(join(siteDir, 'play', 'old.js'))).toBe(false)
  expect(existsSync(join(siteDir, 'play', 'index.html'))).toBe(true)
})

test('a game folder with no index.html is refused in words', () => {
  const siteDir = put(folder(), SITE_FILES)
  const gameDir = put(folder(), { 'assets/a.js': '' })
  expect(() => addGame({ siteDir, gameDir, version: VERSION, facts: FACTS })).toThrowError(
    new AssembleError(
      `There is no built game at "${gameDir}": index.html is missing. Run pnpm build in the game's repo first.`,
    ),
  )
})

test('a site folder with no index.html is refused in words', () => {
  const siteDir = folder()
  expect(() =>
    addGame({ siteDir, gameDir: put(folder(), GAME_FILES), version: VERSION, facts: FACTS }),
  ).toThrowError(
    new AssembleError(`The site is not built yet: "${siteDir}" has no index.html. Run vite build first.`),
  )
})

test('a game that uses addresses starting with / is refused, because it would be a blank frame', () => {
  const siteDir = put(folder(), SITE_FILES)
  const script = put(folder(), { 'index.html': '<script type="module" src="/assets/a.js"></script>' })
  const link = put(folder(), { 'index.html': '<link rel="stylesheet" href="/x.css">' })
  expect(() => addGame({ siteDir, gameDir: script, version: VERSION, facts: FACTS })).toThrowError(
    new AssembleError(
      `The game's index.html points at "/assets/a.js". Every address must be relative (./assets/a.js) so the game works inside /play/.`,
    ),
  )
  expect(() => addGame({ siteDir, gameDir: link, version: VERSION, facts: FACTS })).toThrowError(
    new AssembleError(
      `The game's index.html points at "/x.css". Every address must be relative (./x.css) so the game works inside /play/.`,
    ),
  )
})

test('addresses that are relative, absolute with a host, or protocol-relative are left alone', () => {
  const siteDir = put(folder(), SITE_FILES)
  const gameDir = put(folder(), {
    'index.html':
      '<script src="./a.js"></script><script src="//cdn.example/a.js"></script><link href="https://example.com/x.css">',
  })
  expect(() => addGame({ siteDir, gameDir, version: VERSION, facts: FACTS })).not.toThrow()
})

test('nothing is written when the game is refused', () => {
  const siteDir = put(folder(), SITE_FILES)
  const gameDir = put(folder(), { 'index.html': '<script src="/assets/a.js"></script>' })
  expect(() => addGame({ siteDir, gameDir, version: VERSION, facts: FACTS })).toThrow(AssembleError)
  expect(existsSync(join(siteDir, 'play'))).toBe(false)
  expect(existsSync(join(siteDir, 'version.json'))).toBe(false)
  expect(existsSync(join(siteDir, 'facts.json'))).toBe(false)
})
