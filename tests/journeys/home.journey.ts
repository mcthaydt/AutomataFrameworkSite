// The home page as a first-time visitor meets it, at every size, in every engine: what it says, what to press, that the
// first press works, and what happens to a slow game, a double tap, a turned phone and a page with no JavaScript.
// Every word is asserted word for word: a word that changes here must change in index.html on purpose. Every number is
// read from the `facts.json` the build wrote, so a page that said one thing and a game that held another would fail.
import { type ConsoleMessage, expect, type FrameLocator, type Page, test } from '@playwright/test'
import { isCommit, parseVersion } from '../../src/features/version/version.ts'
import { addresses, GAME_REPO, siteFacts, words } from './facts.ts'
import { arrive, fitsSideways, tabKey } from './look.ts'
import { SIZES } from './sizes.ts'
import { watchForTrouble } from './watch.ts'

const WORDS = {
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

const FRAME = 'iframe[title="The demo game"]'
const BAR_AT = 700

/** The Play buttons a visitor can see at this width: the bar's only shows where the bar shows its things. */
const playNames = (width: number): string[] =>
  width >= BAR_AT ? [WORDS.play.bar, WORDS.play.main, WORDS.play.sheet] : [WORDS.play.main, WORDS.play.sheet]

const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true })

/** How long a game may take to say it is playing. Not made longer until a failure has shown that time is the cause. */
const PLAYING_MS = 5_000

/**
 * Presses a Play button (the sheet's by default) and waits until the game inside the frame says it is playing. When it
 * does not, the failure names the button that was pressed and says what the game was doing instead (audit F7): the
 * state it showed, the words on its screen, what its console said and how long it had been. When it does, how long it
 * took is printed, so a run that passes slowly can be told from one that passes fast.
 */
async function play(page: Page, name: string = WORDS.play.sheet): Promise<FrameLocator> {
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
const frameHeight = async (page: Page): Promise<number> =>
  (await page.locator(FRAME).boundingBox())?.height ?? 0

/**
 * Points on the game's picture that are inside the window: the middle and near each corner of what shows. The picture
 * is brought to the middle of the window first, because on a phone it starts below the first screen and a point
 * outside the window has nothing at it to find.
 */
async function pointsOnPicture(page: Page): Promise<{ x: number; y: number }[]> {
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
async function whatIsAt(page: Page, points: { x: number; y: number }[]): Promise<string[]> {
  return page.evaluate(
    (at) =>
      at.map((point) => {
        const element = document.elementFromPoint(point.x, point.y)
        return `${element?.tagName.toLowerCase()}.${element?.className ?? ''}`
      }),
    points,
  )
}

for (const size of SIZES) {
  test.describe(size.name, () => {
    test.use({ viewport: { width: size.width, height: size.height } })

    test('the page says what it is and what to press', async ({ page, request }) => {
      const trouble = watchForTrouble(page)
      const facts = await siteFacts(request)
      await arrive(page)
      await expect(page).toHaveTitle(WORDS.title)
      const wordmark = page.locator('header.top').getByRole('link', { name: 'Automata Framework, home' })
      await expect(wordmark).toHaveText(WORDS.wordmark)
      await expect(wordmark).toHaveAttribute('href', '/')
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(WORDS.claim)
      await expect(page.locator('p.lede')).toHaveText(WORDS.lede)
      await expect(page.locator('a.tag b')).toHaveText(WORDS.tag)
      await expect(page.locator('a.tag span')).toHaveText(WORDS.tagLink)
      await expect(page.locator('a.tag')).toHaveAttribute('href', '#today')
      const made = page.getByRole('link', { name: WORDS.made, exact: true })
      await expect(made).toHaveAttribute('href', addresses(facts).files)
      expect(addresses(facts).files.startsWith(GAME_REPO)).toBe(true)
      // The bar shows its things from 700 px wide, and none of the three below.
      const bar = page.locator('header.top nav')
      for (const [thing, locator] of [
        ['What works today', bar.getByRole('link', { name: 'What works today', exact: true })],
        ['GitHub', bar.getByRole('link', { name: 'GitHub', exact: true })],
        [WORDS.play.bar, button(page, WORDS.play.bar)],
      ] as const) {
        if (size.width >= BAR_AT) await expect(locator, thing).toBeVisible()
        else await expect(locator, thing).toBeHidden()
      }
      await expect(button(page, WORDS.play.main)).toBeVisible()
      await expect(button(page, WORDS.play.sheet)).toBeVisible()
      expect(await fitsSideways(page)).toBe(true)
      expect(trouble()).toEqual([])
    })

    test('before any scroll, the wordmark, the claim, the lede and the main Play button are all in the window', async ({
      page,
    }) => {
      await arrive(page)
      expect(await page.evaluate(() => window.scrollY)).toBe(0)
      await expect(page.locator('header.top .wordmark')).toBeInViewport({ ratio: 1 })
      await expect(page.getByRole('heading', { level: 1 })).toBeInViewport({ ratio: 1 })
      await expect(page.locator('p.lede')).toBeInViewport({ ratio: 1 })
      await expect(button(page, WORDS.play.main)).toBeInViewport({ ratio: 1 })
      // What a newcomer sees first: people look at this picture, and then at the whole page.
      await page.screenshot({ path: `tests/journeys/__screenshots__/${size.name}-arrival.png` })
      await page.screenshot({ path: `tests/journeys/__screenshots__/${size.name}-whole.png`, fullPage: true })
    })

    test("the game's real picture is on the sheet before Play is pressed", async ({ page }) => {
      await arrive(page)
      const poster = page.locator('img.poster')
      await expect(poster).toBeVisible()
      expect(
        await poster.evaluate((image: HTMLImageElement) => [image.complete, image.naturalWidth]),
      ).toEqual([true, 2560])
      await expect(page.locator('iframe')).toHaveCount(0)
      await expect(page.locator('#game')).toHaveAttribute('data-state', 'ready')
    })

    test('the sheet says which game it is, how to play it, and which version', async ({ page, request }) => {
      const facts = await siteFacts(request)
      const said = words(facts)
      await arrive(page)
      await expect(page.locator('.sheet-head b')).toHaveText(said.name ?? '')
      await expect(page.locator('.title-block dd').nth(1)).toHaveText(said.levelSize ?? '')
      await expect(page.locator('.title-block dd').nth(2)).toHaveText(`Plays the same in ${said.enginesList}`)
      const version = page.locator('.title-block a')
      await expect(version).toHaveText(said.version ?? '')
      await expect(version).toHaveAttribute('href', addresses(facts).version)
      // Exactly one way of saying how to play is shown: keys for a mouse, buttons for a finger.
      await expect(page.locator('.how.keys')).toHaveText(WORDS.keys)
      await expect(page.locator('.how.fingers')).toHaveText(WORDS.fingers)
      expect(await page.locator('.how:visible').count()).toBe(1)
    })

    test('pressing each Play button starts the game inside the page', async ({ page }) => {
      const trouble = watchForTrouble(page)
      for (const name of playNames(size.width)) {
        await arrive(page)
        const game = await play(page, name)
        await expect(page.locator(FRAME)).toHaveCount(1)
        await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing')
        await expect(page.locator('img.poster')).toBeHidden()
        await expect(button(page, WORDS.play.sheet)).toBeHidden()
        await expect(page.getByRole('status')).toBeHidden()
        const canvas = await game.locator('canvas').boundingBox()
        expect(canvas?.width ?? 0, name).toBeGreaterThan(100)
        expect(canvas?.height ?? 0, name).toBeGreaterThan(100)
        await expect(page.locator(FRAME)).toBeInViewport()
        const frame = await page.locator(FRAME).boundingBox()
        expect(frame?.x ?? -1, name).toBeGreaterThanOrEqual(0)
        expect((frame?.x ?? 0) + (frame?.width ?? 0), name).toBeLessThanOrEqual(size.width)
        expect(frame?.height ?? 0, name).toBeGreaterThanOrEqual(200)
      }
      await page.screenshot({ path: `tests/journeys/__screenshots__/${size.name}.png` })
      expect(trouble()).toEqual([])
    })

    test('the keys reach the game with no second click', async ({ page }) => {
      await arrive(page)
      const game = await play(page)
      const canvas = game.locator('canvas')
      const before = await canvas.screenshot()
      await page.keyboard.down('ArrowRight')
      await expect.poll(async () => (await canvas.screenshot()).equals(before)).toBe(false)
      await page.keyboard.up('ArrowRight')
    })

    test("the numbers, the file and the table are the game's own", async ({ page, request }) => {
      const facts = await siteFacts(request)
      const said = words(facts)
      const where = addresses(facts)
      await arrive(page)
      const numbers = page.locator('.numbers > div')
      await expect(numbers.nth(0).locator('dt')).toHaveText(said.enginesCount ?? '')
      await expect(numbers.nth(0).locator('dd')).toHaveText(`${said.enginesList}${WORDS.numbersTail[0]}`)
      await expect(numbers.nth(1).locator('dt')).toHaveText(said.steps ?? '')
      await expect(numbers.nth(1).locator('dd')).toHaveText(WORDS.numbersTail[1] ?? '')
      await expect(numbers.nth(2).locator('dt')).toHaveText(said.filesCount ?? '')
      await expect(numbers.nth(2).locator('dd')).toHaveText(WORDS.numbersTail[2] ?? '')
      await expect(numbers.nth(3).locator('dt')).toHaveText(facts.licence)
      await expect(numbers.nth(3).locator('dd')).toHaveText(WORDS.numbersTail[3] ?? '')
      const heads = page.locator('.panel-head')
      await expect(heads.nth(0)).toHaveText(facts.level.path)
      await expect(heads.nth(1)).toHaveText(`${facts.replay.path} · ${said.steps}`)
      const code = page.locator('.code')
      await expect(code).toContainText(facts.level.firstRow)
      await expect(code).toContainText(facts.level.lastRow)
      if (facts.level.thing !== undefined) await expect(code).toContainText(facts.level.thing.character)
      const rows = page.locator('#checks tbody tr')
      await expect(rows).toHaveCount(facts.engines.length)
      for (const [at, engine] of facts.engines.entries()) {
        await expect(rows.nth(at).locator('th')).toHaveText(engine)
        await expect(rows.nth(at).locator('td')).toHaveText('Same ending')
      }
      await expect(page.locator('.panel-foot [data-fact="replay-ending"]')).toHaveText(facts.replay.ending)
      for (const [name, href] of [
        ["See all of the game's files", where.files],
        ['Read the whole file', where.level],
        ['See the latest check', where.checks],
      ] as const) {
        await expect(page.getByRole('link', { name, exact: true }), name).toHaveAttribute('href', href)
      }
    })

    test('the page says, below the game, why to care, in these words', async ({ page }) => {
      await arrive(page)
      await expect(page.locator('.kicker')).toHaveText(WORDS.kickers)
      await expect(page.getByRole('heading', { level: 2 })).toHaveText(WORDS.headings)
      await expect(page.locator('.sub')).toHaveText(WORDS.subs)
      await expect(page.locator('.points li')).toHaveText(WORDS.points)
      await expect(page.locator('.more a')).toHaveText(WORDS.more)
      await expect(page.locator('#files .panel-foot')).toHaveText(WORDS.panelFoot)
      await expect(page.locator('.closing p')).toHaveText(WORDS.closing)
      const follow = page.getByRole('link', { name: WORDS.follow, exact: true })
      await expect(follow).toHaveAttribute('href', 'https://github.com/mcthaydt/AutomataFramework')
      await expect(page.locator('footer p')).toHaveText(WORDS.footerLine)
      await expect(page.locator('footer h3')).toHaveText(WORDS.footerHeads)
      const links = page.locator('footer nav a')
      await expect(links).toHaveText(WORDS.footerLinks.map((link) => link.name))
      for (const [at, link] of WORDS.footerLinks.entries()) {
        await expect(links.nth(at), link.name).toHaveAttribute('href', link.href)
      }
      expect(await fitsSideways(page)).toBe(true)
    })

    test('five claims, each with a stamp that says where it stands', async ({ page }) => {
      await arrive(page)
      const cards = page.locator('.claims .claim')
      await expect(cards).toHaveCount(5)
      await expect(cards.locator('.number')).toHaveText(['01', '02', '03', '04', '05'])
      await expect(cards.locator('h3')).toHaveText([
        "Your agent can't quietly break your game",
        'Built for agents',
        'The part after the demo is already done',
        'Change it yourself, without another prompt',
        'Get it in front of players',
      ])
      // The Owner's answer to Q1: one claim works today and four are being built.
      await expect(cards.locator('.stamp')).toHaveText([
        'Works today',
        'Being built',
        'Being built',
        'Being built',
        'Being built',
      ])
      await expect(cards.locator('.stamp.works')).toHaveCount(1)
      await expect(cards.nth(0).locator('.stamp')).toHaveClass(/works/)
    })

    test('"What works today" in the bar, the tag and the footer all go to the list', async ({ page }) => {
      await arrive(page)
      const ways = [
        page.locator('header.top nav').getByRole('link', { name: 'What works today', exact: true }),
        page.locator('a.tag'),
        page.locator('footer').getByRole('link', { name: 'What works today', exact: true }),
      ]
      for (const way of ways) {
        if (!(await way.isVisible())) continue
        await page.evaluate(() => window.scrollTo(0, 0))
        await way.click()
        await expect(page.locator('#today h2')).toBeInViewport()
      }
    })
  })
}

// The cases that are about behaviour, not layout, run at the largest and the smallest size only.
for (const size of [SIZES[4], SIZES[0]]) {
  test.describe(`${size.name}: what can go wrong`, () => {
    test.use({ viewport: { width: size.width, height: size.height } })

    test('a slow game says it is loading beside its picture, and then stops saying it', async ({ page }) => {
      let release: () => void = () => {}
      const gate = new Promise<void>((resolve) => {
        release = resolve
      })
      await page.route('**/play/', async (route) => {
        await gate
        await route.continue()
      })
      await arrive(page)
      await button(page, WORDS.play.sheet).click()
      // The note is in the sheet's bar, where "Play it" was, never over the picture.
      const note = page.locator('.sheet-head').getByRole('status')
      await expect(note).toHaveText(WORDS.loading)
      await expect(note).toBeInViewport()
      await expect(page.locator('#game')).toHaveAttribute('data-state', 'loading')
      await expect(page.locator('img.poster')).toBeVisible()
      expect(await page.locator(FRAME).evaluate((element) => getComputedStyle(element).visibility)).toBe(
        'hidden',
      )
      expect(
        await page.locator('#game').evaluate((game) => [...game.children].map((child) => child.tagName)),
      ).toEqual(['IMG', 'IFRAME'])
      expect(new Set(await whatIsAt(page, await pointsOnPicture(page)))).toEqual(new Set(['img.poster']))
      release()
      await expect(note).toBeHidden()
      await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing')
    })

    test("nothing of the site's is over the game's picture, before Play", async ({ page }) => {
      await arrive(page)
      expect(
        await page.locator('#game').evaluate((game) => [...game.children].map((child) => child.tagName)),
      ).toEqual(['IMG'])
      expect(new Set(await whatIsAt(page, await pointsOnPicture(page)))).toEqual(new Set(['img.poster']))
    })

    test('a double press starts one game', async ({ page }) => {
      await arrive(page)
      await button(page, WORDS.play.sheet).dblclick()
      await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing')
      await expect(page.locator('iframe')).toHaveCount(1)
    })

    test('a press while the game plays goes back to the game and starts no second one', async ({ page }) => {
      await arrive(page)
      await play(page)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      const again = button(page, WORDS.play.main)
      await again.scrollIntoViewIfNeeded()
      await again.click()
      await expect(page.locator('iframe')).toHaveCount(1)
      await expect(page.locator(FRAME)).toBeInViewport()
      await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing')
    })

    test.describe('with JavaScript off', () => {
      test.use({ javaScriptEnabled: false })

      test('the picture, the note, the facts and no Play button', async ({ page, request }) => {
        const facts = await siteFacts(request)
        await page.goto('/')
        // Not getByText: Playwright's text search skips what is inside a <noscript>.
        await expect(page.locator('p.no-script')).toHaveText(WORDS.noScript)
        await expect(page.locator('p.no-script')).toBeVisible()
        await expect(page.locator('img.poster')).toBeVisible()
        await expect(page.locator('[data-play]:visible')).toHaveCount(0)
        await expect(page.locator('.sheet-head b')).toHaveText(facts.name)
        await expect(page.locator('.claims .stamp')).toHaveCount(5)
        expect(
          await page.locator('#game').evaluate((game) => [...game.children].map((child) => child.tagName)),
        ).toEqual(['IMG'])
      })
    })
  })
}

// The top bar is kept at the top of a window tall enough to spare it, so a Play button is in reach from anywhere.
for (const size of [SIZES[4], SIZES[2]]) {
  test.describe(`${size.name}: the top bar`, () => {
    test.use({ viewport: { width: size.width, height: size.height } })

    test("the bar's Play button, pressed at the bottom of the page, brings the game up and starts it", async ({
      page,
    }) => {
      await arrive(page)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      // Already in the window: a click that had to scroll back up to find the button would prove nothing.
      const bar = button(page, WORDS.play.bar)
      await expect(bar).toBeInViewport({ ratio: 1 })
      await bar.click()
      await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing')
      await expect(page.locator(FRAME)).toBeInViewport()
      const frame = await page.locator(FRAME).boundingBox()
      const header = await page.locator('header.top').boundingBox()
      expect(frame?.y ?? -1).toBeGreaterThanOrEqual(Math.round((header?.y ?? 0) + (header?.height ?? 0)) - 1)
    })

    test('the bar stays at the top while the page scrolls, and a press on it stops short of the bar', async ({
      page,
    }) => {
      await arrive(page)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      const header = page.locator('header.top')
      expect(Math.round((await header.boundingBox())?.y ?? -1)).toBe(0)
      await expect(button(page, WORDS.play.bar)).toBeInViewport({ ratio: 1 })
      await header.getByRole('link', { name: 'What works today', exact: true }).click()
      const title = page.locator('#today h2')
      await expect(title).toBeInViewport({ ratio: 1 })
      const bottom = Math.round(
        ((await header.boundingBox())?.y ?? 0) + ((await header.boundingBox())?.height ?? 0),
      )
      await expect.poll(async () => Math.round((await title.boundingBox())?.y ?? 0)).toBeGreaterThan(bottom)
    })
  })
}

test.describe('phone-844x390: a short window', () => {
  test.use({ viewport: { width: 844, height: 390 } })

  test('the bar is not kept: it scrolls away, so the playing game can take the whole window', async ({
    page,
  }) => {
    await arrive(page)
    await page.evaluate(() => window.scrollTo(0, 400))
    const header = await page.locator('header.top').boundingBox()
    expect((header?.y ?? 0) + (header?.height ?? 0)).toBeLessThanOrEqual(0)
  })
})

test.describe('phone-390x844: turning the phone', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('keeps the same game going', async ({ page }) => {
    await arrive(page)
    await play(page)
    // A reloaded frame would lose this marker.
    const frame = await (await page.locator(FRAME).elementHandle())?.contentFrame()
    await frame?.evaluate(() => {
      ;(window as unknown as { keptThroughTheTurn: boolean }).keptThroughTheTurn = true
    })
    await page.setViewportSize({ width: 844, height: 390 })
    await expect(page.locator(FRAME)).toBeVisible()
    // Turned sideways, the game still takes the whole window.
    await expect.poll(() => frameHeight(page)).toBeGreaterThanOrEqual(389)
    await expect.poll(() => frameHeight(page)).toBeLessThanOrEqual(391)
    expect(
      await frame?.evaluate(() => (window as unknown as { keptThroughTheTurn?: boolean }).keptThroughTheTurn),
    ).toBe(true)
    await expect(page.frameLocator(FRAME).locator('#game')).toHaveAttribute('data-state', 'playing')
    expect(await fitsSideways(page)).toBe(true)
  })
})

// A phone held sideways has little height, so the playing game must take all of it: a thumb that swipes there has to play,
// not scroll the page.
test.describe('phone-844x390: playing sideways', () => {
  test.use({ viewport: { width: 844, height: 390 } })

  test('the game fills the window, from its top edge to its bottom edge', async ({ page }) => {
    await arrive(page)
    await play(page)
    await expect
      .poll(async () => Math.abs((await page.locator(FRAME).boundingBox())?.y ?? 99))
      .toBeLessThanOrEqual(1)
    await expect.poll(() => frameHeight(page)).toBeGreaterThanOrEqual(389)
    await expect.poll(() => frameHeight(page)).toBeLessThanOrEqual(391)
  })
})

// The same page for a device set to light: the site is dark whatever the device says, so it must look the same.
test.describe('phone-390x844: a device set to light', () => {
  test.use({ viewport: { width: 390, height: 844 }, colorScheme: 'light' })

  test('looks like every other arrival', async ({ page }) => {
    await arrive(page)
    await page.screenshot({ path: 'tests/journeys/__screenshots__/phone-390x844-arrival-light-setting.png' })
  })
})

// A person using the keyboard reaches the main Play button and sees where they are.
test.describe('phone-390x844: reaching the button with the keyboard', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('the main Play button has the focus ring', async ({ page, browserName }) => {
    await arrive(page)
    const main = button(page, WORDS.play.main)
    for (
      let press = 0;
      press < 10 && !(await main.evaluate((element) => element === document.activeElement));
      press++
    )
      await page.keyboard.press(tabKey(browserName))
    await expect(main).toBeFocused()
    await page.screenshot({ path: 'tests/journeys/__screenshots__/phone-390x844-focus.png' })
  })
})

// The touch buttons are the only way to play on a phone, so a journey presses them: the page's frame must pass touches
// on, and its layout must leave the buttons wholly on screen.
for (const size of [SIZES[0], SIZES[2]]) {
  test.describe(`${size.name}: with a finger`, () => {
    test.use({ viewport: { width: size.width, height: size.height }, hasTouch: true })

    test('the buttons are on screen and holding one moves the game', async ({ page, request }) => {
      await arrive(page)
      const game = await play(page)
      await page.locator(FRAME).tap()
      const version = parseVersion(await (await request.get('/version.json')).text())
      // The stand-in game has one button; the real game has three.
      const names = version !== undefined && isCommit(version.game) ? ['Left', 'Right', 'Jump'] : ['Right']
      for (const name of names) {
        const touch = game.getByRole('button', { name, exact: true })
        await expect(touch).toBeVisible()
        const box = await touch.boundingBox()
        expect(box?.x ?? -1).toBeGreaterThanOrEqual(0)
        expect(box?.y ?? -1).toBeGreaterThanOrEqual(0)
        expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(size.width)
        expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(size.height)
        expect(box?.width ?? 0).toBeGreaterThanOrEqual(44)
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
        // A real tap: Playwright checks that this button is what receives the touch at its middle, and fails if a layer
        // of the page or of the game covers it. (A made-up event goes straight to the button and would not notice.)
        await touch.tap()
      }
      const canvas = game.locator('canvas')
      const before = await canvas.screenshot()
      const right = game.getByRole('button', { name: 'Right', exact: true })
      // A tap cannot be held, so the hold alone is sent as events.
      await right.dispatchEvent('pointerdown', { pointerType: 'touch', isPrimary: true })
      await expect.poll(async () => (await canvas.screenshot()).equals(before)).toBe(false)
      await right.dispatchEvent('pointerup', { pointerType: 'touch', isPrimary: true })
    })
  })
}
