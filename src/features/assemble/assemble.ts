// Puts a built game into the built site, and says in words when it cannot. The game is shown in a frame at /play/, so
// it has to be a folder that works there: an index.html whose addresses are relative.
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { FACTS_FILE, type GameFacts, writeFacts } from '../facts/facts.ts'
import { VERSION_FILE, type Version, writeVersion } from '../version/version.ts'

/** The folder of the site the game is copied to, so its address is `/play/`. */
export const PLAY_FOLDER = 'play'

/** A failure with a plain sentence, ready to print in a run. */
export class AssembleError extends Error {}

/** An address that starts with exactly one `/` (not `//host`) would leave /play/ and ask the site for the game's file. */
const ROOT_ADDRESS = /\b(?:src|href)\s*=\s*["'](\/(?!\/)[^"']*)["']/i

/**
 * Copies the built game into `<siteDir>/play/` (replacing what is there) and writes `<siteDir>/version.json` and
 * `<siteDir>/facts.json`, the numbers and names the pages state, read from the game's own files.
 */
export function addGame(options: {
  readonly siteDir: string
  readonly gameDir: string
  readonly version: Version
  readonly facts: GameFacts
}): void {
  const { siteDir, gameDir, version, facts } = options
  const gamePage = join(gameDir, 'index.html')
  if (!existsSync(gamePage)) {
    throw new AssembleError(
      `There is no built game at "${gameDir}": index.html is missing. Run pnpm build in the game's repo first.`,
    )
  }
  if (!existsSync(join(siteDir, 'index.html'))) {
    throw new AssembleError(
      `The site is not built yet: "${siteDir}" has no index.html. Run vite build first.`,
    )
  }
  const rooted = ROOT_ADDRESS.exec(readFileSync(gamePage, 'utf8'))?.[1]
  if (rooted !== undefined) {
    throw new AssembleError(
      `The game's index.html points at "${rooted}". Every address must be relative (.${rooted}) so the game works inside /${PLAY_FOLDER}/.`,
    )
  }

  // Everything is checked; only now is anything written, so a refused game leaves the site as it was.
  const playDir = join(siteDir, PLAY_FOLDER)
  rmSync(playDir, { recursive: true, force: true })
  cpSync(gameDir, playDir, { recursive: true })
  writeFileSync(join(siteDir, VERSION_FILE), writeVersion(version))
  writeFileSync(join(siteDir, FACTS_FILE), writeFacts(facts))
}
