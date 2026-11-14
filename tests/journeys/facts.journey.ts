// What the build writes beside the pages: the game's picture, the share picture, the touch icons and facts.json, and
// what the page's head tells a browser and a shared link. Desktop size, in every engine; most need no page at all.
import { expect, type Page, test } from '@playwright/test'
import { parseVersion } from '../../src/features/version/version.ts'
import { readPicture } from './png.ts'

test.use({ viewport: { width: 1440, height: 900 } })

const ADDRESS = 'https://automataframework.pages.dev/'
const DESCRIPTION =
  'Automata Framework is a toolkit for making 2D games that play in a web browser. It is still being built. Play the first game made with it.'

/** The size a browser draws a picture at once it has loaded, read from a page that shows it. */
async function sizeOf(page: Page, address: string): Promise<[number, number]> {
  await page.goto('/')
  return page.evaluate(async (src) => {
    const image = new Image()
    image.src = src
    await image.decode()
    return [image.naturalWidth, image.naturalHeight] as [number, number]
  }, address)
}

test("the game's picture, the share picture and the icons are the site's own files", async ({
  request,
  page,
}) => {
  for (const [address, type] of [
    ['/game.png', 'image/png'],
    ['/share.png', 'image/png'],
    ['/apple-touch-icon.png', 'image/png'],
    ['/icon.svg', 'image/svg+xml'],
  ] as const) {
    const response = await request.get(address)
    expect(response.status(), address).toBe(200)
    expect(response.headers()['content-type'] ?? '', address).toContain(type)
  }
  expect(await sizeOf(page, '/game.png')).toEqual([2560, 1440])
  expect(await sizeOf(page, '/share.png')).toEqual([1200, 630])
  expect(await sizeOf(page, '/apple-touch-icon.png')).toEqual([180, 180])
})

// Read from the file's own bytes in Node, not drawn on a canvas in the browser: a browser short of memory may hand back an
// empty canvas for a picture this large (WebKit did, once, and the journey counted one colour in a good picture).
test("the game's picture is a picture of the game, not of a blank frame", async ({ request }) => {
  const response = await request.get('/game.png')
  const picture = readPicture(await response.body())
  expect([picture.width, picture.height]).toEqual([2560, 1440])
  // The stand-in game is flat and still has its words and a ground, so more than three colours means "not blank".
  expect(picture.colours).toBeGreaterThan(3)
})

test('the page tells a browser and a shared link what it is', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Automata Framework: finish the game your agent started')
  const meta = (selector: string): Promise<string | null> => page.locator(selector).getAttribute('content')
  expect(await meta('meta[name="description"]')).toBe(DESCRIPTION)
  expect(await page.locator('link[rel="icon"]').getAttribute('href')).toBe('/icon.svg')
  expect(await page.locator('link[rel="apple-touch-icon"]').getAttribute('href')).toBe(
    '/apple-touch-icon.png',
  )
  expect(await meta('meta[property="og:title"]')).toBe('Automata Framework')
  expect(await meta('meta[property="og:description"]')).toBe(DESCRIPTION)
  expect(await meta('meta[property="og:type"]')).toBe('website')
  expect(await meta('meta[property="og:url"]')).toBe(ADDRESS)
  expect(await meta('meta[property="og:image"]')).toBe(`${ADDRESS}share.png`)
  expect(await meta('meta[property="og:image:width"]')).toBe('1200')
  expect(await meta('meta[property="og:image:height"]')).toBe('630')
  expect(await meta('meta[property="og:image:alt"]')).toBe('Finish the game your agent started.')
  expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image')
})

test('facts.json is served and says which game the page shows', async ({ request }) => {
  const response = await request.get('/facts.json')
  expect(response.status()).toBe(200)
  const facts = (await response.json()) as {
    commit: string
    replay: { steps: number }
    engines: string[]
  }
  const version = parseVersion(await (await request.get('/version.json')).text())
  expect(facts.commit).toBe(version?.game)
  expect(facts.replay.steps).toBeGreaterThan(0)
  expect(facts.engines).toHaveLength(4)
})
