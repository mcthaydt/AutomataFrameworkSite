// What the journeys of the home page share: the words it says (asserted word for word), where the game's frame is, and
// how to wait for the game to play itself, press a Play button and wait for the game inside the frame to say it is playing.
import { type ConsoleMessage, expect, type FrameLocator, type Page } from '@playwright/test'

export const WORDS = {
  title: 'Automata Framework: finish the game your agent started',
  wordmark: 'automata',
  claim: 'Finish the game your agent started.',
  lede: 'Your coding agent can make a playable demo in a weekend. Saves, menus, settings, touch controls and publishing are what take the weeks after that. Automata Framework is a toolkit that will have them built in.',
  tag: 'Being built',
  tagLink: 'See what works today',
  play: { bar: 'Play the game', main: 'Play the first game', sheet: 'Play it' },
  made: 'See how it is made',
  keys: 'Arrow keys to move. Space to jump.',
  fingers: 'Use the buttons on the game.',
  loading: 'Loading the game…',
  noScript: "This game needs JavaScript. Turn it on in your browser's settings, then load this page again.",
  kickers: ['Built for agents', 'Checks', 'Where it stands'],
  headings: [
    'That whole level is one small file.',
    "Your agent can't quietly break your game.",
    'What works today, and what is still being built.',
    'Want to make your own game with it?',
  ],
  subs: [
    'A game is small files with plain names. Your agent finds the right one, changes it, and the game changes.',
    'One play of the game is recorded. Every time the game changes, that play runs again in four places. All four have to end the same way, or the change does not pass.',
  ],
  points: [
    'You can read it. Each # is a wall and each dot is air.',
    'Nothing is hidden. What is in the file is what the game plays.',
  ],
  more: ["See all of the game's files", 'See the latest check'],
  panelFoot: 'Part of the file is shown here. Read the whole file',
  closing: 'Not yet. Follow the toolkit on GitHub and you will see the day it is ready.',
  follow: 'Follow on GitHub',
  footerLine: 'Automata Framework is free and MIT licensed.',
  footerHeads: ['Look inside', 'About'],
  footerLinks: [
    { name: "The game's files", href: 'https://github.com/mcthaydt/AutomataFrameworkExamples' },
    { name: "The toolkit's files", href: 'https://github.com/mcthaydt/AutomataFramework' },
    { name: 'What works today', href: '#today' },
    { name: 'Licences', href: '/licences.txt' },
  ],
  numbersTail: [
    ' play the game exactly the same way',
    'of recorded play, run again every time the game changes',
    "hold all of the game's content",
    'licensed and free to use',
  ],
}

export const FRAME = 'iframe[title="The demo game"]'
export const BAR_AT = 700

/** The Play buttons a visitor can see at this width: the bar's only shows where the bar shows its things. */
export const playNames = (width: number): string[] =>
  width >= BAR_AT ? [WORDS.play.bar, WORDS.play.main, WORDS.play.sheet] : [WORDS.play.main, WORDS.play.sheet]

export const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true })

/**
 * How long a game may take to say it is playing, the same 15 seconds the build allows for its own picture of the game.
 * Audit F7: with 5 seconds a journey failed once on a Chromium tablet. The times printed by every press since show the
 * cause: the first press of a test starts the game cold (a page, a WebAssembly file and a software-drawn canvas) and
 * takes 1.0 to 1.3 seconds against 0.5 to 0.7 for the next, and one in this run took 3.8 seconds when the runner's
 * other worker was busy. A game that hangs still fails (with its state and its console in the message); a game that is
 * only slow does not fail a journey that is not about speed, and its time is printed so a creeping one is seen.
 */
export const PLAYING_MS = 15_000

/** The page's own `#game`: its `data-state` is what the page believes the game is doing. */
export const pageGame = (page: Page) => page.locator('#game')

/** The request for the game's page in its watching form, and the request for the game to play. */
export const isWatchRequest = (url: URL): boolean =>
  url.pathname === '/play/' && url.searchParams.has('watch')
export const isGameRequest = (url: URL): boolean =>
  url.pathname === '/play/' && !url.searchParams.has('watch')

/**
 * Holds back the game's page in its watching form until the returned function is called, so the page stays as it is
 * while the game is still on its way. A request the page has given up on by then is let go without a word.
 */
export async function holdWatching(page: Page): Promise<() => void> {
  let release: () => void = () => {}
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route(isWatchRequest, async (route) => {
    await gate
    await route.continue().catch(() => {})
  })
  return release
}

/** Waits until the page says the game is playing itself. The first look at a cold game takes as long as a first press. */
export async function untilWatching(page: Page): Promise<void> {
  await expect(pageGame(page), 'the game plays itself').toHaveAttribute('data-state', 'watching', {
    timeout: PLAYING_MS,
  })
}

/**
 * Presses a Play button (the sheet's by default) and waits until the game inside the frame says it is playing. The game
 * is let play itself first, as a person would see it, unless the press is `early`: a press before the game is ready is
 * its own journey, and a game still on its way would otherwise be given up on with a request that is cancelled. When
 * the game does not say it is playing, the failure names the button that was pressed and says what the game was doing
 * instead (audit F7): the state it showed, the words on its screen, what its console said and how long it had been.
 * When it does, how long it took is printed, so a run that passes slowly can be told from one that passes fast.
 */
export async function play(
  page: Page,
  name: string = WORDS.play.sheet,
  options: { early?: boolean } = {},
): Promise<FrameLocator> {
  if (options.early !== true) await untilWatching(page)
  const said: string[] = []
  const listen = (message: ConsoleMessage): void => {
    if (message.type() === 'error' || message.type() === 'warning')
      said.push(`${message.type()}: ${message.text()}`)
  }
  page.on('console', listen)
  const pressed = Date.now()
  await button(page, name).click()
  const game = page.frameLocator(FRAME)
  const root = game.locator('#game')
  try {
    await expect(root, `"${name}" was pressed`).toHaveAttribute('data-state', 'playing', {
      timeout: PLAYING_MS,
    })
  } catch (error) {
    const state = await root.getAttribute('data-state', { timeout: 500 }).catch(() => 'no game page yet')
    const words = await root.innerText({ timeout: 500 }).catch(() => '(nothing to read)')
    const frames = await page.locator(FRAME).count()
    throw new Error(
      `Pressing "${name}" did not start the game: after ${Date.now() - pressed} ms its state was ` +
        `"${state}" (frames on the page: ${frames}). Its words: ${JSON.stringify(words)}. ` +
        `Its console: ${JSON.stringify(said)}.\n${error instanceof Error ? error.message : String(error)}`,
    )
  } finally {
    page.off('console', listen)
  }
  console.log(`"${name}" was playing after ${Date.now() - pressed} ms`)
  return game
}

/** The height of the game's frame, in pixels, or 0 when there is none. */
export const frameHeight = async (page: Page): Promise<number> =>
  (await page.locator(FRAME).boundingBox())?.height ?? 0

/**
 * Points on the game's picture that are inside the window: the middle and near each corner of what shows. The picture
 * is brought to the middle of the window first, because on a phone it starts below the first screen and a point
 * outside the window has nothing at it to find.
 */
export async function pointsOnPicture(page: Page): Promise<{ x: number; y: number }[]> {
  return page.locator('#game').evaluate((game) => {
    game.scrollIntoView({ block: 'center', behavior: 'instant' })
    const box = game.getBoundingClientRect()
    const left = Math.max(box.left, 0) + 4
    const right = Math.min(box.right, innerWidth) - 4
    const top = Math.max(box.top, 0) + 4
    const bottom = Math.min(box.bottom, innerHeight) - 4
    return [
      { x: (left + right) / 2, y: (top + bottom) / 2 },
      { x: left, y: top },
      { x: right, y: top },
      { x: left, y: bottom },
      { x: right, y: bottom },
    ]
  })
}

/** What is at each point, said as a tag and a class: it must be the game's own picture, or the game's own frame. */
export async function whatIsAt(page: Page, points: { x: number; y: number }[]): Promise<string[]> {
  return page.evaluate(
    (at) =>
      at.map((point) => {
        const element = document.elementFromPoint(point.x, point.y)
        return `${element?.tagName.toLowerCase()}.${element?.className ?? ''}`
      }),
    points,
  )
}
