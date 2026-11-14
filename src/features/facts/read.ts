// The same facts, read from a folder on disk: the game's own repo folder, which holds `automata.toml`. Node's only.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { type GameFacts, parseFacts } from './parse.ts'
import { FactsError, PROJECT_FILE } from './project.ts'

/** The stand-in game's folder, used when no real game is named, so a plain `pnpm build` always works. */
const STAND_IN_FOLDER = 'tests/fixtures/game-source'

/** Reads the facts of the game whose repo folder is `sourceDir`, at `commit`. */
export function readFacts(options: { readonly sourceDir: string; readonly commit: string }): GameFacts {
  const { sourceDir, commit } = options
  const read = (path: string): string | undefined => {
    try {
      return readFileSync(join(sourceDir, path), 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
      throw error
    }
  }
  if (read(PROJECT_FILE) === undefined) {
    throw new FactsError(
      `There is no ${PROJECT_FILE} in "${sourceDir}". GAME_SOURCE must be the game's repo folder, the one that holds ${PROJECT_FILE}.`,
    )
  }
  return parseFacts({ commit, read })
}

/**
 * Which folder holds the game's own files. A built game (`GAME_DIR`) with no folder for its files (`GAME_SOURCE`) would
 * be shown with the stand-in's facts, an untrue page, so that is refused (audit S6).
 */
export function sourceFolder(env: {
  readonly GAME_DIR?: string | undefined
  readonly GAME_SOURCE?: string | undefined
}): string {
  if (env.GAME_SOURCE !== undefined && env.GAME_SOURCE !== '') return env.GAME_SOURCE
  if (env.GAME_DIR !== undefined && env.GAME_DIR !== '') {
    throw new FactsError(
      "GAME_DIR names a built game, and GAME_SOURCE does not say where that game's own files are. Set GAME_SOURCE to the game's repo folder (the folder that holds automata.toml).",
    )
  }
  return STAND_IN_FOLDER
}
