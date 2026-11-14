// Builds the site's pages into dist/. The game is added afterwards by scripts/add-game.ts.
import { defineConfig, type UserConfig } from 'vite'

// Annotated because the repo's tsconfig demands explicit types on everything exported.
const config: UserConfig = defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: { input: { index: 'index.html', 'not-found': '404.html' } },
  },
})

export default config
