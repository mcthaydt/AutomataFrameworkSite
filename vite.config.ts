// Builds the site's pages into dist/. The game is added afterwards by scripts/add-game.ts.
import { defineConfig, type Plugin, type UserConfig } from 'vite'
import {
  CLAIMS,
  ClaimError,
  FactsError,
  FillError,
  fillPage,
  type GameFacts,
  inlineIcons,
  readFacts,
  readIcon,
  sourceFolder,
} from './src/build.ts'

/** The three failures with a plain sentence of their own: the build ends on the sentence, not on a stack of code. */
const SENTENCES = [FactsError, ClaimError, FillError]

/**
 * Runs `work`; a failure with its own sentence ends the build on that sentence, and nothing after it (audit N3, M3).
 * Stopping through the bundler (`this.error`) printed the sentence and then thirteen lines of the bundler's own stack,
 * so the sentence is printed here and the build exits.
 */
function orStop<T>(work: () => T): T {
  try {
    return work()
  } catch (error) {
    if (SENTENCES.some((kind) => error instanceof kind)) {
      console.error(`\n${(error as Error).message}`)
      process.exit(1)
    }
    throw error
  }
}

/**
 * Writes the game's facts and the claims into every page. The facts are read from the game's own files once, when the
 * build starts, so a game the site cannot describe stops the build before any page is made.
 */
function fill(): Plugin {
  let facts: GameFacts | undefined
  return {
    name: 'fill',
    buildStart() {
      facts = orStop(() =>
        readFacts({
          sourceDir: sourceFolder(process.env),
          commit: process.env.GAME_COMMIT ?? 'fixture',
        }),
      )
    },
    transformIndexHtml(html, ctx) {
      const known = facts
      if (known === undefined) return html
      return orStop(() => fillPage(html, known, CLAIMS, ctx.path.replace(/^\//, '')))
    },
  }
}

// Annotated because the repo's tsconfig demands explicit types on everything exported.
const config: UserConfig = defineConfig({
  // Every page gets the game's facts and then its icons as it is built (the blocks the facts make hold icon
  // placeholders, so `fill` goes first), and an unknown icon name fails the build, saying which name and which page.
  plugins: [
    fill(),
    {
      name: 'icons',
      transformIndexHtml: (html, ctx) => inlineIcons(html, readIcon, ctx.path.replace(/^\//, '')),
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // The safety header allows fonts only from the site's own address, so no font may be inlined as a data: address.
    assetsInlineLimit: 0,
    rollupOptions: { input: { index: 'index.html', 'not-found': '404.html' } },
  },
})

export default config
