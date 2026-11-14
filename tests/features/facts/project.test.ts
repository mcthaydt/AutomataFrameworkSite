import { expect, test } from 'vitest'
import { FactsError, readProject } from '#src/features/facts/facts.ts'

// The real game's project file, as it was when the site was planned.
const REAL = `format = 1
name = "Crate Game"
start = "level-1"   # the level a new game opens
hero = "hero"       # the character each player controls

[[content]]
type = "level"
path = "content/levels/level-1.json"

[[content]]
type = "character"
path = "content/characters/hero.json"

# a comment on a line of its own

[[content]]
type = "character"
path = "content/characters/crate.json"
`

test('reads the name, the first level and every content file, past comments and blank lines', () => {
  expect(readProject(REAL)).toEqual({
    name: 'Crate Game',
    start: 'level-1',
    content: [
      { type: 'level', path: 'content/levels/level-1.json' },
      { type: 'character', path: 'content/characters/hero.json' },
      { type: 'character', path: 'content/characters/crate.json' },
    ],
  })
})

test('a # inside a quoted value is not a comment', () => {
  const text =
    'name = "Crate #1"   # a real comment\nstart = "a"\n[[content]]\ntype = "level"\npath = "a.json"\n'
  expect(readProject(text).name).toBe('Crate #1')
})

test.each([
  ['no name', 'start = "a"\n[[content]]\ntype = "level"\npath = "a.json"\n', /automata\.toml.*name/],
  ['no start', 'name = "A"\n[[content]]\ntype = "level"\npath = "a.json"\n', /automata\.toml.*start/],
  ['no [[content]]', 'name = "A"\nstart = "a"\n', /automata\.toml.*\[\[content\]\]/],
])('a project file the site cannot read stops with a sentence: %s', (_what, text, sentence) => {
  expect(() => readProject(text)).toThrow(FactsError)
  expect(() => readProject(text)).toThrow(sentence)
})

test('a content table with no type or no path stops with a sentence', () => {
  const head = 'name = "A"\nstart = "a"\n[[content]]\n'
  expect(() => readProject(`${head}type = "level"\n`)).toThrow(/path/)
  expect(() => readProject(`${head}path = "a.json"\n`)).toThrow(/type/)
})

// audit N4: a value this reader cannot read must stop the build and name the line, never be read wrongly.
test.each([
  ["name = 'Crate Game'", /name = 'Crate Game'/],
  ['name = "Crate \\"Game\\""', /name = "Crate/],
  ['name = """\nCrate\n"""', /name = """/],
  ['name = Crate', /name = Crate/],
])('a value it cannot read is named, not misread: %s', (line, sentence) => {
  const text = `${line}\nstart = "a"\n[[content]]\ntype = "level"\npath = "a.json"\n`
  expect(() => readProject(text)).toThrow(FactsError)
  expect(() => readProject(text)).toThrow(sentence)
})

test('lines it does not need are ignored, whatever they hold', () => {
  const text = `format = 1\nhero = 'x'\nname = "A"\nstart = "a"\n[other]\nname = "not this one"\n[[content]]\ntype = "level"\npath = "a.json"\n`
  expect(readProject(text).name).toBe('A')
})
