import { expect, test } from 'vitest'
import {
  GAME_REPO,
  gameCommitUrl,
  isCommit,
  parseVersion,
  shortCommit,
  VERSION_FILE,
  writeVersion,
} from '#src/features/version/version.ts'

const A = 'a'.repeat(40)
const B = 'b'.repeat(40)

test('the version file and the game repo are named once', () => {
  expect(VERSION_FILE).toBe('version.json')
  expect(GAME_REPO).toBe('mcthaydt/AutomataFrameworkExamples')
})

test('writeVersion then parseVersion gives the same version', () => {
  const text = writeVersion({ site: A, game: B })
  expect(text).toBe(`{\n  "site": "${A}",\n  "game": "${B}"\n}\n`)
  expect(parseVersion(text)).toEqual({ site: A, game: B })
})

test('parseVersion gives undefined for anything that is not a version', () => {
  for (const text of [
    '',
    'null',
    '[]',
    '<!doctype html>',
    '{"site":"x"}',
    '{"site":1,"game":2}',
    '{"site":"","game":"b"}',
  ]) {
    expect(parseVersion(text), text).toBeUndefined()
  }
})

test('parseVersion ignores keys it does not know', () =>
  expect(parseVersion('{"site":"s","game":"g","builtAt":"today"}')).toEqual({ site: 's', game: 'g' }))

test('isCommit accepts exactly 40 lowercase hex digits', () => {
  expect(isCommit(A)).toBe(true)
  for (const text of ['', 'fixture', 'a'.repeat(39), 'a'.repeat(41), 'A'.repeat(40), 'g'.repeat(40)]) {
    expect(isCommit(text), text).toBe(false)
  }
})

test('shortCommit shortens a commit and leaves a word alone', () => {
  expect(shortCommit(A)).toBe('aaaaaaa')
  expect(shortCommit('fixture')).toBe('fixture')
})

test('gameCommitUrl links a commit and nothing else', () => {
  expect(gameCommitUrl({ site: A, game: B })).toBe(
    `https://github.com/mcthaydt/AutomataFrameworkExamples/commit/${B}`,
  )
  expect(gameCommitUrl({ site: A, game: 'fixture' })).toBeUndefined()
})
