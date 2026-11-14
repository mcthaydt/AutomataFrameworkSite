// Builds the site's pages into dist/. The game is added afterwards by scripts/add-game.ts.
import { defineConfig, type UserConfig } from 'vite'
import { inlineIcons, readIcon } from './src/build.ts'

// Annotated because the repo's tsconfig demands explicit types on everything exported.
const config: UserConfig = defineConfig({
  // Every page gets its icons as it is built, and an unknown icon name fails the build, saying which name and which page.
  plugins: [
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
