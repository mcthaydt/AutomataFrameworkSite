// The game's own files, as text, into the few facts the home page states. Pure: it is given a function that reads a
// file of the game by its path, so a test can hand it made-up files and a build can hand it a folder.
import { REQUIRED_CHECKS } from '../pick/pick.ts'
import { isCommit } from '../version/version.ts'
import { FactsError, PROJECT_FILE, readProject } from './project.ts'

/** The file the build writes at the site's root, beside `version.json`. */
export const FACTS_FILE = 'facts.json'

/** What the page says about the game it shows. Every number and name on the page is one of these. */
export interface GameFacts {
  /** The project file's name. */
  readonly name: string
  /** 40 hex digits, or a plain word off CI ('fixture'). */
  readonly commit: string
  /** Every `[[content]]` path, in the file's order. */
  readonly files: readonly string[]
  /** The licence, in the one word the page uses. */
  readonly licence: string
  /** The places the recorded play runs, in the page's words. */
  readonly engines: readonly string[]
  /** The first level: where it is, how big, and what is in it. */
  readonly level: {
    readonly path: string
    readonly id: string
    readonly width: number
    readonly height: number
    readonly firstRow: string
    readonly lastRow: string
    /** The first thing the level places, when it places any. */
    readonly thing?: { readonly character: string; readonly x: number; readonly y: number }
  }
  /** The recorded play of that level. */
  readonly replay: { readonly path: string; readonly steps: number; readonly ending: string }
}

/** The names a person reads for the checks the site requires of the game. */
const ENGINE_NAMES: Readonly<Record<string, string>> = {
  check: 'Node',
  'engines (chromium)': 'Chrome',
  'engines (webkit)': 'Safari',
  'engines (firefox)': 'Firefox',
}

/** The page's name for each check, in order. A check the site has no name for would be words nobody chose. */
export function engineNames(checks: readonly string[]): string[] {
  return checks.map((check) => {
    const name = ENGINE_NAMES[check]
    if (name === undefined) {
      throw new FactsError(
        `The site has no name for the check "${check}". Add one to ENGINE_NAMES in the facts feature.`,
      )
    }
    return name
  })
}

/** Two-space JSON and a newline, the same bytes every time, like `writeVersion`. */
export function writeFacts(facts: GameFacts): string {
  return `${JSON.stringify(facts, null, 2)}\n`
}

/** A path inside the game's own folder: not absolute, and it never climbs out. */
function inside(path: string): boolean {
  return !path.startsWith('/') && !path.split('/').includes('..')
}

/** Reads a JSON file of the game as an object, or says which file is wrong. */
function readObject(path: string, text: string | undefined): Record<string, unknown> {
  if (text === undefined) throw new FactsError(`${path} is missing from the game.`)
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new FactsError(`${path} is not JSON the site can read.`)
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new FactsError(`${path} is not a JSON object.`)
  }
  return value as Record<string, unknown>
}

/** A commit id, or a plain word off CI ('fixture', 'dev'); anything else is not something to show a reader. */
function checkedCommit(commit: string): string {
  if (isCommit(commit) || /^[a-z][a-z0-9-]*$/.test(commit)) return commit
  throw new FactsError(`"${commit}" is neither a commit id (40 hex digits) nor a plain word.`)
}

/** The facts of a game. `read` gives a file's text by its path inside the game, or undefined when there is none. */
export function parseFacts(input: {
  readonly commit: string
  readonly read: (path: string) => string | undefined
}): GameFacts {
  const { read } = input
  const commit = checkedCommit(input.commit)
  const projectText = read(PROJECT_FILE)
  if (projectText === undefined) throw new FactsError(`${PROJECT_FILE} is missing from the game.`)
  const project = readProject(projectText)
  for (const { path } of project.content) {
    if (!inside(path))
      throw new FactsError(`${PROJECT_FILE} lists "${path}", which is not inside the game's own folder.`)
  }

  // The level: the content file of type `level` whose own id is the one a new game opens.
  let found: { path: string; json: Record<string, unknown> } | undefined
  for (const { type, path } of project.content) {
    if (type !== 'level') continue
    const json = readObject(path, read(path))
    if (json.id === project.start) {
      found = { path, json }
      break
    }
  }
  if (found === undefined) {
    throw new FactsError(
      `${PROJECT_FILE} says start = "${project.start}", and no level among its content files has that id.`,
    )
  }
  for (const { path } of project.content) {
    if (read(path) === undefined)
      throw new FactsError(`${path} is listed in ${PROJECT_FILE} and is missing from the game.`)
  }

  const { path: levelPath, json: level } = found
  const tiles = level.tiles
  if (!Array.isArray(tiles) || tiles.length === 0 || !tiles.every((row) => typeof row === 'string')) {
    throw new FactsError(`${levelPath} has no "tiles": the level's rows, each in quotes.`)
  }
  const rows = tiles as string[]
  const firstRow = rows[0] ?? ''
  const lastRow = rows[rows.length - 1] ?? ''

  let thing: GameFacts['level']['thing']
  const things = level.things
  if (Array.isArray(things) && things.length > 0) {
    const first = things[0] as Record<string, unknown> | null
    if (typeof first?.character !== 'string' || typeof first.x !== 'number' || typeof first.y !== 'number') {
      throw new FactsError(`The first of "things" in ${levelPath} has no character, x and y.`)
    }
    thing = { character: first.character, x: first.x, y: first.y }
  }

  const replayPath = `replays/${project.start}.json`
  const replay = readObject(replayPath, read(replayPath))
  if (typeof replay.ticks !== 'number' || !Number.isInteger(replay.ticks) || replay.ticks < 1) {
    throw new FactsError(`${replayPath} has no "ticks": the number of steps in the recorded play.`)
  }
  if (typeof replay.finalHash !== 'string' || !/^[0-9a-f]{16}$/.test(replay.finalHash)) {
    throw new FactsError(`${replayPath} has no "finalHash": the 16 hex digits the recorded play ends on.`)
  }

  // The page says "MIT" in words, so it is held to a game whose licence file is the MIT one.
  if (!/^MIT License\s*$/.test((read('LICENSE') ?? '').split('\n')[0] ?? '')) {
    throw new FactsError('The game\'s LICENSE is missing or is not the MIT License, and the page says "MIT".')
  }

  return {
    name: project.name,
    commit,
    files: project.content.map((entry) => entry.path),
    licence: 'MIT',
    engines: engineNames(REQUIRED_CHECKS),
    level: {
      path: levelPath,
      id: project.start,
      width: firstRow.length,
      height: rows.length,
      firstRow,
      lastRow,
      ...(thing === undefined ? {} : { thing }),
    },
    replay: { path: replayPath, steps: replay.ticks, ending: replay.finalHash },
  }
}
