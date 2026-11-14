// Reads the few lines of a game's `automata.toml` that the site needs. It is not a TOML parser and does not pretend to
// be: it reads top-level `key = "value"` lines and `[[content]]` tables with a `type` and a `path`, drops a `#` comment
// that is outside quotes, and ignores every other line. A value it cannot read the plain way (single quotes, a
// backslash, a string over several lines) is a `FactsError` naming the line, never a wrong guess.

/** The project file's name, said in every sentence about it. */
export const PROJECT_FILE = 'automata.toml'

/** A failure with a plain sentence, ready to print in a build. */
export class FactsError extends Error {}

/** One `[[content]]` table. */
export interface ContentFile {
  readonly type: string
  readonly path: string
}

/** What the site needs of a game's project file. */
export interface Project {
  /** The game's name, as the game says it. */
  readonly name: string
  /** The id of the level a new game opens. */
  readonly start: string
  /** Every content file, in the file's order. */
  readonly content: readonly ContentFile[]
}

/** The line without its `#` comment. A `#` inside double quotes is part of the value. */
function withoutComment(line: string): string {
  let quoted = false
  for (let at = 0; at < line.length; at++) {
    if (line[at] === '"') quoted = !quoted
    else if (line[at] === '#' && !quoted) return line.slice(0, at)
  }
  return line
}

/** The words of a plain double-quoted value, or a sentence naming the line when it is anything else. */
function plainString(value: string, line: string): string {
  const match = /^"([^"\\]*)"$/.exec(value)
  if (match?.[1] === undefined) {
    throw new FactsError(
      `${PROJECT_FILE} has a line the site cannot read: ${line}. Write the value in plain double quotes, on one line, with no backslash.`,
    )
  }
  return match[1]
}

/** Reads the project file's text. A missing name, first level or content table is a `FactsError` that says which. */
export function readProject(text: string): Project {
  let name: string | undefined
  let start: string | undefined
  const content: ContentFile[] = []
  // `table` is the heading the lines belong to: '' before the first one, 'content' inside [[content]].
  let table = ''
  let open: { type?: string; path?: string } | undefined

  const close = (): void => {
    if (open === undefined) return
    if (open.type === undefined) {
      throw new FactsError(`A [[content]] table in ${PROJECT_FILE} has no type = "..." line.`)
    }
    if (open.path === undefined) {
      throw new FactsError(`A [[content]] table in ${PROJECT_FILE} has no path = "..." line.`)
    }
    content.push({ type: open.type, path: open.path })
    open = undefined
  }

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    const code = withoutComment(line).trim()
    if (code === '') continue
    const heading = /^\[\[?\s*([^\]]*?)\s*\]\]?$/.exec(code)
    if (heading !== null) {
      close()
      table = heading[1] ?? ''
      if (table === 'content' && code.startsWith('[[')) open = {}
      continue
    }
    const pair = /^([A-Za-z0-9_-]+)\s*=\s*(.*)$/.exec(code)
    if (pair === null) continue
    const key = pair[1] ?? ''
    const value = pair[2] ?? ''
    if (table === '' && key === 'name') name = plainString(value, line)
    else if (table === '' && key === 'start') start = plainString(value, line)
    else if (open !== undefined && key === 'type') open.type = plainString(value, line)
    else if (open !== undefined && key === 'path') open.path = plainString(value, line)
  }
  close()

  if (name === undefined || name === '') {
    throw new FactsError(
      `${PROJECT_FILE} has no name = "..." line, so the site cannot say which game this is.`,
    )
  }
  if (start === undefined || start === '') {
    throw new FactsError(
      `${PROJECT_FILE} has no start = "..." line, so the site cannot tell which level opens first.`,
    )
  }
  if (content.length === 0) {
    throw new FactsError(
      `${PROJECT_FILE} has no [[content]] table, so the game lists no files for the site to show.`,
    )
  }
  return { name, start, content }
}
