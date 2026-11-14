// Lifted from AutomataFramework@ec4fddd9: tests/architecture.test.ts
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { expect, test } from 'vitest'
import { checkArchitecture, checkLineLimit, type SourceFiles } from './architecture/rules.ts'

const ROOT = join(import.meta.dirname, '..')

/** Every file under `dir` whose name ends in one of `endings`, keyed by its path from the repo root with `/`. */
function readTree(
  dir: string,
  endings: readonly string[] = ['.ts'],
  into: Record<string, string> = {},
): SourceFiles {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      // The stand-in game's folder holds a made-up game's files, not this repo's.
      if (entry.name !== 'fixtures' && entry.name !== '__screenshots__') readTree(path, endings, into)
    } else if (endings.some((ending) => entry.name.endsWith(ending)))
      into[relative(ROOT, path).split('\\').join('/')] = readFileSync(path, 'utf8')
  }
  return into
}

test('imports go down, nothing cycles, Node and the page stay apart', () => {
  const violations = checkArchitecture(readTree(join(ROOT, 'src')))
  expect(violations.map((v) => `${v.file}: ${v.rule}: ${v.detail}`)).toEqual([])
})

// Audit F6: the 600-line limit holds for the stylesheet's parts, the journeys, the scripts and the tests too.
test('no stylesheet part, script, test or journey is over 600 lines', () => {
  const files = {
    ...readTree(join(ROOT, 'src'), ['.ts', '.css']),
    ...readTree(join(ROOT, 'scripts')),
    ...readTree(join(ROOT, 'tests')),
  }
  expect(checkLineLimit(files).map((v) => `${v.file}: ${v.detail}`)).toEqual([])
})
