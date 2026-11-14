# The Site Wears Blueprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking. No subagents (project rule).

> **Audited 2026-11-14** ([`audits/2026-11-14-blueprint-restyle-plan-audit.md`](../audits/2026-11-14-blueprint-restyle-plan-audit.md)).
> Its findings S1 to S9 are written into this plan already; its notes N1 to N7 are for execution to read. One
> question for the Owner is open (Q2, below); Task 3 waits for it.

**Goal:** The home page and the 404 page wear Blueprint, the look the spec's "Visual direction" section gives the
editors and the site, with not one word of copy changed and the game in the frame left exactly as it is. Onboarding
(a first-time player learns what to do, how to do it and that they did it) is kept by the unchanged words and checked
in Task 4 by questions 1, 2 and 11.

**Architecture:** One stylesheet (`src/styles.css`) holds the five Blueprint colours as custom properties and is the
only place a colour or a font is named, but for one line in each page: the `theme-color` meta, which a browser reads
before any stylesheet and which a test holds to the paper colour. The two fonts come from packages and are served as the site's own files, so
the strict header does not change. Icons are Phosphor's regular SVGs, written into the HTML when the site is built by
a small Node feature (`icons`), so they need no script on the page, take the colour of the words beside them and are
there with JavaScript off.

**Tech Stack:** Vite 8, plain CSS, TypeScript, `@fontsource/ibm-plex-sans-condensed`, `@fontsource/jetbrains-mono`,
`@phosphor-icons/core`, Vitest (Node tests), Playwright (journeys in Chromium, WebKit and Firefox), Cloudflare Pages'
`_headers`.

**Spec:** AutomataFramework's
[`docs/superpowers/specs/2026-11-13-2d-first-layer-design.md`](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/specs/2026-11-13-2d-first-layer-design.md),
the section "Visual direction" (and "The site", "CI and testing", "Constraints"). The research behind the look is in
the private notes and nothing from it is copied here.

**Principles served:** 1 (agent-first: an icon is one documented line of HTML, a colour is one named value in one
file) and 2 (iPad-first: touch sizes and every picture at phone and tablet size, upright and sideways). It breaks
none: no framework dependency, no 3D, no monorepo.

## Open for the Owner (answer before Task 3 starts)

**Q2. Once the game is playing, does the thin chalk line stay round it?** Two audits of this plan read the spec's
"the game's art is never restyled" two ways, so it is the Owner's to say:

- (a) **The line stays.** It is drawn outside the game's box, beside the game and never over it, and the game keeps
  the same frame before and after Play. **The plan is written for (a).**
- (b) **The line goes when the game plays.** Nothing of the site's is drawn round a playing game. Task 3, Step 5
  gains `#game[data-state="playing"] { outline: none; }`, and "the game's own picture is left alone" also expects
  `#game`'s `outline-style` to be `none` once it plays. Nothing else changes.

Tasks 1 and 2 do not depend on it. Execution does not start Task 3 until the coordinator passes on the Owner's
answer; it never picks one by default.

## Asked of the Owner, and answered

**Q1 is answered: (a).** The coordinator passed on the Owner's yes to `@fontsource/ibm-plex-sans-condensed` 5.3.0 and
`@fontsource/jetbrains-mono` 5.3.0 on 2026-11-14 (the plan audit's S6). Nothing is open. The question as it was asked:

**Q1. Are these the font packages the Owner's yes covers?** The spec says how the font files are shipped is the
plan's choice and that a font package needs the Owner's yes; the Owner has said yes to the fonts "as packages". This
plan names the packages, which nobody has named yet:

- (a) `@fontsource/ibm-plex-sans-condensed` 5.3.0 and `@fontsource/jetbrains-mono` 5.3.0 (both SIL Open Font
  License; each is the font's files plus one small CSS file per weight; no script). **The plan is written for (a).**
- (b) other packages the Owner names. Task 1's three `@import` lines and its package list change; nothing else does.
- (c) no package: the font files are copied into `public/fonts/` with their licence files. Task 1 changes; nothing
  else does.

`@phosphor-icons/core` 2.1.1 (MIT) is already approved by name in the spec.

## Depends on

**Pull request 6 (Stage 6, the fixes for F1 to F6) must be on `main` first.** This plan is written against `main`
with that pull request merged: it changes the same stylesheet and the same journey file, and it replaces F4's fix
(see "What this replaces"). Task 1's first step checks it and stops if it is not there.

## Global Constraints

- **The five colours, exactly** (the spec's table): paper `#0A1F3C`, hatch `#0E2A50`, chalk `#EAF2FA`, pencil
  `#8FB0D3`, marker `#FFD447`. Marker means "you can touch this" and is used for nothing else.
- **Type:** IBM Plex Sans Condensed for words, in capitals for labels (headings, buttons, the footer's links, the
  loading line); JetBrains Mono for numbers and measures (the game's version line), tabular. Sentences stay in
  sentence case: capitals are for labels only, and are made by CSS (`text-transform`), never typed. Every heading is
  a label, the 404 page's "This page does not exist." included: it is the page's title, set like a sign. Its link
  ("Go to the home page") and its sentence are not labels.
- **Icons are chalk, or the colour of the words they sit beside** (the spec's table gives icons to chalk). No icon is
  pencil.
- **Dark is the only theme.** The page ignores the device's light or dark setting. No light theme in this plan.
- **Square corners of 2 px, 1 px chalk lines, no shadows** (nothing on the site floats).
- **The game's art is never restyled.** No filter, tint, opacity, blend, rounded corner or border is put on the frame
  or on the game's place once the game plays. Whether the 1 px chalk line round the game's place stays once the game
  plays is Q2; it is an outline, drawn outside the box, so in either answer it is never over the game. The site
  names no colour of the game.
- **Every icon is Phosphor regular and has its words beside it.** No icon stands alone.
- **The strict header stays byte for byte.** `public/_headers` is not edited. No font, icon, style or script comes
  from another address or from a `data:` address.
- **Not one word of copy changes.** Every word in `index.html` and `404.html` stays as it is; the journeys' `WORDS`
  stay as they are.
- **Touch:** targets at least 44 px, the Play button at least 56 px high (as now). Words at least 18 px.
- **Drunk-grandma test:** every screen must let a drunk grandma tell what is happening and what to press. Task 4
  checks the pictures against a written list.
- **Tests run only in GitHub-hosted CI**, in Chromium, WebKit and Firefox. `pnpm lint`, `pnpm typecheck`, `pnpm knip`
  and `pnpm build` may be run before a push; `pnpm test:node` and `pnpm test:journeys` may not.
- **No workflow file changes.** `journeys.yml` already uploads every picture a journey writes and copies it to the
  `ci-screens` branch.
- **Dependencies:** exactly the three packages above, pinned to exact versions, as `devDependencies`. Nothing else.
- **No AI attribution** in commits, the pull request or docs. Before the first commit:
  `git config --global user.name "Dawson McThay" && git config --global user.email "107786093+mcthaydt@users.noreply.github.com"`.
- **Conventional Commits**, one commit per task at least; a source file has at most 600 lines.
- **Privacy:** nothing from the private notes (no product names, no references) goes in this repo.

## What this replaces

- **The light theme.** `prefers-color-scheme` and the light colours leave the stylesheet.
- **The sky behind the Play button, and F4's fix with it.** Until the game plays, its place is a hatch-coloured sheet
  with a chalk line round it, and the Play button is marker yellow with paper-coloured words (11.58 to 1). The site
  no longer copies the game's sky colour (`--sky`), so it knows nothing about the game's art. F4's journey
  (`phone-390x844: dark mode`, a dark button on the light sky) is removed and Task 3's contrast journeys take its
  place, at every size.
- **The picture `phone-390x844-arrival-dark.png`.** It becomes `phone-390x844-arrival-light-setting.png`: the same
  page on a device set to light, which must look the same as on any other.

## Measured while planning

These were tried in a throwaway copy of the site (built, never committed), so execution does not have to find them
out:

- With the three `@import` lines, `vite build` writes the fonts to `dist/assets/` as `.woff2` and `.woff` files and
  the built CSS points at `/assets/…`. Nothing is inlined when `build.assetsInlineLimit` is `0`.
- `pnpm knip` reports all three packages as unused, because it does not read CSS imports or `import.meta.resolve`.
  They go in `knip.json`'s `ignoreDependencies`.
- `import.meta.resolve('@phosphor-icons/core/assets/regular/play.svg')` works; the package exports that path. (It
  also "works" for a name that is no icon: see Task 2, Step 2.) The six
  icons this plan uses exist under those names. Each file is one line:
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="…"/></svg>`.
- `vite.config.ts` can import `./src/build.ts`, and `pnpm typecheck` passes with the plugin below.
- Contrast between the colours (WCAG): chalk on paper 14.58, chalk on hatch 12.68, pencil on paper 7.31, pencil on
  hatch 6.36, marker on paper 11.58, marker on hatch 10.07, paper on marker 11.58. Chalk on marker is 1.26, so chalk
  words never go on marker.

## Review Focus

What the spec implies and a person will meet, most likely first. Each has its test in the task named.

1. **The fonts do not arrive** (a slow line, a blocker). The page must read in the device's own font, and the
   heading, the lede and the Play button must still fit before any scroll. Task 1, "with the fonts blocked".
2. **A narrow phone, 320 px wide.** The heading in capitals with wider letter spacing must not run off the side.
   Task 3, "a 320 px phone".
3. **JavaScript off.** The look and the icons must still be there, and the "needs JavaScript" line must be readable.
   Task 3, "with JavaScript off".
4. **A person using the keyboard.** Every link and the Play button must show the chalk ring when Tab reaches it, at
   3 to 1 or more against what is behind it. Task 3, "the ring shows on everything Tab reaches".
5. **An icon name that does not exist** (a typo by a person or an agent). The build must stop and say which name, in
   which page, and where the names are listed. Task 2, "an unknown name".

## File Structure

```
package.json                          three devDependencies added
knip.json                             ignoreDependencies for the three
vite.config.ts                        assetsInlineLimit 0; the icons plugin (three lines)
index.html, 404.html                  the dark metas; icon placeholders; no word changed
src/styles.css                        rewritten: the Blueprint stylesheet
src/build.ts                          also exports the icons feature
src/features/icons/icons.ts           the feature's entry: re-exports the two below
src/features/icons/inline.ts          pure: swaps each placeholder in a page for its SVG
src/features/icons/read.ts            Node: reads one Phosphor regular icon from the package
tests/architecture/rules.ts           `icons` joins the layers and Node's side
tests/features/icons/inline.test.ts
tests/features/icons/read.test.ts
tests/fixtures/contrast.ts            the WCAG contrast sum, shared by a Node test and the journeys
tests/styles/tokens.test.ts           reads the stylesheet: the five colours, dark only, the measured contrasts
tests/journeys/look.ts                helpers for the journeys below (what is on the page, in colours)
tests/journeys/look.journey.ts        the look, at every size, in every engine
tests/journeys/not-found.journey.ts   the 404 page, at every size
tests/journeys/home.journey.ts        fonts awaited before measuring; F4's journey removed; new pictures
tests/journeys/hosting.journey.ts     the header pinned as one exact line
README.md, CLAUDE.md                  the look, the icons, the approved packages, tests/styles/
docs/superpowers/progress.md          Cycle 2, updated at every task
```

`tests/journeys/sizes.ts`, `tests/journeys/watch.ts`, `public/_headers`, `src/features/play/`, `src/features/page/`
and every workflow file are not changed.

## Progress points (Cycle 2 in `progress.md`)

The plan is 10 points, its audit 5, execution 45, the implementation audit 15, fixes 15, the Owner's review 10.
Inside execution: Task 1 is 10 points, Task 2 is 10, Task 3 is 20, Task 4 is 5. After each task, set Stage 4's
percentage and the overall percentage in `progress.md`, add a line to its log, and report one line to the coordinator
(the commit, the test counts from CI, any surprise).

## How every task is verified

Tests are never run locally. For every task: write the tests, write the code, run
`pnpm lint && pnpm typecheck && pnpm knip && pnpm build`, commit, push, and read the pull request's runs:

```
gh run list --branch "$(git branch --show-current)" --limit 4
gh run watch <run-id> --exit-status
gh run view <run-id> --log-failed
```

A task is done when `check`, `build` and the three `journeys / engines (…)` jobs are green, and so are `build-real`
and the three `journeys-real / engines (…)` jobs when `site` ran them. "Red first" in a step means: push the test
with the code missing only when the step says so; otherwise one push per task is enough, because each red run costs
ten minutes of all three engines. A journey that passes only on a second run is a defect to report, never a rerun.

---

### Task 1: The fonts, as the site's own files

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`, `knip.json`, `vite.config.ts`, `src/styles.css` (the top and `body`),
  `tests/journeys/home.journey.ts`, `tests/journeys/hosting.journey.ts`, `CLAUDE.md`, `docs/superpowers/progress.md`
- Create: `tests/journeys/look.ts`, `tests/journeys/look.journey.ts`

**Interfaces:**
- Produces, in `tests/journeys/look.ts`:
  - `arrive(page: Page, address?: string): Promise<void>`: `page.goto(address ?? '/')`, then waits for
    `document.fonts.ready`. Every journey that measures or takes a picture uses it in place of `page.goto`.
  - `settle(page: Page): Promise<void>`: waits until `#game-version` is visible, then for `document.fonts.ready`
    again. The version line arrives after the page's script has fetched `version.json`, and only then does the
    browser ask for the number font, so `arrive` alone can return before either. A journey that takes a picture of
    the whole page, counts what Tab can reach or measures the version line calls it after `arrive`. (Both test games
    have a version file; the journey with the file missing does not call it.)
  - `loadedFonts(page: Page): Promise<string[]>`: for every face in `document.fonts` whose `status` is `'loaded'`,
    `"<family> <weight>"` with any quotes round the family removed, sorted.
  - `LABEL = 'IBM Plex Sans Condensed'`, `MEASURE = 'JetBrains Mono'`.
- Produces, in CSS: `--label` and `--measure` on `:root`.

- [ ] **Step 1: Check what this stands on.** Run `test -f tests/workflows/names.test.ts && git log --oneline -1 -- tests/workflows/names.test.ts`.
  If the file is missing, pull request 6 is not on `main`: stop and report to the coordinator. Then set the git author (Global
  Constraints) and add the Cycle 2 execution row to `progress.md` as "In progress, 0%".

- [ ] **Step 2: Write the journeys.** In `tests/journeys/look.journey.ts`, with a header comment saying what the file
  proves (the look, at every size, in every engine), inside `for (const size of SIZES)` / `test.describe(size.name)`
  with `test.use({ viewport })` as `home.journey.ts` does:

  ```ts
  test("the words are set in the site's own fonts, from the site's own address", async ({ page, baseURL }) => {
    const trouble = watchForTrouble(page)
    const asked: string[] = []
    page.on('request', (request) => asked.push(request.url()))
    await arrive(page)
    await expect(page.locator('#game-version')).toBeVisible()
    await expect.poll(() => loadedFonts(page)).toEqual([`${LABEL} 400`, `${LABEL} 600`, `${MEASURE} 400`])
    const family = (selector: string): Promise<string> =>
      page.locator(selector).evaluate((element) => getComputedStyle(element).fontFamily)
    expect(await family('body')).toContain(LABEL)
    expect(await family('#game-version')).toContain(MEASURE)
    // Nothing is fetched from anywhere but this site, and no font is an inlined data: address.
    const origin = new URL(baseURL ?? '').origin
    expect(asked.filter((url) => !url.startsWith(`${origin}/`) && url !== 'data:,')).toEqual([])
    expect(asked.filter((url) => /\.woff2(\?|$)/.test(url)).length).toBeGreaterThanOrEqual(3)
    expect(trouble()).toEqual([])
  })
  ```

  And once, at `SIZES[0]` (the phone) and at `SIZES[1]` (the phone on its side), Review Focus 1:

  ```ts
  test('with the fonts blocked, the page still reads and still fits before any scroll', async ({ page }) => {
    await page.route(/\.woff2?(\?|$)/, (route) => route.abort())
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport({ ratio: 1 })
    await expect(page.locator('p.lede')).toBeInViewport({ ratio: 1 })
    await expect(page.getByRole('button', { name: 'Play the game' })).toBeInViewport({ ratio: 1 })
    expect(await loadedFonts(page)).toEqual([])
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  })
  ```

  (`watchForTrouble` is not used in that one: the aborted requests are the point.)

- [ ] **Step 3: Pin the header in `tests/journeys/hosting.journey.ts`.** In "every page is sent with its safety
  headers", add, before the existing checks of its parts:

  ```ts
  expect(policy, address).toBe(
    "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' data: blob:; worker-src 'self' blob:; frame-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'",
  )
  ```

- [ ] **Step 4: Add the packages.** Run
  `pnpm add -D -E @fontsource/ibm-plex-sans-condensed@5.3.0 @fontsource/jetbrains-mono@5.3.0 @phosphor-icons/core@2.1.1`.
  In `knip.json` add
  `"ignoreDependencies": ["@fontsource/ibm-plex-sans-condensed", "@fontsource/jetbrains-mono", "@phosphor-icons/core"]`.
  In `CLAUDE.md`, extend the "Dependencies the Owner approved for this repo" bullet with the three, their versions,
  the date of the Owner's yes (2026-11-14), and why knip is told to ignore them (it does not read CSS imports or the
  icon reader's `import.meta.resolve`).

- [ ] **Step 5: Serve the fonts as files.** In `vite.config.ts` add `assetsInlineLimit: 0` to `build`, with a comment:
  the header allows fonts only from the site's own address, so nothing may be inlined as a `data:` address. At the top
  of `src/styles.css` add:

  ```css
  @import "@fontsource/ibm-plex-sans-condensed/latin-400.css";
  @import "@fontsource/ibm-plex-sans-condensed/latin-600.css";
  @import "@fontsource/jetbrains-mono/latin-400.css";
  ```

  Add to `:root` the two families, and use them on `body` and `#game-version`:

  ```css
  --label: "IBM Plex Sans Condensed", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --measure: "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
  ```

  `body` becomes `font: 400 18px / 1.5 var(--label);` and `#game-version` gets
  `font-family: var(--measure); font-variant-numeric: tabular-nums;`. Only the Latin files are imported because every
  word on the site is English; the day the site has another language, that language's files are added here (Korean,
  Japanese and Chinese use Noto Sans for that language, as the spec says). Replace the stylesheet's first comment,
  which says "No font files".

- [ ] **Step 6: Wait for the fonts before measuring.** In `tests/journeys/home.journey.ts`, replace every
  `await page.goto('/')` with `await arrive(page)` except in the test "with JavaScript off" (no script runs there).
  A late font would move the words after a journey had measured them.

- [ ] **Step 7: Verify, commit, push, read CI.** `pnpm lint && pnpm typecheck && pnpm knip && pnpm build`, then
  `ls dist/assets | grep -c woff2` must print `3`. Commit `feat(look): the site's fonts, served as its own files`,
  push, open the pull request as a draft if there is none (its body starts with the project's attribution lines and
  ends with "Requested by **McThayDT**", with no footer), and read the runs. Update `progress.md` (Stage 4 at 22%)
  and report the line.

---

### Task 2: Icons written into the page when it is built

**Files:**
- Create: `src/features/icons/icons.ts`, `src/features/icons/inline.ts`, `src/features/icons/read.ts`,
  `tests/features/icons/inline.test.ts`, `tests/features/icons/read.test.ts`
- Modify: `src/build.ts`, `vite.config.ts`, `tests/architecture/rules.ts`, `index.html`, `404.html`,
  `src/styles.css` (the icon rules), `tests/journeys/look.journey.ts`, `README.md`, `docs/superpowers/progress.md`

**Interfaces:**
- Produces, exported from `src/features/icons/icons.ts` and so from `src/build.ts`:
  - `class IconError extends Error {}`: a failure with a plain sentence, ready to print in a build.
  - `inlineIcons(html: string, read: (name: string) => string | undefined, page?: string): string` (in `inline.ts`,
    no `node:` import).
  - `readIcon(name: string): string | undefined` (in `read.ts`): the text of
    `@phosphor-icons/core/assets/regular/<name>.svg`, found with `import.meta.resolve`, or `undefined` when there is
    no such file.
- The placeholder a page author writes is exactly `<i data-icon="NAME"></i>` (NAME is lower-case letters, digits and
  hyphens). What is written in its place is exactly
  `<svg class="icon" aria-hidden="true" focusable="false" viewBox="0 0 256 256" fill="currentColor">…</svg>`: the
  package's own `<svg …>` opening tag with `xmlns="http://www.w3.org/2000/svg"` swapped for
  `class="icon" aria-hidden="true" focusable="false"`, and everything after it untouched.

- [ ] **Step 1: Write `tests/features/icons/inline.test.ts`** (imports from `#src/features/icons/icons.ts`):

  ```ts
  const PLAY = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M1,2Z"/></svg>'
  const read = (name: string): string | undefined => (name === 'play' ? PLAY : undefined)

  test('a placeholder becomes the icon, hidden from screen readers and coloured like the words beside it', () => {
    expect(inlineIcons('<button><i data-icon="play"></i>Play the game</button>', read)).toBe(
      '<button><svg class="icon" aria-hidden="true" focusable="false" viewBox="0 0 256 256" fill="currentColor"><path d="M1,2Z"/></svg>Play the game</button>',
    )
  })
  test('every placeholder on a page is swapped', () => {
    const out = inlineIcons('<i data-icon="play"></i> and <i data-icon="play"></i>', read)
    expect(out.match(/<svg class="icon"/g)).toHaveLength(2)
    expect(out).not.toContain('data-icon')
  })
  test('a page with no placeholder comes back as it was', () => {
    expect(inlineIcons('<p>Nothing here</p>', read)).toBe('<p>Nothing here</p>')
  })
  test('an unknown name stops the build and says which name, which page and where the names are', () => {
    expect(() => inlineIcons('<i data-icon="plya"></i>', read, 'index.html')).toThrow(IconError)
    expect(() => inlineIcons('<i data-icon="plya"></i>', read, 'index.html')).toThrow(
      'index.html asks for the icon "plya", and there is no icon of that name. The names are the file names in @phosphor-icons/core/assets/regular/ (for example "play").',
    )
  })
  test('a file that is not an icon stops the build too', () => {
    expect(() => inlineIcons('<i data-icon="play"></i>', () => '<html></html>', 'index.html')).toThrow(IconError)
  })
  ```

  When `page` is not given the sentence starts "A page asks for…".

- [ ] **Step 2: Write `tests/features/icons/read.test.ts`:**

  ```ts
  const USED = ['play', 'keyboard', 'device-mobile', 'cursor-click', 'github-logo', 'house']

  test.each(USED)('the icon "%s" is in the package, in the shape inlineIcons expects', (name) => {
    const svg = readIcon(name)
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 256 256" fill="currentColor">/)
    expect(svg).not.toContain('<script')
  })
  test('a name that is not an icon reads as nothing', () => {
    expect(readIcon('no-such-icon')).toBeUndefined()
    expect(readIcon('../package')).toBeUndefined()
  })
  test('every icon the pages ask for is one of the names above', () => {
    for (const file of ['index.html', '404.html']) {
      const html = readFileSync(new URL(`../../../${file}`, import.meta.url), 'utf8')
      for (const [, name] of html.matchAll(/data-icon="([^"]+)"/g)) expect(USED, file).toContain(name)
    }
  })
  ```

  `readIcon` answers `undefined` for any name that is not lower-case letters, digits and hyphens, before it looks
  for a file. For a name of the right shape it must read the file and answer `undefined` when the read fails:
  `import.meta.resolve` gives back an address for an icon that does not exist and does not throw (measured by the
  plan audit, Node 22), so the missing file is only found on reading it. Without that, a mistyped name ends the
  build with Node's own "no such file" and not `IconError`'s sentence. `import.meta.resolve` was tried in Node and in
  the Vite config while planning, never under Vitest; if `read.test.ts` is red in CI because it is missing there,
  use `createRequire(import.meta.url).resolve(…)` from `node:module` (the package exports the same path to both) and
  report the change as a deviation.

- [ ] **Step 3: Write the feature.** `inline.ts`, `read.ts` and `icons.ts` (which only re-exports the two), each with
  a header comment saying its one job and why icons are written in at build time (no script on the page, the words'
  colour, there with JavaScript off). Export the feature from `src/build.ts`. In `tests/architecture/rules.ts`:
  `LAYERS` becomes `['version', 'pick', 'assemble', 'icons', 'play', 'page']`, `'src/features/icons/'` joins
  `NODE_PLACES`, and `'icons'` joins `NODE_FEATURES`.

- [ ] **Step 4: Wire it into the build.** In `vite.config.ts`:

  ```ts
  import { inlineIcons, readIcon } from './src/build.ts'
  // …inside defineConfig:
  plugins: [{ name: 'icons', transformIndexHtml: (html, ctx) => inlineIcons(html, readIcon, ctx.path.replace(/^\//, '')) }],
  ```

  with a comment: every page gets its icons as it is built, and an unknown name fails the build.

- [ ] **Step 5: Put the placeholders in the pages.** No word changes. In `index.html`:
  - the Play button: `<button type="button" class="play" hidden><i data-icon="play"></i>Play the game</button>`
  - the three "How to play" items, each `<li><i data-icon="NAME"></i><span>…the same words…</span></li>`, with
    `keyboard` for "On a computer", `device-mobile` for "On a phone or tablet", `cursor-click` for "Keys not working?"
  - the two footer links, each with `<i data-icon="github-logo"></i>` before its words.

  In `404.html`: `<a class="home" href="/"><i data-icon="house"></i>Go to the home page</a>`.

  In `src/styles.css` add:

  ```css
  /* An icon is as tall as the words beside it and takes their colour (the SVG's fill is currentColor). */
  .icon {
    flex: none;
    width: 1.25em;
    height: 1.25em;
    vertical-align: -0.25em;
  }

  .help {
    padding-left: 0;
    list-style: none;
  }

  .help li {
    display: flex;
    gap: 10px;
  }

  .help .icon {
    margin-top: 0.15em;
  }

  footer .icon,
  .home .icon {
    margin-right: 8px;
  }

  .home {
    display: inline-block;
    min-height: 44px;
    line-height: 44px;
  }
  ```

  and make the Play button a row: `display: inline-flex; align-items: center; justify-content: center; gap: 10px;`
  plus the rule `.play[hidden] { display: none; }`, with a comment: `display` on a class beats the `hidden`
  attribute, and the button must stay hidden until the script shows it.

- [ ] **Step 6: Add the journey** to `tests/journeys/look.journey.ts`, in the per-size block:

  ```ts
  test('every icon has its words beside it and is hidden from screen readers', async ({ page }) => {
    await arrive(page)
    const icons = page.locator('svg.icon')
    await expect(icons).toHaveCount(6)
    await expect(page.locator('[data-icon]')).toHaveCount(0)
    for (const icon of await icons.all()) {
      await expect(icon).toHaveAttribute('aria-hidden', 'true')
      // The words are the icon's neighbours: its parent says something without it.
      expect((await icon.evaluate((svg) => svg.parentElement?.textContent ?? '')).trim().length).toBeGreaterThan(3)
      // …and it is the colour of those words (the SVG's fill is currentColor, and no rule gives an icon its own).
      expect(await icon.evaluate((svg) => getComputedStyle(svg).color === getComputedStyle(svg.parentElement as Element).color)).toBe(true)
      const box = await icon.boundingBox()
      expect(Math.round(box?.width ?? 0)).toBeGreaterThanOrEqual(20)
      expect(Math.round(box?.height ?? 0)).toBeGreaterThanOrEqual(20)
    }
    // The button's name is still its words alone.
    await expect(page.getByRole('button', { name: 'Play the game', exact: true })).toBeVisible()
  })
  ```

- [ ] **Step 7: Say it in the README.** Under a new heading "Icons": an icon is one line, `<i data-icon="play"></i>`,
  put before the words it goes with; the name is a file name from Phosphor's regular set
  (`node_modules/@phosphor-icons/core/assets/regular/`); the build writes the picture in and stops, saying which
  name, if there is no such icon; an icon never stands without words.

- [ ] **Step 8: Verify, commit, push, read CI.** `pnpm lint && pnpm typecheck && pnpm knip && pnpm build`, then
  `grep -c 'class="icon"' dist/index.html dist/404.html` must show 6 and 1. Commit
  `feat(icons): Phosphor icons written into the pages at build time`, push, read the runs, update `progress.md`
  (Stage 4 at 44%) and report the line.

---

### Task 3: The Blueprint stylesheet

**Files:**
- Create: `tests/fixtures/contrast.ts`, `tests/styles/tokens.test.ts`, `tests/journeys/not-found.journey.ts`
- Modify: `src/styles.css` (rewritten), `index.html` and `404.html` (the two metas), `tests/journeys/look.ts`,
  `tests/journeys/look.journey.ts`, `tests/journeys/home.journey.ts`, `CLAUDE.md`, `docs/superpowers/progress.md`

**Interfaces:**
- Produces, in `tests/fixtures/contrast.ts` (pure, no imports):
  - `contrast(a: string, b: string): number`: the WCAG contrast ratio of two colours, each either `#rrggbb` or the
    `rgb(r, g, b)` / `rgba(r, g, b, a)` text a browser's computed style gives (alpha ignored).
- Produces, in `tests/journeys/look.ts`:
  - `TOKENS = { paper: 'rgb(10, 31, 60)', hatch: 'rgb(14, 42, 80)', chalk: 'rgb(234, 242, 250)', pencil: 'rgb(143, 176, 211)', marker: 'rgb(255, 212, 71)' } as const`
  - `colours(page: Page, selector: string): Promise<{ what: string; words: string; ground: string }[]>`: for every
    element matching `selector` that is visible and has text of its own, `what` (its tag, and its first 30
    characters), `words` (its computed `color`) and `ground` (the computed `background-color` of the nearest
    ancestor-or-self whose background is not fully transparent).
  - `groundBehind(page: Page, selector: string): Promise<string>`: the same walk, starting at the element's parent:
    what a focus ring, which is drawn outside its element, is seen against.
  - `READABLE = 'h1, h2, p, li, span, a, button, [role="status"]'`. "Text of its own" means a text node that is the
    element's direct child and is not only spaces, so a `li` whose words are in a `span` is counted once, by its
    `span`.
- Consumes: `arrive`, `loadedFonts` (Task 1); the six icons (Task 2).

- [ ] **Step 1: Write `tests/fixtures/contrast.ts` and `tests/styles/tokens.test.ts`.** The Node test reads
  `src/styles.css` as text:

  ```ts
  const SPEC = { paper: '#0A1F3C', hatch: '#0E2A50', chalk: '#EAF2FA', pencil: '#8FB0D3', marker: '#FFD447' }
  const css = readFileSync(new URL('../../src/styles.css', import.meta.url), 'utf8')
  const token = (name: string): string => new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6});`).exec(css)?.[1]?.toUpperCase() ?? ''

  test.each(Object.entries(SPEC))("%s is the spec's colour, %s", (name, value) => expect(token(name)).toBe(value))
  test('those five are the only colours the stylesheet names', () => {
    expect((css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).map((c) => c.toUpperCase()).sort()).toEqual(Object.values(SPEC).sort())
    expect(css).not.toMatch(/\brgba?\(|\bhsla?\(/)
  })
  test('dark is the only theme', () => {
    expect(css).toMatch(/color-scheme:\s*dark;/)
    expect(css).not.toContain('prefers-color-scheme')
    expect(css).not.toContain('--sky')
  })
  // The one colour named outside the stylesheet: a browser reads it before any stylesheet, so it is held to paper here.
  test.each(['index.html', '404.html'])('%s tells the browser the paper colour, and names no other', (file) => {
    const html = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8')
    expect(html).toContain(`<meta name="theme-color" content="${SPEC.paper}" />`)
    expect(html).toContain('<meta name="color-scheme" content="dark" />')
    expect(html.match(/#[0-9a-fA-F]{6}\b/g)).toEqual([SPEC.paper])
  })
  test('nothing has a shadow, and corners are 2 px', () => {
    expect(css).not.toContain('box-shadow')
    expect(css.match(/border-radius:\s*([^;]+);/g)?.every((line) => line.includes('var(--corner)'))).toBe(true)
    expect(css).toMatch(/--corner:\s*2px;/)
  })
  test('the contrast sum agrees with known pairs', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
    expect(contrast('rgb(10, 31, 60)', 'rgb(234, 242, 250)')).toBeCloseTo(14.58, 1)
  })
  test.each([
    ['chalk', 'paper', 14.5], ['chalk', 'hatch', 12.6], ['pencil', 'paper', 7.3], ['pencil', 'hatch', 6.3],
    ['marker', 'paper', 11.5], ['marker', 'hatch', 10], ['paper', 'marker', 11.5],
  ] as const)('%s on %s is at least %d to 1', (words, ground, least) =>
    expect(contrast(SPEC[words], SPEC[ground])).toBeGreaterThanOrEqual(least))
  ```

  Add `tests/styles/                checks that read the stylesheet` to `CLAUDE.md`'s structure list.

- [ ] **Step 2: Write the look journeys** in `tests/journeys/look.journey.ts`. In the per-size block (so every one
  runs at phone and tablet size, upright and sideways, and at desktop size, in all three engines):

  ```ts
  test('the page is blue paper with chalk words, whatever the device is set to', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await arrive(page)
    const style = (selector: string, property: string): Promise<string> =>
      page.locator(selector).first().evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property)
    expect(await style('body', 'background-color')).toBe(TOKENS.paper)
    expect(await style('body', 'color')).toBe(TOKENS.chalk)
    expect(await style('#game', 'background-color')).toBe(TOKENS.hatch)
    expect(await style('#game', 'outline-color')).toBe(TOKENS.chalk)
    expect(await style('#game-version', 'color')).toBe(TOKENS.pencil)
    expect(await page.locator('meta[name="color-scheme"]').getAttribute('content')).toBe('dark')
    expect(await page.locator('meta[name="theme-color"]').getAttribute('content')).toBe('#0A1F3C')
  })

  test('every word can be read: 4.5 to 1 or more against what is behind it', async ({ page }) => {
    await arrive(page)
    await settle(page)
    const found = await colours(page, READABLE)
    expect(found.length).toBeGreaterThanOrEqual(16)
    for (const { what, words, ground } of found) expect(contrast(words, ground), what).toBeGreaterThanOrEqual(4.5)
  })

  test('yellow means you can touch it, and only that', async ({ page }) => {
    await arrive(page)
    // Every link and the button is marker yellow, in its words or in its ground…
    for (const { what, words, ground } of await colours(page, 'a, button'))
      expect([words, ground], what).toContain(TOKENS.marker)
    // …and nothing else on the page is.
    const others = await page.evaluate((marker) => {
      const yellow: string[] = []
      for (const element of document.querySelectorAll('body *')) {
        if (element.closest('a, button, iframe')) continue
        const style = getComputedStyle(element)
        if ([style.color, style.backgroundColor, style.borderTopColor, style.outlineColor].includes(marker))
          yellow.push(element.tagName)
      }
      return yellow
    }, TOKENS.marker)
    expect(others).toEqual([])
  })

  test('labels are in capitals and sentences are not', async ({ page }) => {
    await arrive(page)
    const transform = (selector: string): Promise<string[]> =>
      page.locator(selector).evaluateAll((all) => all.map((element) => getComputedStyle(element).textTransform))
    for (const label of ['h1', 'h2', 'button.play', 'footer a'])
      expect(new Set(await transform(label)), label).toEqual(new Set(['uppercase']))
    for (const sentence of ['p.lede', 'ul.help li', 'p.playing', 'ul.next li', 'ul.next a'])
      expect(new Set(await transform(sentence)), sentence).toEqual(new Set(['none']))
    // Words are at least 18 px, everywhere.
    const sizes = await page.locator(READABLE).evaluateAll((all) => all.map((element) => parseFloat(getComputedStyle(element).fontSize)))
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(18)
  })

  test('the Play button is the yellow thing, with a chalk ring when the keyboard reaches it', async ({ page }) => {
    await arrive(page)
    const button = page.getByRole('button', { name: 'Play the game' })
    await button.focus()
    expect(await button.evaluate((element) => element.matches(':focus-visible'))).toBe(true)
    const style = await button.evaluate((element) => {
      const s = getComputedStyle(element)
      return { ground: s.backgroundColor, words: s.color, ring: s.outlineColor, width: parseFloat(s.outlineWidth), corner: s.borderTopLeftRadius }
    })
    expect(style).toEqual({ ground: TOKENS.marker, words: TOKENS.paper, ring: TOKENS.chalk, width: 3, corner: '2px' })
    // The ring is drawn outside the button, so it is seen against the sheet behind it, not against the yellow.
    expect(await groundBehind(page, 'button.play')).toBe(TOKENS.hatch)
    expect(contrast(style.ring, TOKENS.hatch)).toBeGreaterThanOrEqual(3)
  })

  test("the game's own picture is left alone", async ({ page }) => {
    await arrive(page)
    await page.getByRole('button', { name: 'Play the game' }).click()
    const frame = page.locator('iframe[title="The demo game"]')
    await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing')
    for (const element of [frame, page.locator('#game')]) {
      const style = await element.evaluate((node) => {
        const s = getComputedStyle(node)
        return { filter: s.filter, opacity: s.opacity, blend: s.mixBlendMode, corner: s.borderTopLeftRadius, border: s.borderTopWidth }
      })
      expect(style).toEqual({ filter: 'none', opacity: '1', blend: 'normal', corner: '0px', border: '0px' })
    }
    // The frame fills its place edge to edge: the chalk line is drawn outside it, never over the game.
    // Rounded: an engine may report the same edge a hair apart for two boxes (Firefox gave 55.99997 for 56 in Cycle 1).
    const edges = async (selector: string): Promise<number[]> => {
      const box = await page.locator(selector).boundingBox()
      return [box?.x, box?.y, box?.width, box?.height].map((edge) => Math.round(edge ?? -1))
    }
    expect(await edges('iframe[title="The demo game"]')).toEqual(await edges('#game'))
  })
  ```

  Also in the per-size block, **"everything that can be pressed is big enough for a thumb"**: after `arrive` and
  `settle`, every visible `a[href]` and every visible `button` has a bounding box at least 44 px high (rounded, as
  `home.journey.ts` rounds for Firefox), and the Play button at least 56. The icons now sit inside the footer's
  links, and until this journey nothing measured them, the link in "What to do next" or the version line's link.

  Outside the per-size block, each with its own `test.describe` and `test.use`:

  - **`phone-320x568: a 320 px phone`** (Review Focus 2): after `arrive`, the document is no wider than the window,
    the `h1`'s box ends at or before 320, and the heading, the lede and the Play button are in the window before any
    scroll.
  - **`phone-390x844: with JavaScript off`** (`javaScriptEnabled: false`, `page.goto('/')`; Review Focus 3): `body`'s
    ground is `TOKENS.paper`; `svg.icon` count is 6; `p.no-script` is visible and its `colours` contrast is at least
    4.5; the Play button is hidden.
  - **`tablet-820x1180: the ring shows on everything Tab reaches`** (Review Focus 4): after `arrive` and `settle`
    (the real game's version line is a link, and it must be there before the links are counted), press `Tab`
    once per focusable (`a[href], button:not([hidden])`, counted on the page), and at each stop the focused element
    matches `:focus-visible`, its `outline-color` is `TOKENS.chalk`, its `outline-width` is `3px`, and
    `contrast(TOKENS.chalk, <what is behind it, from groundBehind()>)` is at least 3. The count of stops equals the count of
    focusables. In WebKit, Tab reaches links only with Alt held: use `browserName === 'webkit' ? 'Alt+Tab' : 'Tab'`.
  - **`phone-390x844: a slow game`**: hold `**/play/` behind a promise (as `home.journey.ts`'s slow-game test does),
    press Play, and while "Loading the game…" shows: its words are `TOKENS.chalk`, its ground `TOKENS.paper`, its
    `border-top-color` `TOKENS.chalk`, its `text-transform` `uppercase`; take the picture
    `phone-390x844-loading.png`; then release and expect it hidden.

- [ ] **Step 3: Write `tests/journeys/not-found.journey.ts`:** for every size in `SIZES`, after
  `arrive(page, '/no-such-page')`: the title, the `h1` and the sentence word for word (the same words
  `hosting.journey.ts` checks); `body`'s ground is `TOKENS.paper`; every `colours(page, READABLE)` entry is at
  least 4.5 to 1; the home link is marker yellow, at least 44 px high, has one `svg.icon`, and its name is exactly
  "Go to the home page"; the `h1`'s `text-transform` is `uppercase` and the sentence's and the link's are `none`
  (a heading is a label; see Global Constraints); the `color-scheme` meta is `dark` and the `theme-color` meta is
  `#0A1F3C`, as on the home page; nothing is wider than the window; every line `watchForTrouble` found mentions `404` (the
  address itself, which is the point) and none mentions anything else; picture `<size>-not-found.png`.

- [ ] **Step 4: Update `tests/journeys/home.journey.ts`.** Remove the whole `phone-390x844: dark mode` describe
  (see "What this replaces"). In the per-size "before any scroll" test, after the existing picture, call
  `await settle(page)` and then take
  `await page.screenshot({ path: \`tests/journeys/__screenshots__/${size.name}-whole.png\`, fullPage: true })`, so
  people can see the parts below the first screen, with the version line there and in its own font. Every picture this
  plan adds is written under `tests/journeys/__screenshots__/`, the only folder `journeys.yml` uploads. Add, at
  `phone-390x844` with `colorScheme: 'light'`, a test that
  takes `phone-390x844-arrival-light-setting.png` after `arrive`; and at `phone-390x844` a test that focuses the Play
  button with the keyboard (`page.keyboard.press('Tab')` until it is focused, `Alt+Tab` in WebKit) and takes
  `phone-390x844-focus.png`.

- [ ] **Step 5: Write the stylesheet.** `index.html` and `404.html`: `<meta name="color-scheme" content="dark" />`
  and, after it, `<meta name="theme-color" content="#0A1F3C" />`. Replace `src/styles.css` with the sheet below,
  keeping Task 1's three `@import` lines at its top. It was drawn and looked at while planning, at 390 by 844, 844 by
  390, 820 by 1180 and 1180 by 820; keep its values. Keep the comments that are already in the file where their rule
  survives (the upright phone, the phone on its side, the playing game at `100svh`, the loading line above the
  frame), and add the ones marked here.

  ```css
  /* The site wears Blueprint, the look the spec's "Visual direction" gives the editors and the site: deep blue paper,
     chalk lines and words, pencil for quieter words, and one marker yellow that means "you can touch this". These five
     are the only colours named anywhere on the site, and dark is the only theme for now. The game in the frame is never
     restyled: nothing here reaches inside it, and nothing is drawn over it. Words are at least 18 px, touch targets at
     least 44 px. */
  :root {
    color-scheme: dark;
    --paper: #0a1f3c;
    --hatch: #0e2a50;
    --chalk: #eaf2fa;
    --pencil: #8fb0d3;
    --marker: #ffd447;
    --label: "IBM Plex Sans Condensed", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    --measure: "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
    /* One square of the drawing paper's grid, and the corner every box shares. */
    --square: 24px;
    --corner: 2px;
  }

  * {
    box-sizing: border-box;
  }

  /* Drawing paper: a faint grid of hatch lines on the paper. The lines are so close to the paper (1.15 to 1) that words
     over them read as words on paper. */
  body {
    margin: 0;
    background-color: var(--paper);
    background-image:
      linear-gradient(var(--hatch) 1px, transparent 1px), linear-gradient(90deg, var(--hatch) 1px, transparent 1px);
    background-size: var(--square) var(--square);
    color: var(--chalk);
    font: 400 18px / 1.5 var(--label);
  }

  .page {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 max(16px, env(safe-area-inset-right)) 32px max(16px, env(safe-area-inset-left));
  }

  /* Marker yellow is for what can be touched, and for nothing else. */
  a {
    color: var(--marker);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  /* The ring is chalk, with a gap, so it shows against the paper and beside the yellow button alike. */
  a:focus-visible,
  button:focus-visible {
    outline: 3px solid var(--chalk);
    outline-offset: 3px;
  }

  /* Labels are written like the notes on a drawing: capitals, a little apart. Sentences never are. The capitals are made
     here, so the words in the page stay as they are read out. */
  h1,
  h2,
  .play,
  .status,
  footer a {
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  h1 {
    margin: 16px 0 8px;
    font-size: clamp(1.5rem, 7vw, 2rem);
    line-height: 1.2;
    overflow-wrap: anywhere;
  }

  h2 {
    margin: 32px 0 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--chalk);
    font-size: 1.25rem;
    line-height: 1.3;
  }

  p,
  ul {
    margin: 0 0 12px;
  }

  ul {
    padding-left: 1.25rem;
  }

  li {
    margin-bottom: 6px;
  }

  li::marker {
    color: var(--pencil);
  }

  .lede {
    margin-bottom: 16px;
  }

  /* …Task 2's icon rules go here, unchanged but for its `.home` block, which the last rule of this sheet now covers.
     No rule gives an icon a colour of its own: each takes the colour of the words beside it. */

  /* The game's place: a sheet of hatch with a chalk line round it until the game plays. The line is an outline, drawn
     outside the box, so the frame fills the box edge to edge and the line is never over the game. No rounded corner
     here: it would cut the game's own corners. */
  #game {
    position: relative;
    display: grid;
    place-items: center;
    width: 100%;
    aspect-ratio: 16 / 9;
    max-height: 80svh;
    overflow: hidden;
    background: var(--hatch);
    outline: 1px solid var(--chalk);
  }

  /* …the two media rules (the upright phone; the short window, with the playing game at 100svh) stay exactly as they
     are on main. */

  .play {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-width: 200px;
    min-height: 56px;
    padding: 8px 24px;
    border: 0;
    border-radius: var(--corner);
    background: var(--marker);
    color: var(--paper);
    font-family: inherit;
    font-size: 20px;
    cursor: pointer;
  }

  .play[hidden] {
    display: none;
  }

  /* A note pinned to the sheet: paper with a thin chalk edge, so it reads over the hatch and over a loading game. */
  .status,
  .no-script {
    margin: 0;
    padding: 8px 16px;
    border: 1px solid var(--chalk);
    border-radius: var(--corner);
    background: var(--paper);
    color: var(--chalk);
  }

  .no-script {
    margin: 16px;
  }

  #game iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }

  #game .status {
    position: relative;
    z-index: 1;
  }

  /* A measure, like the title block of a drawing: pencil, in the number font, digits in columns. */
  #game-version {
    color: var(--pencil);
    font-family: var(--measure);
    font-variant-numeric: tabular-nums;
  }

  footer {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
    margin-top: 32px;
    padding-top: 12px;
    border-top: 1px solid var(--chalk);
  }

  footer a,
  .next a,
  #game-version a,
  .home {
    display: inline-block;
    min-height: 44px;
    line-height: 44px;
  }
  ```

  No transition or animation is added: the site has no moments of its own, so there is nothing for reduced motion to
  turn off.

- [ ] **Step 6: Say it in `CLAUDE.md`.** Under "What is particular to this repo" add one bullet: the site wears
  Blueprint (the spec's "Visual direction"); the five colours and the two fonts are named only in `src/styles.css`;
  marker yellow is only for what can be touched; dark is the only theme; nothing is drawn on or over the game.

- [ ] **Step 7: Verify, commit, push, read CI.** `pnpm lint && pnpm typecheck && pnpm knip && pnpm build`. Commit
  `feat(look): the site wears Blueprint`, push, read the runs. If a contrast or colour journey is red in one engine
  only, report it with the numbers before changing anything: a colour is never changed to make a test pass. Update
  `progress.md` (Stage 4 at 89%) and report the line.

---

### Task 4: Read the pictures, and hand over

**Files:**
- Modify: `README.md`, `docs/superpowers/progress.md`

- [ ] **Step 1: Fetch the pictures.** `ci` puts them on the `ci-screens` branch under `pr-<number>/<engine>/`, and
  `site` under `pr-<number>-real/<engine>/` (the real game):

  ```
  git fetch origin ci-screens
  git ls-tree -r --name-only origin/ci-screens "pr-<number>/" "pr-<number>-real/"
  git show "origin/ci-screens:pr-<number>/webkit/phone-390x844-arrival.png" > /tmp/arrival.png
  ```

  For each of `chromium`, `webkit` and `firefox` there must be, for each of the five sizes, `<size>-arrival.png`,
  `<size>-whole.png`, `<size>.png` (playing) and `<size>-not-found.png`, plus `phone-390x844-loading.png`,
  `phone-390x844-focus.png` and `phone-390x844-arrival-light-setting.png`: 23 pictures an engine. A missing one is a
  stop.

- [ ] **Step 2: Look at them, with this list.** Open every arrival, whole, not-found, loading and focus picture in
  all three engines, and every playing picture of the real game. For each, answer in `progress.md`'s log (one line a
  question, naming any picture that fails):
  1. Is the page blue paper with chalk words, and is the yellow Play button the first thing the eye lands on?
  2. Could a drunk grandma say what this page is and what to press, from the arrival picture alone?
  3. Is yellow only on things that can be pressed?
  4. Are the words set in the condensed font (not the device's own), and the version line in the number font?
  5. Is every icon beside its words, sharp, and the colour of those words (chalk beside chalk, yellow in a link,
     paper on the Play button), with none in pencil?
  6. Do the heading, the lede and the Play button all fit in the arrival picture, upright and sideways, on the phone
     and the tablet?
  7. Does the playing game look exactly as it does in the pictures from before this work: the same colours, no
     tint, no rounded corner, no line over it? Compare like with like: the stand-in game's `pr-<number>/` with
     `main/`, and the real game's `pr-<number>-real/` with `live/` (`main/` holds the stand-in game, never the real
     one).
  8. Does "Loading the game…" read as a note on the sheet, and does the focus ring show clearly?
  9. Does the page on a device set to light look the same as the others?
  10. Is anything cut off, overlapping, or wider than the window? On the phone, does any link drop to a line of its
      own and leave a gap in its sentence (the plan audit's N3)? Report that one; do not fix it here.

  11. After Play is pressed, do the loading note and then the game make it plain that the press worked
      (`phone-390x844-loading.png`, then `<size>.png`)?

  A "no" is a defect: fix it in this task if it is a value in the stylesheet, with a journey that would have caught
  it; report it and stop if it is anything else.

- [ ] **Step 3: Finish the README.** In its opening list, one bullet: the site wears Blueprint, the look the spec's
  "Visual direction" gives the editors and the site; the colours and fonts are in `src/styles.css`; the pictures of
  every run are on the `ci-screens` branch.

- [ ] **Step 4: Hand over.** Set Stage 4 to "Done, 100%" in `progress.md`, with the overall percentage, the test
  counts from CI (Node tests, journeys per engine) and the link to the pictures
  (`https://github.com/mcthaydt/AutomataFrameworkSite/tree/ci-screens/pr-<number>`). Commit
  `docs: the Blueprint restyle done, the tracker updated`, push, read the runs once more, and send the coordinator the
  summary: the commits, the counts, the pictures' link, every deviation from this plan with its reason, and anything
  the checklist turned up. The pull request stays a draft for the merge session; do not merge it.

---

## Not in this plan

- **The demo game's own title, pause and settings screens.** They wear Blueprint too (the spec), but they are in
  AutomataFrameworkExamples and get their own plan there.
- **The editors.** Their Blueprint (the canvas-first layout, the drawing notes, the stamps, each editor's tint) is
  M3.
- **A light theme, other languages, a favicon and the site's other pages** (guides, the gallery, the API
  reference): later milestones. When a page is added it uses this stylesheet's names.
- **Going live** (Cycle 1's Task 8). It still waits for the Owner's Cloudflare settings; this plan neither needs it
  nor changes it.
