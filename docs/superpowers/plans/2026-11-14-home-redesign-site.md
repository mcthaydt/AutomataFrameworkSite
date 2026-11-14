# The Home Page Looks Finished Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking. No subagents (project rule).

**Goal:** The home page becomes a real home page: a top bar, a first screen with the claim "Finish the game your
agent started.", the game on its sheet showing its real picture, a row of numbers, the level's real file, the
recorded play's table, the five claims with honest stamps, a closing band, a real footer, a tab icon and a share
picture, in palette No. 325 and in Fraunces, Onest and JetBrains Mono. A first-time visitor learns what this is, what
to press, and that the press worked (onboarding), and every number and stamp on the page is read from the game at the
commit the site shows, never typed.

**Architecture:** The page stays static files with no framework dependency. Three new Node features do the new work
when the site is built: `facts` reads the game's own files (its project file, its level, its recorded play, its
licence) into one small object and writes it as `facts.json` beside `version.json`; `claims` holds the five claims as
data and fails the build when a claim stamped "Works today" has no proof that holds; `fill` writes both into the pages
through placeholders, the way `icons` already writes icons. A fourth, `pictures`, opens the built site in Chromium once
and saves the game's picture, the share picture and the touch icon. The page's own script only starts the game.

**Tech Stack:** Vite 8, plain CSS, TypeScript, `@fontsource-variable/fraunces`, `@fontsource-variable/onest`,
`@fontsource/jetbrains-mono`, `@phosphor-icons/core`, Vitest (Node tests), Playwright (journeys in Chromium, WebKit
and Firefox, and the pictures), Cloudflare Pages' `_headers`.

**Spec:** [`audits/2026-11-14-home-design-audit.md`](../audits/2026-11-14-home-design-audit.md) (the direction D1 to
D11 and the Owner's answers; its pictures in `audits/2026-11-14-home-design/` are the drawing), and AutomataFramework's
[`docs/superpowers/specs/2026-11-13-2d-first-layer-design.md`](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/specs/2026-11-13-2d-first-layer-design.md)
at `7705bf7` or later: "Visual direction" (colours, name, type), "The offer" (the five claims) and "The site".

**Principles served:** 1 (agent-first: every number on the page is in `facts.json`, a documented file an agent can
read, and the page shows the files an agent works on) and the rule that onboarding comes first. It breaks none: no
framework dependency, no 3D, no monorepo.

## Open for the Owner (Q1): Task 3 waits for it

Reported to the coordinator. Nothing here is decided by this plan.

**Q1. Is "Built for agents" stamped "Works today" or "Being built"?** The audit says a claim is stamped "Works today"
only when all of its sentence is true. The spec's sentence for this claim names four things: small files with plain
names, agent skills, an MCP server, and `automata check`. Only the first is on `main` today.

- (a) **"Being built"**, until all four exist. The section that shows the level's file stays on the page either way,
  as the part that works. One claim would then read "Works today" ("Your agent can't quietly break your game") and
  four "Being built". **Recommended:** it is the strict reading of the Owner's own rule.
- (b) "Works today", with the card's line saying only what is true: "Small files with plain names that an agent can
  find and change." Two stamps then read "Works today", as in the draft the Owner saw.

Either answer is one word in `src/features/claims/library/claims.json` (Task 3, Step 3) and one line in a journey.

## Depends on

- `main` at `81f6088` or later (the design audit, pull request 13).
- Nothing in another repo. **The game playing its recorded play before Play is pressed is not in this plan** (see
  "Not in this plan"): it waits for a cycle in AutomataFrameworkExamples.

## Global Constraints

- **The name** is "Automata Framework", two words, wherever a person reads it. **The wordmark** is the word
  `automata`, lower case, in Fraunces, with no drawn mark beside it. Repo names in addresses stay as they are.
- **The four colours, exactly** (No. 325): ground `#112f2c` (Deep Slate Green), words `#fbe6a0` (Naples Yellow), touch
  `#e2b540` (Yellow Ocher), mark `#da525d` (Eugenia Red). **Two mixed shades**, each the words colour let into the
  ground, channel by channel, rounded: raised `#1f3a33` (6% words: panels, the numbers row, the closing band, and
  every line that only divides) and quiet `#b5af7d` (70% words: quieter words and labels). These six are the only
  colours the stylesheet names.
- **Touch means "you can touch this"** and is used for nothing else. Every link and button but the wordmark carries
  it, in its words or in its ground.
- **Mark never carries words.** Eugenia Red on the ground is 3.64 to 1 and on raised 3.12 to 1: enough for an edge or
  an icon (3 to 1), not for words (4.5 to 1). A stamp's and the tag's edge and icon are mark; their words are the
  words colour. (The draft drew stamp words in red; this is the one place the page differs from it for a reason.)
- **Contrast:** every word 4.5 to 1 or more against what is behind it; every edge, icon and focus ring 3 to 1 or more.
- **Type:** Fraunces for the claim, titles and the wordmark, in sentence case; Onest for words and buttons; JetBrains
  Mono for numbers, measures and small labels (tabular). **Labels are in capitals, made by CSS, never typed**:
  buttons, kickers, stamps, the tag, table headings, the title block's and the footer's small headings. Sentences and
  titles never are. **Sentences are at least 18 px; labels at least 13 px; the claim is up to 84 px** (the audit's
  D11; this replaces "every word at least 18 px").
- **Only the Latin files the page's words need.** No character outside Fontsource's `latin` range is typed on the
  page (no arrow characters: arrows are Phosphor icons).
- **Space:** sections 128 px apart at 1024 px and wider, 80 px below; one 1 px raised line between sections; the
  drawing grid shows only behind the first screen and fades out.
- **Dark is the only theme.** Square corners of 2 px. A shadow only as the hard offset under the two panels (the
  raised colour, no blur).
- **The game's art is never restyled.** Nothing is drawn on or over the game's picture or the playing game: no
  filter, tint, opacity, blend, rounded corner or border. The 1 px line round the game's place is an outline, there
  until the game plays and gone then. The site names no colour of the game.
- **Every number, name, hash and stamp on the page comes from `fill`**, read from the game's files at the commit being
  built. None is typed in `index.html`. A page that would say something untrue fails the build with a plain sentence.
- **Every claim on the page is true on `main` today.** Words about what does not exist yet say so ("will", "Not
  yet", "Being built").
- **Every icon is Phosphor regular and has its words beside it.**
- **The strict header stays byte for byte.** `public/_headers` is not edited. Nothing comes from another address or a
  `data:` address; no inline script; no `style` attribute.
- **Touch:** targets at least 44 px, main buttons at least 52 px high. Scroll sideways only inside the file panel.
- **Drunk-grandma test** on every screen; Task 9 reads the pictures against a written list.
- **Journeys run in Chromium, WebKit and Firefox** at `SIZES` (phone and tablet, upright and sideways, and desktop)
  and at 320 px where named. **Tests run only in GitHub-hosted CI.** `pnpm lint`, `pnpm typecheck`, `pnpm knip` and
  `pnpm build` may be run before a push; `pnpm test:node` and `pnpm test:journeys` may not.
- **Dependencies:** add `@fontsource-variable/fraunces` 5.3.0 and `@fontsource-variable/onest` 5.3.1 (the Owner's
  yes, 2026-11-14); remove `@fontsource/ibm-plex-sans-condensed`. Exact versions, `devDependencies`. Nothing else.
- **No AI attribution** in commits, the pull request or docs. Before every commit, check
  `git config user.name` is `McThayDT` and `git config user.email` is `107786093+mcthaydt@users.noreply.github.com`.
- **Conventional Commits**, one commit per task at least; a source file has at most 600 lines.
- **Privacy:** nothing from the private notes; no other product's name.

## Not in this plan

- **The game playing by itself before Play** (the Owner's Q3, b). It needs a "watch" state in the demo game first.
  The seam is ready for it: the picture is one `<img class="poster">` inside `#game`, and the plan that follows the
  Examples cycle swaps it for the frame on arrival. Nothing else on the page changes then.
- More pages (guides, examples, the API reference): M4.
- A features section: the claims move to "Works today" as the demo game gains each feature.

## Measured while planning

Read or tried on 2026-11-14; no test was run.

- `@fontsource-variable/fraunces/opsz.css` and `@fontsource-variable/onest/wght.css` each hold one face per subset
  with a `unicode-range`, so a browser fetches only `fraunces-latin-opsz-normal.woff2` (67 kB) and
  `onest-latin-wght-normal.woff2` (34 kB) for this page. The families are `"Fraunces Variable"` and
  `"Onest Variable"`, each with weight `100 900`. Both packages' `LICENSE` is the SIL Open Font License 1.1
  ("Copyright 2020 The Fraunces Project Authors", "Copyright 2021 The Onest Project Authors").
- The `latin` range has `×`, `…` and `·`, and has no left or right arrow.
- Contrast (WCAG): words on ground 11.54, words on raised 9.89, quiet on ground 6.40, quiet on raised 5.49, touch on
  ground 7.44, touch on raised 6.38, ground on touch 7.44, mark on ground 3.64, mark on raised 3.12, raised on ground
  1.17. Words on touch is 1.55, so words-coloured text never goes on touch.
- The game's repo at `a2c5cf2`: `automata.toml` has `name = "Crate Game"`, `start = "level-1"   # the level a new
  game opens` (a comment after the value) and three `[[content]]` tables; the level is 16 by 9 with one thing;
  `replays/level-1.json` has `"ticks": 360` and `"finalHash": "77be68a6e1859241"`; `LICENSE` starts `MIT License`.
- **The recorded ending is not always where the engines end.** The game's replay check accepts "the content changed"
  after an editor's save and then compares the four engines with each other. So the page never says the engines "end
  at" the recorded number; it says they end the same, which is what the game's required checks prove either way.
- The game's `dist/` holds its page, `automata.toml` and its content files, and not `replays/` or `LICENSE`: the
  build needs the game's repo folder, not only its `dist/`.

## File structure

```
index.html, 404.html                    rewritten: the new page, placeholders for icons, facts, blocks
public/icon.svg                         the tab icon: a square in the touch colour
public/licences.txt                     Fraunces and Onest in, IBM Plex Sans Condensed out
src/styles.css                          the six colours, three fonts, the whole look
src/features/facts/facts.ts             entry
src/features/facts/project.ts           reads the few lines of automata.toml the site needs (pure)
src/features/facts/parse.ts             the game's files, as text, into GameFacts (pure)
src/features/facts/read.ts              the same from a folder on disk (Node)
src/features/claims/claims.ts           entry: the claims, and the check that each stamp is honest
src/features/claims/proofs.ts           one function per proof
src/features/claims/library/claims.json the five claims
src/features/fill/fill.ts               entry: fillPage
src/features/fill/blocks.ts             the three blocks: the level's file, the engines' table, the claims
src/features/pictures/pictures.ts       entry: which pictures, and takePictures
src/features/pictures/serve.ts          serves a folder on a free port (Node)
src/features/play/play.ts               changed: several Play buttons, the picture until the game plays
src/features/page/page.ts               changed: only starts the player
scripts/add-game.ts                     changed: also writes facts.json
scripts/take-pictures.ts                new: thin wrapper
tests/fixtures/game-source/             a made-up game's repo: automata.toml, content/, replays/, LICENSE
tests/features/{facts,claims,fill}/     Node tests
tests/journeys/                         home, look, facts, motion, not-found, hosting
```

Layers, lowest first (`tests/architecture/rules.ts`):
`version, pick, facts, claims, assemble, icons, fill, pictures, play, page`. `facts`, `claims`, `fill` and `pictures`
are Node's (`NODE_FEATURES`); `src/features/facts/` and `src/features/pictures/` join `NODE_PLACES`.

## Review Focus

What the audit implies and a person will meet, most likely first. Each has its test in the task named.

1. **An editor's save changes the game's files under the page.** A level with no things, with one row, with one
   content file, or a name with `<` or `&` in it must give a page that is still true and still whole, or a build that
   stops with a sentence. Task 2 ("a level with nothing in it", "a project file the site cannot read") and Task 4
   ("a name with markup in it is shown as words").
2. **A Play button pressed far from the game, or pressed again.** The top bar's button pressed at the bottom of the
   page must bring the game up and start it; a second press on any of them must not start a second game. Task 6.
3. **The fonts do not arrive.** The wordmark, the claim, the lede and the main button must still fit before any
   scroll, phone upright and sideways. Task 6.
4. **A 320 px phone.** The claim, the file panel and the table must not push the page sideways; the file panel
   scrolls inside itself and can be reached with the keyboard. Task 7.
5. **JavaScript off, or reduced motion.** The picture, every number, every stamp and the note about JavaScript are
   there with no script; no Play button shows; with reduced motion nothing moves, and without it no stamp is ever
   left unseen. Tasks 6 and 8.

---

### Task 1: The colours and the fonts

The page as it is today, in No. 325 and the three fonts. No word and no layout changes yet, so CI stays green.

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`, `knip.json`, `src/styles.css`, `index.html`, `404.html`,
  `public/licences.txt`, `tests/styles/tokens.test.ts`, `tests/journeys/look.ts`, `tests/journeys/look.journey.ts`,
  `tests/journeys/not-found.journey.ts`, `tests/journeys/hosting.journey.ts`, `CLAUDE.md`

**Interfaces:**
- Produces: CSS custom properties `--ground --raised --words --quiet --touch --mark --title --label --measure
  --corner`; in `tests/journeys/look.ts`: `TOKENS = { ground, raised, words, quiet, touch, mark }` (each
  `rgb(r, g, b)`), `TITLE = 'Fraunces Variable'`, `LABEL = 'Onest Variable'`, `MEASURE = 'JetBrains Mono'`.

- [ ] **Step 1: Check the start.** `git log --oneline -1 origin/main` shows `81f6088` or later. If not, stop and
  report.

- [ ] **Step 2: Rewrite `tests/styles/tokens.test.ts`** to hold the new colours. Its assertions:

```ts
const BOOK = { ground: '#112F2C', words: '#FBE6A0', touch: '#E2B540', mark: '#DA525D' }
const MIXED = { raised: '#1F3A33', quiet: '#B5AF7D' }
// each of the six: token(name) equals its value
// "those six are the only colours the stylesheet names": every #hex in the sheet, sorted, equals the six
// "the two mixed shades are the words let into the ground": mix(BOOK.ground, BOOK.words, 0.06) is MIXED.raised
//   and mix(..., 0.70) is MIXED.quiet, where mix rounds each channel of ground + (words - ground) * share
// kept as they are: no rgb()/hsl(), no colour written as a word, dark is the only theme
// index.html and 404.html: <meta name="theme-color" content="#112F2C" />, color-scheme dark, no other #hex
// public/icon.svg (Task 5 adds it; skip the case until then with test.skipIf(!existsSync)): its only #hex is touch
// "corners are 2 px": every border-radius is var(--corner); --corner: 2px
// "a shadow is a hard offset in the raised colour": every box-shadow value matches /^\d+px \d+px 0 var\(--raised\)$/
test.each([
  ['words', 'ground', 11.5], ['words', 'raised', 9.8], ['quiet', 'ground', 6.3], ['quiet', 'raised', 5.4],
  ['touch', 'ground', 7.4], ['touch', 'raised', 6.3], ['ground', 'touch', 7.4],
  ['mark', 'ground', 3.6], ['mark', 'raised', 3.1],
] as const)('%s on %s is at least %d to 1', …)
```

- [ ] **Step 3: Swap the packages.**
  `pnpm remove @fontsource/ibm-plex-sans-condensed && pnpm add -D -E @fontsource-variable/fraunces@5.3.0 @fontsource-variable/onest@5.3.1`.
  In `knip.json`'s `ignoreDependencies`, the two new names replace the one removed.

- [ ] **Step 4: `src/styles.css`.** The imports become `@fontsource-variable/fraunces/opsz.css`,
  `@fontsource-variable/onest/wght.css` and `@fontsource/jetbrains-mono/latin-400.css`. `:root` holds the six colours
  under the names above and
  `--title: "Fraunces Variable", Georgia, "Times New Roman", serif;`
  `--label: "Onest Variable", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;` and `--measure` as now. Every
  rule's colour moves by job: `paper` to `ground`, `hatch` to `raised`, `chalk` to `words`, `pencil` to `quiet`,
  `marker` to `touch`. `h1` and `h2` take `--title`, weight 500, no capitals and no letter-spacing (they are titles
  now); the other labels keep their capitals in `--label`. The comment at the top of the sheet is rewritten to say
  what is true now. Both pages' `theme-color` becomes `#112F2C`.

- [ ] **Step 5: `public/licences.txt`.** Remove the IBM Plex Sans Condensed notice. Add the two packages' `LICENSE`
  files, whole, each under a line naming the font and its package and version, copied from
  `node_modules/@fontsource-variable/{fraunces,onest}/LICENSE`.

- [ ] **Step 6: The journeys.** In `look.ts`, `TOKENS`, `TITLE`, `LABEL`, `MEASURE` as above (the `rgb()` values of
  the six). In `look.journey.ts`: loaded fonts are
  `['Fraunces Variable 100 900', 'JetBrains Mono 400', 'Onest Variable 100 900']`; `h1`'s family contains `TITLE`,
  `body`'s `LABEL`; the colour journey reads ground, words, raised, quiet; "yellow means you can touch it" becomes
  "the touch colour means you can touch it"; `h1` and `h2` move from the capitals list to the sentence list. In
  `not-found.journey.ts` the heading's `text-transform` is `none`. In `hosting.journey.ts` the licence notices are
  `'Fraunces'`, `'Copyright 2020 The Fraunces Project Authors'`, `'Onest'`,
  `'Copyright 2021 The Onest Project Authors'`, and JetBrains Mono's and Phosphor's as now. Both `theme-color` checks
  expect `#112F2C`.

- [ ] **Step 7: `CLAUDE.md`.** The dependencies bullet names the two new packages (the Owner, 2026-11-14) and drops
  the one removed; the "wears Blueprint" bullet says the site has its own palette, No. 325, with the six names, that
  the touch colour is only for what can be touched and the mark colour never carries words; the fonts bullet names
  the three.

- [ ] **Step 8: Verify and commit.** `pnpm lint && pnpm typecheck && pnpm knip && pnpm build` pass. `ls dist/assets`
  shows `fraunces-latin-opsz-normal-*.woff2` and `onest-latin-wght-normal-*.woff2`. Check the git author, then
  `git commit -m "feat(look): palette No. 325 and Fraunces, Onest and JetBrains Mono"`. Push; `ci` and `site` green.

### Task 2: The game's facts

**Files:**
- Create: `src/features/facts/{facts,project,parse,read}.ts`, `tests/features/facts/{project,parse,read}.test.ts`,
  `tests/fixtures/game-source/{automata.toml,LICENSE,content/levels/room.json,content/characters/ball.json,replays/room.json}`
- Modify: `src/build.ts`, `src/features/assemble/assemble.ts`, `scripts/add-game.ts`, `tests/architecture/rules.ts`,
  `tests/features/assemble/assemble.test.ts`, `.github/workflows/site.yml`, `tests/workflows/site.test.ts`

**Interfaces:**
- Consumes: `REQUIRED_CHECKS` (`pick`), `GAME_REPO`, `isCommit` (`version`).
- Produces:

```ts
export const FACTS_FILE = 'facts.json'
export class FactsError extends Error {}
export interface GameFacts {
  readonly name: string                 // automata.toml's name
  readonly commit: string               // 40 hex digits, or a plain word off CI ('fixture')
  readonly files: readonly string[]     // every [[content]] path, in the file's order
  readonly licence: string              // 'MIT'
  readonly engines: readonly string[]   // ['Node', 'Chrome', 'Safari', 'Firefox']
  readonly level: {
    readonly path: string; readonly id: string
    readonly width: number; readonly height: number
    readonly firstRow: string; readonly lastRow: string
    readonly thing?: { readonly character: string; readonly x: number; readonly y: number }
  }
  readonly replay: { readonly path: string; readonly steps: number; readonly ending: string }
}
export function readProject(text: string): { name: string; start: string; content: { type: string; path: string }[] }
export function parseFacts(input: { commit: string; read: (path: string) => string | undefined }): GameFacts
export function readFacts(options: { sourceDir: string; commit: string }): GameFacts
export function writeFacts(facts: GameFacts): string   // two-space JSON and a newline, like writeVersion
export function engineNames(checks: readonly string[]): string[]
```

- [ ] **Step 1: The fixture.** A made-up game that can never be mistaken for the real one:
  `automata.toml` with `name = "Stand-in Game"`, `start = "room"   # a comment after the value`, a level
  `content/levels/room.json` and a character `content/characters/ball.json`; the level has `"id": "room"`, tiles
  `["#....#", "#....#", "######"]`, one thing `{ "id": "ball-1", "character": "ball", "x": 3.5, "y": 1.5 }`;
  `replays/room.json` has `"ticks": 12` and `"finalHash": "0123456789abcdef"`; `LICENSE` starts `MIT License`.

- [ ] **Step 2: Write the tests.**

```ts
// project.test.ts
test('reads the name, the first level and every content file, past comments and blank lines', …)
//   the real game's automata.toml text, typed in the test → { name: 'Crate Game', start: 'level-1', content: 3 entries }
test('a # inside a quoted value is not a comment', …)            // name = "Crate #1" → 'Crate #1'
test('a project file the site cannot read stops with a sentence', …)
//   no name, no start, or no [[content]] → FactsError naming automata.toml and the missing line

// parse.test.ts (read is a function over an object of texts)
test('the stand-in game', () => expect(parseFacts({ commit: 'fixture', read })).toEqual({
  name: 'Stand-in Game', commit: 'fixture',
  files: ['content/levels/room.json', 'content/characters/ball.json'], licence: 'MIT',
  engines: ['Node', 'Chrome', 'Safari', 'Firefox'],
  level: { path: 'content/levels/room.json', id: 'room', width: 6, height: 3, firstRow: '#....#',
           lastRow: '######', thing: { character: 'ball', x: 3.5, y: 1.5 } },
  replay: { path: 'replays/room.json', steps: 12, ending: '0123456789abcdef' },
}))
test('a level with nothing in it has no thing', …)               // "things": [] → level.thing is undefined
test('a level of one row has the same first and last row', …)
test.each([
  ['the first level is not one of the content files', /start = "room".*no level/],
  ['the level is not JSON', /content\/levels\/room\.json/],
  ['the level has no rows', /tiles/],
  ['there is no recorded play', /replays\/room\.json/],
  ['the recorded play has no steps or no ending', /ticks|finalHash/],
  ['the licence is not MIT', /LICENSE/],
])('%s: the build stops with a sentence that names the file', …)  // each throws FactsError matching
test('the engines are the checks the site requires of the game', () =>
  expect(engineNames(REQUIRED_CHECKS)).toEqual(['Node', 'Chrome', 'Safari', 'Firefox']))
test('a check the site has no name for stops with a sentence', () =>
  expect(() => engineNames(['check', 'engines (ladybird)'])).toThrow(FactsError))
test('writeFacts gives the same bytes every time, and JSON.parse gives the facts back', …)

// read.test.ts
test('reads the fixture game from its folder', …)                 // readFacts on tests/fixtures/game-source
test('a folder with no automata.toml stops with a sentence that names the folder', …)
```

- [ ] **Step 3: Implement.** `readProject` is not a TOML parser and says so in its comment: it reads top-level
  `key = "value"` lines and `[[content]]` tables with `type` and `path`, drops a `#` comment that is outside quotes,
  and ignores every other line. `parseFacts`: the level is the content entry of type `level` whose JSON `id` equals
  `start`; `width` is the first row's length; `thing` is the first of `things`; the replay is `replays/<start>.json`,
  `steps` its `ticks`, `ending` its `finalHash` (16 hex digits); `licence` is `'MIT'` when `LICENSE`'s first line is
  `MIT License`, and anything else is a `FactsError` (the page says "MIT" in words). `engineNames`: `check` is
  `Node`, `engines (chromium)` is `Chrome`, `engines (webkit)` is `Safari`, `engines (firefox)` is `Firefox`.

- [ ] **Step 4: `facts.json` is written with the game.** `addGame`'s options gain `readonly facts: GameFacts`, and it
  writes `<siteDir>/facts.json` with `writeFacts` after `version.json`. `scripts/add-game.ts` reads them with
  `readFacts({ sourceDir: env.GAME_SOURCE ?? 'tests/fixtures/game-source', commit: env.GAME_COMMIT ?? 'fixture' })`
  and prints a `FactsError`'s sentence and exits 1, as it does for `AssembleError`. Add to `assemble.test.ts`:
  "writes facts.json beside version.json" and "a refused game leaves no facts.json".

- [ ] **Step 5: The workflow.** In `site.yml`'s "Build the site around the game" step, add `GAME_SOURCE: ../game`.
  In `tests/workflows/site.test.ts`: that step's `env` has `GAME_SOURCE: '../game'` beside `GAME_DIR: '../game/dist'`.

- [ ] **Step 6: The layers.** `LAYERS`, `NODE_PLACES` and `NODE_FEATURES` in `tests/architecture/rules.ts` as in
  "File structure" (all four new features now, so later tasks do not touch the file). `src/build.ts` exports `facts`.

- [ ] **Step 7: Verify and commit.** Lint, typecheck, knip and build pass; `cat dist/facts.json` shows the stand-in
  game. Commit `feat(facts): read the game's own files into facts.json`. Push; `ci` and `site` green; in `site`'s
  `build-real` log, open the uploaded site's `facts.json` (or the `live` picture later) and note the real values in
  the tracker.

### Task 3: The claims and their stamps

**Waits for Q1.** Everything but the one word marked below can be written first.

**Files:**
- Create: `src/features/claims/{claims,proofs}.ts`, `src/features/claims/library/claims.json`,
  `tests/features/claims/claims.test.ts`
- Modify: `src/build.ts`, `tsconfig.json` only if JSON imports are not already allowed (then read the file with
  `readFileSync` in `claims.ts` instead and add `src/features/claims/` to `NODE_PLACES`)

**Interfaces:**
- Consumes: `GameFacts`.
- Produces:

```ts
export type ClaimState = 'works' | 'building'
export interface Claim { readonly id: string; readonly title: string; readonly line: string
                         readonly state: ClaimState; readonly proof?: ProofName }
export type ProofName = 'same-in-every-engine' | 'small-files'
export const PROOFS: Record<ProofName, (facts: GameFacts) => string | undefined>  // a sentence when it does not hold
export const CLAIMS: readonly Claim[]
export class ClaimError extends Error {}
export function checkClaims(claims: readonly Claim[], facts: GameFacts): void     // throws ClaimError
export const STAMP_WORDS: Record<ClaimState, string>   // { works: 'Works today', building: 'Being built' }
```

- [ ] **Step 1: Write the tests.**

```ts
test('there are five claims, with the spec\'s five titles', () => expect(CLAIMS.map((c) => c.title)).toEqual([
  "Your agent can't quietly break your game", 'Built for agents', 'The part after the demo is already done',
  'Change it yourself, without another prompt', 'Get it in front of players']))
test('a claim that works names a proof, and a claim being built names none', …)
test('every claim stamped as working holds for the stand-in game', () => checkClaims(CLAIMS, fixtureFacts))
test('same-in-every-engine fails when an engine is missing', …)   // engines: ['Node','Chrome'] → a sentence
test('same-in-every-engine fails when there is no recorded play to run', …)   // steps: 0
test('small-files fails when a content file is not JSON', …)      // files: ['content/level.bin']
test('a working claim whose proof fails stops the build, naming the claim', () =>
  expect(() => checkClaims(CLAIMS, { ...fixtureFacts, engines: ['Node'] })).toThrow(/can't quietly break/))
test('a working claim with no proof stops the build', …)
test('no line promises what is being built as if it were here', …)
//   for every 'building' claim, the journey in Task 7 shows 'Being built' beside it; here: STAMP_WORDS is exact
```

- [ ] **Step 2: `proofs.ts`.** `same-in-every-engine` holds when `facts.engines` is exactly Node, Chrome, Safari and
  Firefox, `facts.replay.steps > 0` and `facts.replay.ending` is 16 hex digits. (It is true because `pick` only ever
  shows a commit that passed `REQUIRED_CHECKS`; the comment says so.) `small-files` holds when `facts.files` has at
  least one path and every path ends `.json`.

- [ ] **Step 3: `library/claims.json`**, in this order:

```json
[
  { "id": "checks", "title": "Your agent can't quietly break your game",
    "line": "One recorded play, run again in four places on every change.",
    "state": "works", "proof": "same-in-every-engine" },
  { "id": "agents", "title": "Built for agents",
    "line": "Small files with plain names that an agent can find and change.",
    "state": "<Q1: 'building' for (a); 'works' with \"proof\": \"small-files\" for (b)>" },
  { "id": "after-demo", "title": "The part after the demo is already done",
    "line": "Saves, menus, settings, controls, sound and languages.", "state": "building" },
  { "id": "editors", "title": "Change it yourself, without another prompt",
    "line": "Free editors in the browser that work on an iPad.", "state": "building" },
  { "id": "publish", "title": "Get it in front of players",
    "line": "One command for the web, itch.io or a desktop app.", "state": "building" }
]
```

  With (a), the `agents` line becomes "Small files with plain names today. Agent skills and a way for an agent to run
  the game are next." so the card says what is here and what is not.

- [ ] **Step 4: Verify and commit.** `feat(claims): the five claims, each stamp held to a proof`. Push; `ci` green.

### Task 4: Filling the pages

**Files:**
- Create: `src/features/fill/{fill,blocks}.ts`, `tests/features/fill/{fill,blocks}.test.ts`
- Modify: `vite.config.ts`, `src/build.ts`

**Interfaces:**
- Consumes: `GameFacts`, `readFacts`, `Claim`, `CLAIMS`, `checkClaims`, `STAMP_WORDS`, `GAME_REPO`, `isCommit`,
  `shortCommit`.
- Produces:

```ts
export class FillError extends Error {}
/** Every placeholder in `html` filled. An unknown name stops the build, naming it and the page. */
export function fillPage(html: string, facts: GameFacts, claims: readonly Claim[], page?: string): string
export function factWords(facts: GameFacts): Record<FactName, string>
export function addresses(facts: GameFacts): Record<AddressName, string>
```

Placeholders, as a page author writes them (the element stays, so a journey can find it):

| Written | Filled with |
|---|---|
| `<span data-fact="name"></span>` | `Crate Game` |
| `data-fact="version"` | `05fb33d` (the short commit; a plain word as it is) |
| `data-fact="level-size"` | `16 × 9 tiles` |
| `data-fact="engines-count"` | `4 engines` |
| `data-fact="engines-list"` | `Node, Chrome, Safari and Firefox` |
| `data-fact="steps"` | `360 steps` (`1 step`) |
| `data-fact="files-count"` | `3 small files` (`1 small file`) |
| `data-fact="licence"` | `MIT` |
| `data-fact="level-path"` | `content/levels/level-1.json` |
| `data-fact="replay-path"` | `replays/level-1.json` |
| `data-fact="replay-ending"` | `77be68a6e1859241` |
| `<a data-address="version">` | gains `href`: the commit on GitHub; for a plain word, the game's repo |
| `data-address="files"` | `https://github.com/<GAME_REPO>/tree/<commit>`; for a plain word, the repo |
| `data-address="level"` | `…/blob/<commit>/<level.path>`; for a plain word, `…/blob/main/<level.path>` |
| `data-address="checks"` | `…/commit/<commit>/checks`; for a plain word, `…/actions` |
| `<div data-block="level-file"></div>` | the level's file as rows (below) |
| `<tbody data-block="engines"></tbody>` | one row an engine |
| `<ul data-block="claims"></ul>` | one card a claim |

- [ ] **Step 1: Write the tests.** With the fixture facts and with the real game's values typed in the test:

```ts
// fill.test.ts
test('every fact is written as words', …)          // each row of the table above, exactly, for the real values
test('one step and one small file are not plurals', …)
test('a plain word for a commit gives addresses that still open', …)   // 'fixture' → the repo, /blob/main/, /actions
test('a name with markup in it is shown as words', () =>
  expect(fillPage('<b data-fact="name"></b>', { ...facts, name: '<img src=x> & Co' }, CLAIMS))
    .toBe('<b data-fact="name">&lt;img src=x&gt; &amp; Co</b>'))
test('an unknown fact, address or block stops the build, naming it and the page', …)
test('a page with no placeholder comes back unchanged', …)            // 404.html
test('filling checks the claims first', …)   // facts whose engines are ['Node'] → ClaimError, nothing returned

// blocks.test.ts
test('the level file: its id, its first and last row, how many rows are left out, and its first thing', …)
//   real values → the text of the rows, in order:
//   '"id": "level-1",' / '"tiles": [' / '  "#..............#",' / '  … 7 more rows' / '  "################"' / '],'
//   / '"things": [' / '  { "character": "crate",' / '    "x": 9.5, "y": 7.5 }' / ']'
//   notes, on their rows: 'The level, row by row' on "tiles", 'What it is' on "character", 'Where it starts' on "x"
test('a level of two rows leaves no row out, and of one row shows it once', …)
test('a level with nothing in it shows no things and no notes about them', …)
test('a row with markup in it is shown as words', …)
test('the engines: one row each, the engine\'s name and "Same ending"', …)
test('the claims: one card each, numbered 01 to 05, with its title, its line and its stamp\'s words', …)
//   a 'works' card has class "stamp works" and a check icon placeholder; a 'building' card "stamp building", no icon
```

- [ ] **Step 2: Implement `fill` and `blocks`.** Both pure: strings in, a string out. Every value passes through one
  `escape` (`&`, `<`, `>`, `"`). The blocks write icon placeholders (`<i data-icon="check"></i>`,
  `<i data-icon="check-circle"></i>`), so `fill` runs before `icons`. Markup the blocks write (the stylesheet and the
  journeys rely on these class names):

```html
<!-- level-file -->
<div class="row"><code>"tiles": [</code><i class="leader"></i><span class="note">The level, row by row</span></div>
<!-- engines -->
<tr><th scope="row">Node</th><td class="same"><i data-icon="check-circle"></i><span>Same ending</span></td></tr>
<!-- claims -->
<li class="claim"><span class="number">01</span><h3>…title…</h3><p>…line…</p>
  <span class="stamp works"><i data-icon="check"></i><span>Works today</span></span></li>
```

  The three notes are true of any level, whatever an editor saves: they describe the format, not this level.

- [ ] **Step 3: Wire it into the build.** In `vite.config.ts`, read the facts once
  (`readFacts({ sourceDir: process.env.GAME_SOURCE ?? 'tests/fixtures/game-source', commit: process.env.GAME_COMMIT ?? 'fixture' })`)
  and add a `fill` plugin before `icons` whose `transformIndexHtml` is `fillPage(html, facts, CLAIMS, page)`. A
  `FactsError`, `ClaimError` or `FillError` stops the build with its sentence.

- [ ] **Step 4: Verify and commit.** Lint, typecheck, knip, build. `feat(fill): write the game's facts and the claims
  into the pages`. Push; `ci` and `site` green (no page uses a placeholder yet).

### Task 5: The pictures and the page's face

**Files:**
- Create: `src/features/pictures/{pictures,serve}.ts`, `scripts/take-pictures.ts`, `public/icon.svg`,
  `tests/journeys/facts.journey.ts`
- Modify: `package.json` (`build`), `src/build.ts`, `index.html` and `404.html` (`<head>` only),
  `.github/workflows/ci.yml`, `.github/workflows/site.yml`, `tests/workflows/{ci,site}.test.ts`, `README.md`,
  `tests/docs/readme.test.ts`, `tests/journeys/hosting.journey.ts`

**Interfaces:**
- Produces:

```ts
export interface Picture { readonly file: string; readonly address: string
  readonly width: number; readonly height: number; readonly scale: 1 | 2
  /** Wait for this before the picture is taken: a selector that must be there. */
  readonly ready: string }
export const PICTURES: readonly Picture[]
// game.png             /play/      1280 × 720, scale 2, ready '#game[data-state="playing"]'
// share.png            /           1200 × 630, scale 1, ready 'h1'
// apple-touch-icon.png /icon.svg   180 × 180,  scale 1, ready 'svg'
export class PictureError extends Error {}
export function takePictures(options: { siteDir: string; executablePath?: string }): Promise<void>
export function serveFolder(dir: string): Promise<{ url: string; close(): Promise<void> }>
export const SITE_ADDRESS = 'https://automataframework.pages.dev'
```

- [ ] **Step 1: Write the journey `facts.journey.ts`** (desktop size; `request` only where no page is needed):

```ts
test('the game\'s picture, the share picture and the icons are the site\'s own files', async ({ request, page }) => {
  // /game.png 200 image/png; drawn in a page it is 2560 × 1440 (naturalWidth, naturalHeight)
  // /share.png 200 image/png, 1200 × 630;  /apple-touch-icon.png 180 × 180;  /icon.svg 200 image/svg+xml
})
test('the game\'s picture is a picture of the game, not of a blank frame', …)
//   drawn to a canvas in the page, it has more than 3 different colours
test('the page tells a browser and a shared link what it is', async ({ page }) => {
  // title: 'Automata Framework: finish the game your agent started'
  // meta description: 'Automata Framework is a toolkit for making 2D games that play in a web browser. It is still being built. Play the first game made with it.'
  // link[rel=icon] href /icon.svg; link[rel=apple-touch-icon] href /apple-touch-icon.png
  // og:title 'Automata Framework'; og:description as the description; og:type website
  // og:url 'https://automataframework.pages.dev/'; og:image 'https://automataframework.pages.dev/share.png'
  // og:image:width 1200, og:image:height 630, og:image:alt 'Finish the game your agent started.'
  // twitter:card summary_large_image
})
test('facts.json is served and says which game the page shows', …)
//   parses; its commit equals version.json's game; steps > 0; engines has 4 names
```

  In `tests/workflows/site.test.ts`: the `og:url` and `og:image` in `index.html` start with the workflow's `SITE_URL`.

- [ ] **Step 2: Implement `pictures`.** `serveFolder` is Node's `http` serving files of one folder on port 0 with the
  right content type for `.html .js .css .json .png .svg .woff2 .wasm .toml` and `index.html` for a folder; nothing
  outside the folder. `takePictures` launches `chromium` from `@playwright/test`, takes `PICTURES` in order (the
  share picture shows the game's picture, so `game.png` is first) with reduced motion, and for each waits for `ready`,
  for `document.fonts.ready`, and then until two pictures in a row are the same bytes (at most 10 s); it writes
  `<siteDir>/<file>`. A game that never says it is playing, or a picture that never settles, is a `PictureError` with
  a sentence naming the picture. A missing browser is a `PictureError` whose sentence is: "Chromium is not installed
  for Playwright. Run: pnpm exec playwright install chromium". `scripts/take-pictures.ts` calls it with `dist` and
  `process.env.CHROMIUM_PATH`, prints the sentence and exits 1 on a `PictureError`.

- [ ] **Step 3: The build.** `"build": "vite build && node scripts/add-game.ts && node scripts/take-pictures.ts"`.
  In `ci.yml`'s `build` job and `site.yml`'s `build-real` job, add
  `pnpm exec playwright install --with-deps chromium` after the site's install and before the build (in `build-real`
  with `working-directory: site`). The workflow tests hold both. `deploy` is not touched: it still never runs the
  game. The comment at the top of `site.yml` says `build-real` now also opens the built game once in a browser, with
  no secret in the job.

- [ ] **Step 4: The heads.** `public/icon.svg`:
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="2" fill="#e2b540"/></svg>`.
  `index.html`'s head gets the title, description, the two icon links and the tags the journey lists; `404.html` gets
  the icon links and the title `Page not found: Automata Framework`. Update the title checks in
  `hosting.journey.ts`, `not-found.journey.ts` and `home.journey.ts`.

- [ ] **Step 5: The README.** "Try it on your machine" gains `pnpm exec playwright install chromium` between install
  and build, and one sentence on why (the build takes the game's picture). `readme.test.ts` holds the order: install,
  playwright install, build, serve. It also says `GAME_SOURCE=` goes with `GAME_DIR=` for the real game.

- [ ] **Step 6: Verify and commit.** Lint, typecheck, knip. For `pnpm build` in a cloud container set
  `CHROMIUM_PATH=/opt/pw-browsers/chromium` if Playwright's own browser is missing; then look at `dist/game.png` and
  `dist/share.png`. `feat(pictures): the game's picture, the share picture and the icons`. Push; `ci` and `site`
  green; read `game.png` of the real game from the `site` run (Task 6 puts it on the page and in the pictures).

### Task 6: The top bar, the first screen and the game on its sheet

**Files:**
- Modify: `index.html`, `src/styles.css`, `src/features/play/play.ts`, `src/features/page/page.ts`,
  `playwright.config.ts`, `tests/journeys/{home.journey,look.journey,look,hosting.journey}.ts`

**Interfaces:**
- Produces: `createPlayer(root: HTMLElement, buttons: readonly HTMLButtonElement[]): Player` (state and `destroy` as
  now); `startPage(doc: Document): void`; in `look.ts`, `arrive` as now and `settle` removed.

- [ ] **Step 1: `playwright.config.ts`:** `use` gains `reducedMotion: 'reduce'`, with a comment: pictures and
  measures are taken of a page at rest; `motion.journey.ts` (Task 8) turns motion back on for itself.

- [ ] **Step 2: Rewrite `index.html`'s body down to the end of the first screen.** The words are exact; the journeys
  assert them word for word. (The sections after it stay as they are until Task 7.)

```html
<header class="top">
  <div class="wrap bar">
    <a class="wordmark" href="/" aria-label="Automata Framework, home">automata</a>
    <nav aria-label="Site">
      <a href="#today">What works today</a>
      <a href="https://github.com/mcthaydt/AutomataFramework"><i data-icon="github-logo"></i>GitHub</a>
      <button type="button" class="btn main small" data-play hidden><i data-icon="play"></i>Play the game</button>
    </nav>
  </div>
</header>
<main>
  <section class="hero">
    <div class="wrap">
      <a class="tag" href="#today"><b>Being built</b><span>See what works today</span><i data-icon="arrow-right"></i></a>
      <h1>Finish the game your agent started.</h1>
      <p class="lede">Your coding agent can make a playable demo in a weekend. Saves, menus, settings, touch controls and publishing are what take the next six weeks. Automata Framework is a toolkit that will have them built in.</p>
      <div class="actions">
        <button type="button" class="btn main" data-play hidden><i data-icon="play"></i>Play the first game</button>
        <a class="btn second" href="https://github.com/mcthaydt/AutomataFrameworkExamples" data-address="files"><i data-icon="github-logo"></i>See how it is made</a>
      </div>
      <section class="sheet" aria-label="The game">
        <div class="sheet-head">
          <b data-fact="name"></b>
          <span class="quiet">A game made with Automata Framework</span>
          <span class="how keys"><i data-icon="keyboard"></i>Arrow keys to move. Space to jump.</span>
          <span class="how fingers"><i data-icon="hand-tap"></i>Use the buttons on the game.</span>
          <button type="button" class="btn main small" data-play hidden><i data-icon="play"></i>Play it</button>
        </div>
        <div id="game">
          <img class="poster" src="/game.png" width="2560" height="1440" alt="" />
          <noscript><p class="no-script">This game needs JavaScript. Turn it on in your browser's settings, then load this page again.</p></noscript>
          <p class="status" role="status" hidden>Loading the game…</p>
        </div>
        <dl class="title-block">
          <div><dt>Game version</dt><dd><a data-address="version" data-fact="version"></a></dd></div>
          <div><dt>Level</dt><dd data-fact="level-size"></dd></div>
          <div><dt>Last check</dt><dd>Plays the same in <span data-fact="engines-list"></span></dd></div>
        </dl>
      </section>
    </div>
  </section>
```

  The picture's `alt` is empty because the words beside it say what it is and a screen reader gains nothing from
  "a picture of the game"; the sheet's label names it.

- [ ] **Step 3: Write the journeys** (`home.journey.ts`; at every size in `SIZES` unless said):

```ts
const WORDS = { title: 'Automata Framework: finish the game your agent started', wordmark: 'automata',
  claim: 'Finish the game your agent started.', lede: '…as in the page…', tag: 'Being built',
  tagLink: 'See what works today', play: ['Play the game', 'Play the first game', 'Play it'],
  made: 'See how it is made', keys: 'Arrow keys to move. Space to jump.', fingers: 'Use the buttons on the game.',
  loading: 'Loading the game…', noScript: '…as now…' }

test('the page says what it is and what to press', …)
//   title; the wordmark link's name 'Automata Framework, home' and text 'automata'; h1 is the claim; the lede;
//   the tag; 'See how it is made' goes to the game's repo; at 700 px and wider the bar shows 'What works today',
//   'GitHub' and 'Play the game', and below 700 px none of the three; 'Play the first game' and 'Play it' are
//   visible at every size; fitsSideways; no trouble
test('before any scroll, the wordmark, the claim, the lede and the main Play button are all in the window', …)
//   scrollY 0; each toBeInViewport({ ratio: 1 }); then the arrival picture and the whole-page picture as now
test('the game\'s real picture is on the sheet before Play is pressed', …)
//   img.poster is visible, complete, naturalWidth 2560; no iframe on the page; #game's data-state is 'ready'
test('the sheet says which game it is, how to play it, and which version', …)
//   [data-fact=name], level-size and engines-list equal facts.json's words; the version link's text is the short
//   commit and its href the address; exactly one of .how.keys and .how.fingers is visible
test('pressing each Play button starts the game inside the page', …)
//   for each visible [data-play] in turn (a fresh page each): click; the frame says playing; #game is 'playing';
//   the poster is hidden; 'Play it' is hidden; the status is hidden; the frame is in the window, 200 px or taller,
//   and inside the window's width; the picture `${size.name}.png`
test('the keys reach the game with no second click', …)            // as now
// at the largest and the smallest size:
test('the top bar\'s Play button, pressed at the bottom of the page, brings the game up and starts it', …)  // desktop
//   scroll to the footer; press 'Play the game'; the frame is playing and its top is in the window
test('a press while the game plays goes back to the game and starts no second one', …)
//   play; scroll to the bottom; press 'Play the first game' (scroll it into view first); one iframe; frame in window
test('a double press starts one game', …)                          // as now, on 'Play it'
test('a slow game says it is loading over its picture, and then stops saying it', …)
//   while loading: the status is visible, the poster is still visible, the frame's visibility is hidden
test('with JavaScript off: the picture, the note, and no Play button', …)
//   p.no-script visible with its words; img.poster visible; every [data-play] hidden; the facts are on the page
test('turning the phone keeps the same game going', …)             // as now
test('playing sideways on a phone, the game fills the window', …)  // as now
test('with a finger: the game\'s buttons are on screen and holding one moves the game', …)  // as now
```

  In `look.journey.ts`: "with the fonts blocked" checks the wordmark, the claim, the lede and 'Play the first game'
  (phone upright and sideways); the 320 px journey checks the same four and `fitsSideways`; the touch-colour journey
  leaves out `.wordmark` and `iframe`; "the game's own picture is left alone" also measures `img.poster` before Play
  (filter none, opacity 1, blend normal, corner 0, border 0, and `object-fit` is `fill` or `contain` so nothing is
  cropped) and the outline (`solid` before, `none` once playing); the 44 px journey expects 52 for `.btn.main` that is
  not `.small`; the capitals journey: capitals for `.btn`, `.tag b`, `.title-block dt`; none for `h1`, `.lede`,
  `.wordmark`, `nav a`, `.how`; sizes: every label at least 13 px, every sentence (`p, li, dd, .how, nav a`) at least
  18; the icon count is read from the page (`svg.icon` count equals the count of icons expected at this size) and
  each visible one still has words beside it. `hosting.journey.ts`'s "still plays under those headers" presses
  'Play it'.

- [ ] **Step 4: `play.ts` and `page.ts`.** `createPlayer(root, buttons)`: every button is shown and listens. A press
  when `ready` starts the game as now (loading, then playing) and scrolls `root` into view at once, so a press far
  from the game is seen to do something; a press in any other state only scrolls `root` into view and gives the frame
  the keyboard. On `loading` the buttons inside the sheet are hidden (the ones outside stay: they lead back to the
  game). `root.dataset.state` as now; the poster and the frame are shown and hidden by the stylesheet from it.
  `startPage` finds `#game` and every `button[data-play]` and makes the player; the version line's fetch goes (the
  line is filled when the site is built).

- [ ] **Step 5: The stylesheet.** The drawing is the audit's `fonts-site.png` (the Fraunces column),
  `draft-desktop.png` and `draft-phone.png`, with three differences: no square beside the wordmark, the colours and
  fonts of Task 1, and stamp words in the words colour. Decisions the pictures do not settle:
  - `.wrap`: at most 1248 px wide, 24 px gutters, 16 px below 760 px (and never less than the safe-area insets).
  - `.top`: 64 px high, a 1 px raised line under it. `.wordmark`: Fraunces, 24 px, weight 600, the words colour, no
    underline, 44 px tall. Below 700 px the `nav` is not shown.
  - `.hero`: centred at 760 px and wider, left-aligned below. The grid (48 px squares, raised lines) is a
    `::before` behind it only, faded out with a `mask-image` gradient written with `var(--ground)` and
    `transparent` (no new colour). `body` loses its grid.
  - `h1`: Fraunces, weight 500, `clamp(2.6rem, 6.2vw, 5.25rem)`, line-height 1.02, `text-wrap: balance`, at most
    960 px wide. `.lede`: quiet, 21 px (19 px below 760 px), at most 620 px wide.
  - `.btn`: Onest 600, capitals, 52 px high, 2 px corner; `.main` is touch with ground words; `.second` is raised
    with touch words and a 1 px quiet edge; `.small` is 44 px. Below 760 px the two actions stack, full width.
  - `.tag`: 44 px high, a 1 px quiet edge; its `b` has a 1 px mark edge and words-colour words; the rest is touch.
  - `.sheet`: at most 1040 px wide. `.sheet-head` and `.title-block` have a 1 px words edge and the ground behind
    them. `.how.fingers` shows and `.how.keys` hides under `@media (pointer: coarse)`; otherwise the reverse. Below
    760 px `.quiet` is not shown and `.how` takes a line of its own under the name. `.title-block dt` is a 13 px
    measure label in quiet; its three cells are divided by raised lines and stack to two rows below 760 px.
  - `#game` before Play: 16 by 9 at every size, the poster filling it (`width: 100%; height: 100%`), the outline as
    now. `#game[data-state="playing"]`: as today (16 by 9, but 80svh tall on an upright phone and 100svh on a short
    window), the poster `display: none`, no outline. The loading note sits over the poster.
  - A window less than 500 px high: the tag is not shown, the claim is 2.25rem, and the lede 18 px, so the four
    things fit before any scroll.

- [ ] **Step 6: Verify and commit.** Lint, typecheck, knip, build; open `dist/index.html`'s picture in
  `dist/share.png` to see the first screen. `feat(home): the top bar, the first screen and the game on its sheet`.
  Push; `ci` and `site` green in all three engines. Read the arrival pictures on `ci-screens` at every size before
  going on; a first screen that fails the drunk-grandma test is fixed here, not in Task 9.

### Task 7: The numbers, the file, the checks, what works today, the close and the footer

**Files:**
- Modify: `index.html`, `src/styles.css`, `tests/journeys/{home.journey,look.journey,facts.journey}.ts`

- [ ] **Step 1: Replace the rest of `index.html`'s body** (the three old sections and the old footer go):

```html
  <dl class="numbers wrap">
    <div><dt data-fact="engines-count"></dt><dd><span data-fact="engines-list"></span> play the game exactly the same way</dd></div>
    <div><dt data-fact="steps"></dt><dd>of recorded play, run again every time the game changes</dd></div>
    <div><dt data-fact="files-count"></dt><dd>the whole game, apart from its code</dd></div>
    <div><dt data-fact="licence"></dt><dd>licensed and free to use</dd></div>
  </dl>

  <section class="part" id="files"><div class="wrap split">
    <div class="text">
      <p class="kicker">Built for agents</p>
      <h2>That whole level is one small file.</h2>
      <p class="sub">A game is small files with plain names. Your agent finds the right one, changes it, and the game changes.</p>
      <ul class="points">
        <li><i data-icon="check"></i><span><strong>You can read it.</strong> Each # is a wall and each dot is air.</span></li>
        <li><i data-icon="check"></i><span><strong>Nothing is hidden.</strong> What is in the file is what the game plays.</span></li>
      </ul>
      <p class="more"><a data-address="files">See all of the game's files</a></p>
    </div>
    <div class="panel">
      <p class="panel-head" data-fact="level-path"></p>
      <div class="code" data-block="level-file" tabindex="0" role="region" aria-label="The level's file"></div>
      <p class="panel-foot">Some rows are left out here. <a data-address="level">Read the whole file</a></p>
    </div>
  </div></section>

  <section class="part" id="checks"><div class="wrap split flip">
    <div class="text">
      <p class="kicker">Checks</p>
      <h2>Your agent can't quietly break your game.</h2>
      <p class="sub">One play of the game is recorded. Every time the game changes, that play runs again in four places. All four have to end the same way, or the change does not pass.</p>
      <p class="more"><a data-address="checks">See the latest check</a></p>
    </div>
    <div class="panel">
      <p class="panel-head"><span data-fact="replay-path"></span> · <span data-fact="steps"></span></p>
      <table>
        <thead><tr><th scope="col">Where it runs</th><th scope="col">How it ends</th></tr></thead>
        <tbody data-block="engines"></tbody>
      </table>
      <p class="panel-foot">The ending when it was recorded: <span data-fact="replay-ending"></span></p>
    </div>
  </div></section>

  <section class="part" id="today"><div class="wrap">
    <p class="kicker">Where it stands</p>
    <h2>What works today, and what is still being built.</h2>
    <ul class="claims" data-block="claims"></ul>
  </div></section>

  <section class="closing"><div class="wrap">
    <h2>Want to make your own game with it?</h2>
    <p>Not yet. Follow the toolkit on GitHub and you will see the day it is ready.</p>
    <a class="btn main" href="https://github.com/mcthaydt/AutomataFramework"><i data-icon="github-logo"></i>Follow on GitHub</a>
  </div></section>
</main>

<footer><div class="wrap">
  <div>
    <a class="wordmark" href="/" aria-label="Automata Framework, home">automata</a>
    <p>Automata Framework is free and MIT licensed.</p>
  </div>
  <nav aria-label="More">
    <div><h3>Look inside</h3>
      <a href="https://github.com/mcthaydt/AutomataFrameworkExamples">The game's files</a>
      <a href="https://github.com/mcthaydt/AutomataFramework">The toolkit's files</a></div>
    <div><h3>About</h3>
      <a href="#today">What works today</a>
      <a href="/licences.txt">Licences</a></div>
  </nav>
</div></footer>
```

  "In four places" is true because `checkClaims` stops the build unless the engines are exactly four.

- [ ] **Step 2: Write the journeys.** In `home.journey.ts`, at every size:

```ts
test('the page says, below the game, why to care, in these words', …)
//   every h2, kicker, sub, point, numbers dd, closing sentence, footer line and link name, word for word;
//   every link's href (the two repos, #today, /licences.txt)
test('the numbers, the file and the table are the game\'s own', …)
//   reads /facts.json; engines-count '<n> engines'; both steps places '<steps> steps'; files-count; licence 'MIT';
//   the panel heads are level.path and replay.path; the file panel's text has level.firstRow and level.lastRow and,
//   when the level has a thing, its character; the table has one row an engine, each ending 'Same ending';
//   replay-ending is replay.ending; the four data-address links start 'https://github.com/mcthaydt/AutomataFrameworkExamples'
test('five claims, each with a stamp that says where it stands', …)
//   5 cards, numbered 01 to 05, the five titles in order; each stamp is 'Works today' or 'Being built';
//   'checks' is 'Works today'; 'after-demo', 'editors' and 'publish' are 'Being built'; 'agents' as Q1 was answered
test('"What works today" in the bar, the tag and the footer all go to the list', …)
//   each link, clicked, leaves #today's heading in the window
```

  In `look.journey.ts`, at every size: capitals for `.kicker`, `.stamp`, `.note`, `thead th`, `footer h3`,
  `.panel-head`; none for `h2`, `h3` in a claim, `.sub`, `.points li`, `.claims p`. Sections: at 1024 px and wider
  each `.part` has 128 px of padding above and below, and 80 px below that width. Stamps: a `.stamp.works` has a
  2 px solid mark edge and words-colour words; a `.stamp.building` a 1 px dashed quiet edge and quiet words; no
  element with words of its own has the mark colour as its `color` (the walk in `colours`, over `body *`). The
  contrast journey now finds at least 40 things. The focus-ring journey reaches every link and button, the file
  panel included (it is a stop: `tabindex="0"`), each a different thing.
  At 320 px (Review Focus 4): `fitsSideways` is true; the file panel's `scrollWidth` may be more than its
  `clientWidth` and the page's is not; the table is inside the window.

- [ ] **Step 3: The stylesheet.** From the same pictures. Decisions they do not settle:
  - `.numbers`: raised ground, a raised line above and below, four across at 1024 px and wider, two by two below;
    `dt` in Fraunces at 32 px, `dd` quiet at 18 px.
  - `.part`: `padding: 128px 0` (80 px below 1024 px), a 1 px raised line on top. `.split` is text beside its panel
    (5 and 7 of 12 columns; `.flip` swaps them), one column below 1024 px with the text first.
  - `.kicker`: JetBrains Mono, 13 px, capitals, quiet, with a 28 px quiet line before it. `h2`: Fraunces 500,
    `clamp(2rem, 3.8vw, 3.1rem)`, line-height 1.05. `.sub`: quiet, 19 px.
  - `.panel`: a 1 px words edge, the ground behind, `box-shadow: 10px 10px 0 var(--raised)`. `.code`: JetBrains
    Mono 15 px, line-height 1.8, `white-space: pre`, `overflow-x: auto`, and the focus ring when Tab reaches it.
    `.note`: Onest 600, 13 px, capitals, a 1 px words edge on raised; `.leader` is a 1 px quiet line that takes the
    room between. Below 760 px a note goes under its row instead of beside it, so no row is wider for it.
  - The table: rows divided by raised lines; `th[scope=row]` in Onest 18 px; `.same` quiet with a words-colour icon.
  - `.claims`: five across at 1024 px and wider, one column below; raised ground, raised lines between cards.
    `.stamp.works` is turned 3 degrees (`rotate: -3deg`).
  - `.closing`: raised ground, centred (left below 760 px, its button full width there), 128 and 80 px as a part.
  - `footer`: a raised line on top; the wordmark and its line on the left, two columns of links on the right, each
    link 44 px tall; `h3` a 13 px measure label.

- [ ] **Step 4: Verify and commit.** `feat(home): the numbers, the level's file, the checks, the five claims, the
  close and the footer`. Push; `ci` and `site` green. Read the whole-page pictures at every size on `ci-screens`.

### Task 8: Motion

**Files:**
- Modify: `src/styles.css`
- Create: `tests/journeys/motion.journey.ts`

- [ ] **Step 1: Write the journeys** (phone upright and desktop):

```ts
test.describe('with motion', () => {
  test.use({ reducedMotion: 'no-preference' })
  test('the first screen arrives once and ends fully shown', …)
  //   expect.poll: the tag, h1, .lede and .actions each have opacity '1' and transform 'none' or the identity
  test('every stamp is seen once its card is in the window', …)
  //   scroll each .stamp to the middle of the window; expect.poll: opacity '1', and it is toBeInViewport
  test('a button answers a pointer and a press', …)
  //   hover 'Play it': its filter or background differs from at rest; transition-duration is between 0.1s and 0.2s
})
test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('nothing moves', …)
  //   on arrival and after scrolling to the bottom: document.getAnimations().length is 0; every .stamp has opacity '1';
  //   every a and .btn has transition-duration '0s'
})
```

- [ ] **Step 2: The stylesheet.** All of it in CSS; no script. Buttons and links: `transition` of 140 ms on
  `filter`, `transform` and `text-decoration-thickness`; hover brightens a `.btn` (`filter: brightness(1.08)`) and
  thickens a link's underline; pressed moves a `.btn` down 1 px. The first screen: `.tag, h1, .lede, .actions` run
  one `arrive` (opacity 0 and 8 px lower, to rest) over 200 ms, each 40 ms after the one before, `both`. The stamp:
  inside `@supports (animation-timeline: view())` only, `.stamp.works` runs `land` (from 1.4 times the size and
  unseen, to rest) over `animation-timeline: view()` and `animation-range: entry 0% cover 30%`; a browser without it
  shows the stamp landed. Last in the sheet:
  `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }`.

- [ ] **Step 3: Verify and commit.** `feat(home): small motion, off for people who ask for less`. Push; green.

### Task 9: The 404 page, the docs and reading the pictures

**Files:**
- Modify: `404.html`, `src/styles.css`, `tests/journeys/{not-found,hosting}.journey.ts`, `README.md`, `CLAUDE.md`,
  `docs/superpowers/progress.md`, this plan (its boxes ticked)

- [ ] **Step 1: `404.html`** gets the same top bar with the wordmark only (it is the way home too), then, in `.wrap`:
  `<h1>This page does not exist.</h1>`, the sentence as now, and
  `<a class="btn main" href="/"><i data-icon="house"></i>Go to the home page</a>`. `not-found.journey.ts`: the
  wordmark link goes home; the heading is Fraunces in sentence case; the way home is a touch-colour button with
  ground words, 52 px high; the rest as now. `hosting.journey.ts`: after "Go to the home page" the home's `h1` is the
  claim.

- [ ] **Step 2: `CLAUDE.md` and `README.md`.** `CLAUDE.md`: the opening says "Automata Framework"; "What is
  particular" gains: every number and stamp on the page comes from the game's files through `facts`, `claims` and
  `fill` and is in `facts.json`; `build` and `build-real` open the built game once in a browser for its picture and
  `deploy` still never runs it; the structure list gains `tests/fixtures/game-source/` and the four features'
  order. `README.md` says what the page now shows and names `facts.json` beside `version.json`.

- [ ] **Step 3: Read the pictures** on `ci-screens` (`pr-<n>/` for the stand-in game, `pr-<n>-real/` for the real
  one), all three engines, every size, and write one line an answer in the tracker:
  1. From the arrival picture alone, can a drunk grandma say what this is and what to press?
  2. Is the claim the biggest thing on the first screen, and is the wordmark the word alone, with no mark?
  3. Is the game's picture the real game, with nothing drawn on it, and does it look the same as the playing game's
     first moment in `<size>.png`?
  4. Ground green, words yellow, ocher only on what can be pressed, red only as an edge or an icon?
  5. Fraunces on the claim, titles and wordmark; Onest on words; mono on numbers and small labels?
  6. Phone upright: does anything overlap, get cut off or need a sideways scroll? The same at 320 px?
  7. Phone sideways: do the wordmark, the claim, the lede and the button fit before any scroll?
  8. Are the numbers, the file's rows, the table and the title block the real game's values (`facts.json`), and is
     each stamp what the claims file says?
  9. After Play: is it plain that the press worked (the loading note over the picture, then the game)?
  10. Does the share picture (`share.png`, in the `site` run's built site) read at the size of a link preview?
  11. Does the 404 page look like the same site and show one way home?
  A "no" is fixed, with its journey, before the stage ends, or reported as a stop.

- [ ] **Step 4: The tracker.** `progress.md`'s Cycle 3: execution done, the test counts per engine, every deviation
  from this plan with its reason, the checklist's answers, and what the Owner should look at first in Stage 7 (the
  live first screen on a phone, the stamps, the share picture). Commit `docs: stage 4 of the home redesign`. Push;
  `ci` and `site` green; report to the coordinator. Do not merge.

## Self-review

- **Coverage of the direction.** D1 Task 6; D2 Task 6; D3 Tasks 5 and 6; D4 Tasks 2, 4 and 7; D5 Tasks 2, 4 and 7;
  D6 Tasks 2, 4 and 7; D7 Tasks 3, 4 and 7; D8 Task 8; D9 Task 7; D10 Task 5; D11 Tasks 1, 6 and 7. The Owner's
  answers: the name and wordmark (Tasks 5 to 7, 9), No. 325 (Task 1), the claim (Task 6), the real picture until
  the "watch" state exists (Task 5, "Not in this plan"), five claims with stamps (Task 3), the fonts (Task 1).
- **What the audit left to the plan.** The quieter line is the raised shade, so the sheet names six colours and the
  spec's "two mixed shades" holds. The picture is taken of the built game by the build itself. The numbers and files
  reach the build from the game's repo folder (`GAME_SOURCE`), with no framework dependency. Journeys cover every
  new part at every size in three engines. The 404 page is Task 9.
- **Where the page differs from the draft, and why.** No square beside the wordmark (the Owner's answer). Stamp and
  tag words are the words colour, not red (contrast). The table says the engines end the same, not that they end at
  the recorded number (which an editor's save makes untrue). The file's three notes describe the format, not this
  level, and none names a colour of the game (an editor's save or new art would make it untrue). The keys are said
  in words beside an icon, not drawn as key caps (the page's fonts have no arrow characters). Sentences are 18 px where the draft had 16 and 17.
