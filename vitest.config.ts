// One Node project: everything in tests/ that ends in .test.ts. The journeys (*.journey.ts) are Playwright's.
import { defineConfig, type ViteUserConfig } from 'vitest/config'

// Annotated because the repo's tsconfig demands explicit types on everything exported.
const config: ViteUserConfig = defineConfig({
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
})

export default config
