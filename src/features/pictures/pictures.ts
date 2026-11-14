// The three pictures of the built site that cannot be written by hand: the game's own picture (shown on its sheet
// before Play), the picture a shared link shows, and the touch icon. The build opens the built site in Chromium once and
// saves them, so they are always the site as it is, never a file somebody drew and forgot.
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { serveFolder } from './serve.ts'

export { serveFolder } from './serve.ts'

/** A failure with a plain sentence, ready to print in a build. */
export class PictureError extends Error {}

export interface Picture {
  /** The file it is written to, at the site's root. */
  readonly file: string
  /** The address of the page it is a picture of. */
  readonly address: string
  readonly width: number
  readonly height: number
  readonly scale: 1 | 2
  /** Wait for this before the picture is taken: a selector that must be there. */
  readonly ready: string
  /** Lay the page out as a card first: the stylesheet draws the first screen for a shared link under `data-picture`. */
  readonly as?: 'share'
}

/** In the order they are taken: the share picture shows the game's picture, so that comes first. */
export const PICTURES: readonly Picture[] = [
  {
    file: 'game.png',
    address: '/play/',
    width: 1280,
    height: 720,
    scale: 2,
    ready: '#game[data-state="playing"]',
  },
  { file: 'share.png', address: '/', width: 1200, height: 630, scale: 1, ready: 'h1', as: 'share' },
  { file: 'apple-touch-icon.png', address: '/icon.svg', width: 180, height: 180, scale: 1, ready: 'svg' },
]

const MISSING_BROWSER = 'Chromium is not installed for Playwright. Run: pnpm exec playwright install chromium'
/** How long a game may take to say it is playing, and how long a picture may take to hold still. */
const READY_MS = 15_000
const GAME_SETTLE_MS = 3_000
const SITE_SETTLE_MS = 10_000

const sleep = (ms: number): Promise<void> => new Promise((done) => setTimeout(done, ms))

/** The minimum of Playwright's page that this file uses, so the dynamic import's types stay out of the way. */
interface Shootable {
  screenshot(options: { type: 'png' }): Promise<Buffer>
}

/**
 * Pictures until two in a row are the same bytes. A game that never stands still (the demo will gain a title screen and
 * music) keeps the last one after `giveUpMs` when `keepMoving`, because a picture that will not settle must not stop
 * every build of the site; the site's own two pictures must settle, or it is a `PictureError`.
 */
async function settled(
  page: Shootable,
  file: string,
  giveUpMs: number,
  keepMoving: boolean,
): Promise<Buffer> {
  const started = Date.now()
  let last: Buffer | undefined
  for (;;) {
    const shot = await page.screenshot({ type: 'png' })
    if (last?.equals(shot)) return shot
    if (Date.now() - started > giveUpMs) {
      if (!keepMoving)
        throw new PictureError(
          `${file}: the page kept changing for ${giveUpMs / 1000} seconds, so it has no one picture.`,
        )
      console.log(`${file}: the game kept moving, so this is one moment of it.`)
      return shot
    }
    last = shot
    await sleep(150)
  }
}

/** Opens the built site in `siteDir` once and writes each of `PICTURES` beside its pages. */
export async function takePictures(options: {
  readonly siteDir: string
  readonly executablePath?: string
}): Promise<void> {
  // Loaded here and nowhere else (audit S8): `src/build.ts` exports this feature, and a Node test that loads Playwright's
  // `expect` beside Vitest's stops with "Cannot redefine property". The same import is where a missing package is caught.
  let chromium: typeof import('@playwright/test')['chromium']
  try {
    ;({ chromium } = await import('@playwright/test'))
  } catch {
    throw new PictureError(MISSING_BROWSER)
  }
  const server = await serveFolder(options.siteDir)
  try {
    let browser: Awaited<ReturnType<typeof chromium.launch>>
    try {
      browser = await chromium.launch(
        options.executablePath === undefined ? {} : { executablePath: options.executablePath },
      )
    } catch {
      throw new PictureError(MISSING_BROWSER)
    }
    try {
      for (const picture of PICTURES) {
        // Pictures are of a page at rest, so nothing may be moving by design.
        const context = await browser.newContext({
          viewport: { width: picture.width, height: picture.height },
          deviceScaleFactor: picture.scale,
          reducedMotion: 'reduce',
        })
        try {
          const page = await context.newPage()
          await page.goto(`${server.url}${picture.address}`)
          try {
            await page.waitForSelector(picture.ready, { timeout: READY_MS })
          } catch {
            throw new PictureError(
              `${picture.file}: ${picture.address} never showed "${picture.ready}" in ${READY_MS / 1000} seconds, so there is no picture to take.`,
            )
          }
          if (picture.as !== undefined) {
            await page.evaluate((as) => {
              document.documentElement.dataset.picture = as
            }, picture.as)
          }
          await page.evaluate(() => document.fonts.ready)
          await page.waitForFunction(() => [...document.images].every((image) => image.complete))
          const game = picture.file === 'game.png'
          const bytes = await settled(page, picture.file, game ? GAME_SETTLE_MS : SITE_SETTLE_MS, game)
          writeFileSync(join(options.siteDir, picture.file), bytes)
        } finally {
          await context.close()
        }
      }
    } finally {
      await browser.close()
    }
  } finally {
    await server.close()
  }
}
