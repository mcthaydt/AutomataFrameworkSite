// Lifted from AutomataFramework@ec4fddd9: tests/architecture/rules.test.ts
import { expect, test } from 'vitest'
import { checkArchitecture, type SourceFiles } from './rules.ts'

// Each case is a made-up file map with exactly one fault, so the answer is one rule's name. Files in a feature
// folder are named after the feature's entry, so `feature-has-entry` stays quiet unless it is the one under test.
const one = (files: SourceFiles) => checkArchitecture(files).map((v) => v.rule)

test('a feature may not import a feature above it', () =>
  expect(one({ 'src/features/version/version.ts': "import '../play/play.ts'" })).toEqual(['imports-go-down']))

test('another feature is imported through its entry file', () =>
  expect(one({ 'src/features/pick/pick.ts': "import '../version/other.ts'" })).toEqual(['through-the-entry']))

test('lib imports no feature', () =>
  expect(one({ 'src/lib/a.ts': "import '../features/version/version.ts'" })).toEqual([
    'lib-is-below-features',
  ]))

test('no cycles', () =>
  expect(one({ 'src/lib/a.ts': "import './b.ts'", 'src/lib/b.ts': "import './a.ts'" })).toEqual([
    'no-cycles',
  ]))

test('a cycle that only types take part in is not a cycle', () =>
  expect(
    one({
      'src/lib/a.ts': "import type { B } from './b.ts'\nexport type A = B",
      'src/lib/b.ts': "import type { A } from './a.ts'\nexport type B = A",
    }),
  ).toEqual([]))

test('no tests in src', () => expect(one({ 'src/lib/a.test.ts': '' })).toEqual(['no-tests-in-src']))

test('a file has at most 600 lines', () =>
  expect(one({ 'src/lib/a.ts': 'x\n'.repeat(601) })).toEqual(['at-most-600-lines']))

test('a feature folder has its entry file', () =>
  expect(one({ 'src/features/version/other.ts': '' })).toEqual(['feature-has-entry']))

test('node modules stay on the Node side', () =>
  expect(one({ 'src/features/play/play.ts': "import { readFileSync } from 'node:fs'" })).toEqual([
    'node-stays-in-node',
  ]))

test('the page reaches nothing that needs Node', () =>
  expect(
    one({
      'src/index.ts': "import './features/assemble/assemble.ts'",
      'src/features/assemble/assemble.ts': '',
    }),
  ).toEqual(['page-and-node-stay-apart']))

test('the Node entry reaches nothing that needs a page', () =>
  expect(
    one({ 'src/build.ts': "export * from './features/play/play.ts'", 'src/features/play/play.ts': '' }),
  ).toEqual(['page-and-node-stay-apart']))

// The rules also have to stay quiet on honest code.
test('a clean map has no violations', () =>
  expect(
    checkArchitecture({
      'src/lib/a.ts': 'export const a = 1',
      'src/features/version/version.ts': "import { a } from '../../lib/a.ts'\nexport const b = a",
      'src/features/pick/pick.ts':
        "import { b } from '../version/version.ts'\nimport 'node:fs'\nexport const c = b",
      'src/features/play/play.ts': 'export const d = 1',
      'src/build.ts': "export * from './features/pick/pick.ts'",
      'src/index.ts': "import './features/play/play.ts'",
    }),
  ).toEqual([]))

test('comments may name what a rule forbids', () =>
  expect(
    one({ 'src/lib/a.ts': "// never import 'node:fs' here\n/* nor node:path */\nexport const a = 1" }),
  ).toEqual([]))

test('a feature may import itself and an unknown feature is named', () => {
  expect(
    one({
      'src/features/version/version.ts': "export * from './parts.ts'",
      'src/features/version/parts.ts': '',
    }),
  ).toEqual([])
  expect(one({ 'src/features/zzz/zzz.ts': '' })).toEqual(['unknown-feature'])
})
