// Thin wrapper for `pnpm build`: puts a built game into the built site (dist/), with the facts read from the game's own
// files. Which game and which commits come from the environment; with none, the stand-in game is used so a plain
// `pnpm build` always works.
import { AssembleError, addGame, FactsError, readFacts, sourceFolder } from '#src/build.ts'

const env = process.env

try {
  const commit = env.GAME_COMMIT ?? 'fixture'
  addGame({
    siteDir: 'dist',
    gameDir: env.GAME_DIR ?? 'tests/fixtures/game',
    version: { site: env.SITE_COMMIT ?? env.GITHUB_SHA ?? 'dev', game: commit },
    facts: readFacts({ sourceDir: sourceFolder(env), commit }),
  })
  console.log(`Added the game from ${env.GAME_DIR ?? 'tests/fixtures/game'} to dist/play/.`)
} catch (error) {
  if (!(error instanceof AssembleError || error instanceof FactsError)) throw error
  console.error(error.message)
  process.exit(1)
}
