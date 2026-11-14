// From arrival to playing, the way a first-time visitor goes: the game is already moving when they look, with nothing of
// the site over it; Play, or a tap on the game, hands that same game over; a wheel or a finger over it still scrolls the
// page; and where the game cannot play itself the picture stays and Play works as it always did. Every journey runs at
// every size, in the three engines, against the stand-in game (`ci`) and against the real game built from the newest
// green commit of its repo (`site`). The ones that need a game that misbehaves serve their own, at one size.
import { expect, type Page, test } from '@playwright/test'
import { isCommit, parseVersion } from '../../src/features/version/version.ts'
import {
  button,
  FRAME,
  holdWatching,
  isGameRequest,
  isWatchRequest,
  pageGame,
  play,
  playNames,
  pointsOnPicture,
  untilWatching,
  WORDS,
} from './home.ts'
import { arrive } from './look.ts'
import { SIZES } from './sizes.ts'
import { watchForTrouble } from './watch.ts'

/** The game's own words while it plays itself (the Owner, 2026-11-14), which the real game puts on its screen. */
const WATCHING_WORDS = 'The game is playing by itself. Tap it to play.'

/** The id of what is at each point on the picture, so a layer of the site's over the game would be named. */
const idsAt = (page: Page, points: { x: number; y: number }[]): Promise<string[]> =>
  page.evaluate(
    (at) => at.map((point) => document.elementFromPoint(point.x, point.y)?.id || '(something else)'),
    points,
  )

/** The frame's and the picture's boxes, rounded: an engine may report the same edge a hair apart for two boxes. */
const edges = async (page: Page, selector: string): Promise<number[]> => {
  const box = await page.locator(selector).boundingBox()
  return [box?.x, box?.y, box?.width, box?.height].map((edge) => Math.round(edge ?? -1))
}

/** What the game's frame says about its own life, for the message of a failure: its visibility and its animation frames. */
const frameLife = async (page: Page): Promise<string> => {
  const frame = await (await page.locator(FRAME).elementHandle())?.contentFrame()
  return (
    (await frame
      ?.evaluate(
        () =>
          new Promise<string>((resolve) => {
            let frames = 0
            const from = performance.now()
            const count = (): void => {
              frames++
              if (performance.now() - from > 400)
                resolve(`${document.visibilityState}, ${frames} frames in 400 ms`)
              else requestAnimationFrame(count)
            }
            requestAnimationFrame(count)
            setTimeout(() => resolve(`${document.visibilityState}, ${frames} frames, then no more`), 1500)
          }),
      )
      .catch(() => 'no frame to ask')) ?? 'no frame'
  )
}

/** A marker in the frame's own window, which a reloaded frame would lose. */
async function mark(page: Page): Promise<void> {
  const frame = await (await page.locator(FRAME).elementHandle())?.contentFrame()
  await frame?.evaluate(() => {
    ;(window as unknown as { keptThroughTheHandOver: boolean }).keptThroughTheHandOver = true
  })
}
const marked = async (page: Page): Promise<boolean | undefined> => {
  const frame = await (await page.locator(FRAME).elementHandle())?.contentFrame()
  return frame?.evaluate(
    () => (window as unknown as { keptThroughTheHandOver?: boolean }).keptThroughTheHandOver,
  )
}

/** Serves a stand-in for the game's page in its watching form, made of `body` (a script of the test's own). */
async function serveWatching(page: Page, body: string): Promise<void> {
  await page.route(isWatchRequest, (route) =>
    route.fulfill({ contentType: 'text/html', body: `<!doctype html><title>x</title><body>${body}</body>` }),
  )
}

for (const size of SIZES) {
  test.describe(size.name, () => {
    test.use({ viewport: { width: size.width, height: size.height } })

    test('a visitor arrives and the game is playing itself, with nothing of the site over it', async ({
      page,
      request,
    }) => {
      const trouble = watchForTrouble(page)
      await arrive(page)
      await untilWatching(page)
      const game = page.frameLocator(FRAME)
      await expect(game.locator('#game')).toHaveAttribute('data-state', 'watching')
      // It moves by itself: with the game in the window, its own count of how far it has got (never a picture) goes up.
      const points = await pointsOnPicture(page)
      const tickOf = (): Promise<number> =>
        game
          .locator('#game')
          .evaluate(
            () =>
              (window as unknown as { automataWatch?: { sim: { tick: number } } }).automataWatch?.sim.tick ??
              -1,
          )
      const first = await tickOf()
      await expect
        .poll(tickOf, {
          message: `the game plays itself (tick ${first}; ${await frameLife(page)})`,
          timeout: 10_000,
        })
        .toBeGreaterThan(first)
      // Nothing of the site's is over it: at every point on the picture the thing found is the game's own place (the
      // frame lets touches through, so the place under it answers), and the frame fills that place to the pixel.
      expect(new Set(await idsAt(page, points))).toEqual(new Set(['game']))
      await expect(page.locator('img.poster')).toBeHidden()
      expect(await edges(page, FRAME)).toEqual(await edges(page, '#game'))
      expect(await page.locator('#game').evaluate((node) => getComputedStyle(node).outlineStyle)).toBe(
        'solid',
      )
      // The sheet's Play button is still there, and the game says in its own words what it is doing and what to do.
      await expect(button(page, WORDS.play.sheet)).toBeVisible()
      const version = parseVersion(await (await request.get('/version.json')).text())
      if (version !== undefined && isCommit(version.game))
        await expect(game.locator('body')).toContainText(WATCHING_WORDS)
      await page.screenshot({ path: `tests/journeys/__screenshots__/${size.name}-arrival-watching.png` })
      expect(trouble()).toEqual([])
    })

    test('each Play button hands the same game over', async ({ page }) => {
      const trouble = watchForTrouble(page)
      for (const name of playNames(size.width)) {
        const documents: string[] = []
        page.on('request', (request) => {
          const url = new URL(request.url())
          if (request.resourceType() === 'document' && url.pathname === '/play/') documents.push(url.search)
        })
        await arrive(page)
        await untilWatching(page)
        await mark(page)
        const frame = await page.locator(FRAME).elementHandle()
        await play(page, name)
        // The same frame, loaded once: no second page was asked for, and the marker is still in it.
        await expect(page.locator('iframe')).toHaveCount(1)
        expect(await frame?.evaluate((node) => node.isConnected)).toBe(true)
        expect(await marked(page), name).toBe(true)
        expect(documents, name).toEqual(['?watch'])
        await expect(pageGame(page)).toHaveAttribute('data-state', 'playing')
        page.removeAllListeners('request')
      }
      expect(trouble()).toEqual([])
    })

    test('the keys reach the game that was handed over, with no second click', async ({ page }) => {
      await arrive(page)
      const game = await play(page)
      const canvas = game.locator('canvas')
      const before = await canvas.screenshot()
      await page.keyboard.down('ArrowRight')
      await expect.poll(async () => (await canvas.screenshot()).equals(before)).toBe(false)
      await page.keyboard.up('ArrowRight')
    })

    test('a wheel over the game that plays itself scrolls the page', async ({ page }) => {
      await arrive(page)
      await untilWatching(page)
      const at = (await pointsOnPicture(page))[0] as { x: number; y: number }
      const top = await page.evaluate(() => Math.round(window.scrollY))
      await page.mouse.move(at.x, at.y)
      await page.mouse.wheel(0, 300)
      await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThan(top + 100)
      // It is still the game that plays itself: a wheel does not start it.
      await expect(pageGame(page)).toHaveAttribute('data-state', 'watching')
    })

    test('the picture is there before the game is asked for', async ({ page }) => {
      // Said as an order of events: the page's load, then the first request for the game's page.
      const events: string[] = []
      page.on('load', () => events.push('page loaded'))
      page.on('request', (request) => {
        if (new URL(request.url()).pathname === '/play/') events.push('game asked for')
      })
      await arrive(page)
      await untilWatching(page)
      expect(events[0], events.join(', ')).toBe('page loaded')
      expect(events, 'the game is asked for after the page has loaded').toContain('game asked for')
      expect(await page.locator('img.poster').evaluate((image: HTMLImageElement) => image.complete)).toBe(
        true,
      )
    })

    test('a press before the game is ready still starts one game', async ({ page }) => {
      const release = await holdWatching(page)
      let asked = 0
      await page.route(isGameRequest, async (route) => {
        asked++
        await route.continue()
      })
      await arrive(page)
      // The frame is asked for and has not come: the picture is all there is.
      await expect(page.locator('iframe')).toHaveCount(1)
      await expect(pageGame(page)).toHaveAttribute('data-state', 'ready')
      await play(page, WORDS.play.sheet, { early: true })
      release()
      await expect(page.locator('iframe')).toHaveCount(1)
      await expect(pageGame(page)).toHaveAttribute('data-state', 'playing')
      expect(asked).toBe(1)
    })
  })
}

// Q2 (a): a tap or click on the game that plays itself starts it, and nothing else on the page does.
test.describe('tablet-1180x820: a click on the moving game', () => {
  test.use({ viewport: { width: 1180, height: 820 } })

  test('starts it', async ({ page }) => {
    await arrive(page)
    await untilWatching(page)
    await pageGame(page).click()
    await expect(pageGame(page)).toHaveAttribute('data-state', 'playing', { timeout: 15_000 })
    await expect(page.frameLocator(FRAME).locator('#game')).toHaveAttribute('data-state', 'playing')
    await expect(page.locator('iframe')).toHaveCount(1)
  })
})

test.describe('phone-390x844: a tap on the moving game', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test('starts it', async ({ page }) => {
    await arrive(page)
    await untilWatching(page)
    await pageGame(page).tap()
    await expect(pageGame(page)).toHaveAttribute('data-state', 'playing', { timeout: 15_000 })
    await expect(page.frameLocator(FRAME).locator('#game')).toHaveAttribute('data-state', 'playing')
  })

  // A finger that drags over the game scrolls the page (only Chromium can be told to drag a finger).
  test('a dragging finger over it scrolls the page, and does not start it', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Only Chromium can be driven with a dragging finger.')
    await arrive(page)
    await untilWatching(page)
    const at = (await pointsOnPicture(page))[0] as { x: number; y: number }
    const top = await page.evaluate(() => Math.round(window.scrollY))
    // A finger put down on the game and drawn upward, step by step, the way a thumb does it.
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: at.x, y: at.y }] })
    for (let step = 1; step <= 15; step++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: at.x, y: at.y - step * 20 }],
      })
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThan(top + 100)
    await expect(pageGame(page)).toHaveAttribute('data-state', 'watching')
  })

  test('turning the phone keeps the game watching, and then playing', async ({ page }) => {
    await arrive(page)
    await untilWatching(page)
    await mark(page)
    await page.setViewportSize({ width: 844, height: 390 })
    await expect(pageGame(page)).toHaveAttribute('data-state', 'watching')
    await expect(page.locator('iframe')).toHaveCount(1)
    expect(await marked(page)).toBe(true)
    expect(await edges(page, FRAME)).toEqual(await edges(page, '#game'))
    await play(page)
    expect(await marked(page)).toBe(true)
    await expect(page.locator('iframe')).toHaveCount(1)
  })
})

// Q3 (b): it plays itself for everyone. A device that asks for less motion or for less data gets the same game, because the
// game's own picture of its play is not decoration: it is what the page is showing.
for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test.describe(`desktop-1440x900: asked for ${reducedMotion === 'reduce' ? 'less' : 'the usual'} motion`, () => {
    test.use({ viewport: { width: 1440, height: 900 }, reducedMotion })

    test('the game still plays itself', async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true })
      })
      await arrive(page)
      await untilWatching(page)
      await expect(page.frameLocator(FRAME).locator('#game')).toHaveAttribute('data-state', 'watching')
    })
  })
}

// A game that cannot play itself, or that goes wrong when handed over, is a game the page must not break on. These serve
// their own pages for the game's watching form, so what the real game does cannot matter to what they check.
test.describe('desktop-1440x900: a game that does not play itself', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('says it cannot, and the picture stays: Play loads the game as it always did', async ({ page }) => {
    await serveWatching(
      page,
      "<script>parent.postMessage({ automata: 'state', state: 'problem' }, location.origin)</script>",
    )
    await arrive(page)
    // It said it has a problem, and nothing of it is left behind the picture.
    await expect(page.locator('iframe')).toHaveCount(0)
    await expect(pageGame(page)).toHaveAttribute('data-state', 'ready')
    await expect(page.locator('img.poster')).toBeVisible()
    await page.unroute(isWatchRequest)
    await play(page, WORDS.play.sheet, { early: true })
    await expect(page.locator('iframe')).toHaveCount(1)
  })

  test('says nothing at all, and its loading does not start playing', async ({ page }) => {
    await serveWatching(page, '<p>Not a game.</p>')
    await arrive(page)
    await expect(page.locator('iframe')).toHaveCount(1)
    const frame = await (await page.locator(FRAME).elementHandle())?.contentFrame()
    await frame?.waitForLoadState('load')
    // The frame has loaded, and loading is not playing: only the game's own words move the page on.
    await expect(pageGame(page)).toHaveAttribute('data-state', 'ready')
    await expect(page.locator('img.poster')).toBeVisible()
    expect(await page.locator(FRAME).evaluate((element) => getComputedStyle(element).visibility)).toBe(
      'hidden',
    )
    await page.unroute(isWatchRequest)
    await play(page, WORDS.play.sheet, { early: true })
  })

  test('a state posted by the page itself, not by the frame, changes nothing', async ({ page }) => {
    const release = await holdWatching(page)
    await arrive(page)
    // The page is listening for the frame once the frame is asked for.
    await expect(page.locator('iframe')).toHaveCount(1)
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          // The page's own listener was added first, so by the time this one hears the second message it has heard the first.
          window.addEventListener('message', (event) => {
            if ((event.data as { done?: boolean } | null)?.done) resolve()
          })
          for (const state of ['watching', 'playing', 'problem'])
            window.postMessage({ automata: 'state', state }, location.origin)
          window.postMessage({ done: true }, location.origin)
        }),
    )
    await expect(pageGame(page)).toHaveAttribute('data-state', 'ready')
    await expect(page.locator('img.poster')).toBeVisible()
    release()
  })

  test("a hand-over that fails shows the game's own words", async ({ page }) => {
    const words = 'The game could not start.'
    await serveWatching(
      page,
      `<main id="game" data-state="watching">${words}</main><script>
        parent.postMessage({ automata: 'state', state: 'watching' }, location.origin)
        window.addEventListener('message', (event) => {
          if (event.data && event.data.automata === 'play') {
            document.getElementById('game').dataset.state = 'problem'
            parent.postMessage({ automata: 'state', state: 'problem' }, location.origin)
          }
        })
      </script>`,
    )
    await arrive(page)
    await untilWatching(page)
    await button(page, WORDS.play.sheet).click()
    // The page does not wait for a game that has said it has a problem: its words are shown, as they would be had the
    // press loaded the game itself.
    await expect(pageGame(page)).toHaveAttribute('data-state', 'playing')
    await expect(page.frameLocator(FRAME).locator('body')).toContainText(words)
    await expect(page.locator('iframe')).toHaveCount(1)
  })
})
