// Which site commit and which game commit one build of the site holds. The build writes `version.json` beside the
// pages, so the live site can say what it is showing and the workflow can tell whether it is out of date.

/** The repo the demo game is built from. */
export const GAME_REPO = 'mcthaydt/AutomataFrameworkExamples'
/** The file the build writes at the site's root. */
export const VERSION_FILE = 'version.json'

/** What one build of the site holds. Each is a 40-digit commit id, or a plain word ('dev', 'fixture') off CI. */
export interface Version {
  readonly site: string
  readonly game: string
}

/** Two-space JSON, `site` then `game`, a newline at the end. The same bytes every time. */
export function writeVersion(version: Version): string {
  return `${JSON.stringify({ site: version.site, game: version.game }, null, 2)}\n`
}

/** Reads a version.json. Anything that is not one (a home page served for a missing file, say) gives undefined. */
export function parseVersion(text: string): Version | undefined {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    return undefined
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const { site, game } = value as Record<string, unknown>
  if (typeof site !== 'string' || site === '' || typeof game !== 'string' || game === '') return undefined
  return { site, game }
}

/** Exactly 40 lowercase hex digits: a real commit id, not a word like 'dev'. */
export function isCommit(text: string): boolean {
  return /^[0-9a-f]{40}$/.test(text)
}

/** The first 7 digits of a commit; anything else comes back unchanged. */
export function shortCommit(text: string): string {
  return isCommit(text) ? text.slice(0, 7) : text
}

/** Where the game's commit can be read on GitHub, only for a real commit. */
export function gameCommitUrl(version: Version): string | undefined {
  return isCommit(version.game) ? `https://github.com/${GAME_REPO}/commit/${version.game}` : undefined
}
