// The home page as a first-time visitor meets it, at every size, in every engine: what it says, what to press, and the
// facts it shows. (What happens when Play is pressed is in `play.journey.ts`, and the top bar is in `bar.journey.ts`.)
// Every word is asserted word for word: a word that changes here must change in index.html on purpose. Every number is
// read from the `facts.json` the build wrote, so a page that said one thing and a game that held another would fail.
import { expect, test } from '@playwright/test'
import { addresses, GAME_REPO, siteFacts, words } from './facts.ts'
import { BAR_AT, button, holdWatching, pageGame, WORDS } from './home.ts'
import { arrive, fitsSideways } from './look.ts'
import { SIZES } from './sizes.ts'
import { watchForTrouble } from './watch.ts'

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

    // The picture is what a visitor sees until the game that plays itself arrives, so the game's page is held back here:
    // it is what a slow connection looks like, and the picture must be whole and in place meanwhile.
    test("the game's real picture is on the sheet until the game that plays itself arrives", async ({
      page,
    }) => {
      const release = await holdWatching(page)
      await arrive(page)
      const poster = page.locator('img.poster')
      await expect(poster).toBeVisible()
      expect(
        await poster.evaluate((image: HTMLImageElement) => [image.complete, image.naturalWidth]),
      ).toEqual([true, 2560])
      await expect(pageGame(page)).toHaveAttribute('data-state', 'ready')
      release()
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
      // The Owner's answer to Q4: until the stamp says "Works today", the card promises "comes built in", not "done".
      await expect(cards.locator('h3')).toHaveText([
        "Your agent can't quietly break your game",
        'Built for agents',
        'The part after the demo comes built in',
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
