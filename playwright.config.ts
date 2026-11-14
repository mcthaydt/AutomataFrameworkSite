// The journeys: the built site (dist/) driven in real Chromium, WebKit and Firefox, one project per engine so CI can run
// them as parallel jobs. They run against `wrangler pages dev`, which serves a folder the way Cloudflare Pages does,
// headers and 404s included, with no account. BASE_URL points them at another address instead (the live site).
import { defineConfig, type PlaywrightTestConfig } from '@playwright/test'

const ENGINES = ['chromium', 'webkit', 'firefox'] as const
const LOCAL = 'http://127.0.0.1:8788'
const baseURL = process.env.BASE_URL ?? LOCAL

// Annotated because the repo's tsconfig demands explicit types on everything exported.
const config: PlaywrightTestConfig = defineConfig({
  testDir: 'tests/journeys',
  testMatch: '*.journey.ts',
  // A journey that passes on a retry is a defect to find, not something to hide.
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [['list']],
  // A button that is not there should fail in seconds, not at the end of a 30 second test. Motion is off for every journey
  // but `motion.journey.ts`, which turns it on: a picture or a measurement taken while the page is still arriving would
  // differ from run to run, and an engine's animation timing is not what these journeys are about.
  use: { baseURL, actionTimeout: 8_000, navigationTimeout: 15_000, reducedMotion: 'reduce' },
  projects: ENGINES.map((engine) => ({ name: engine, use: { browserName: engine } })),
  ...(process.env.BASE_URL === undefined
    ? {
        webServer: {
          command: 'pnpm exec wrangler pages dev dist --ip 127.0.0.1 --port 8788',
          url: LOCAL,
          reuseExistingServer: !process.env.CI,
          env: { WRANGLER_SEND_METRICS: 'false' },
          timeout: 120_000,
        },
      }
    : {}),
})

export default config
