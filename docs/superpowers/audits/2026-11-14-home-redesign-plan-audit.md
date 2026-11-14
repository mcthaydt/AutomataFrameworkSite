# Plan audit: the home page looks finished

Written 2026-11-14. Stage 3 (Plan audit) of Cycle 3, for
[`plans/2026-11-14-home-redesign-site.md`](../plans/2026-11-14-home-redesign-site.md) as merged at `0c9ee9f`, read
against the design audit that stands in for its spec
([`2026-11-14-home-design-audit.md`](2026-11-14-home-design-audit.md): the direction D1 to D11 and the Owner's
answers), the "Visual direction", "The offer" and "The site" sections of the
[spec](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/specs/2026-11-13-2d-first-layer-design.md)
as it is on AutomataFramework's `main`, this repo's `CLAUDE.md`, [`progress.md`](../progress.md), `main` at
`0c9ee9f`, the demo game's repo at `94d0cb5`, the two font packages as published, and the draft pictures. It serves
principle 1 (agent-first) and the rule that onboarding comes first, as the plan does.

## The answer first

The plan is sound in shape and true to the Owner's answers: the right page, in the right colours and fonts, with
every number read from the game and the strict header untouched. It was **not ready as written**. Three findings
would have stopped execution or broken a rule the Owner set (B1 to B3), and eleven more would have left the page
short of "finished" or short of true (S1 to S11). **All fourteen are already written into the plan** by this audit's
pull request, each marked "audit B1" and so on where it lands, so execution follows the plan as it now reads.
Twelve notes (N1 to N12) are for execution to read; none changes a step.

The plan's own question, **Q1** (the "Built for agents" stamp), is still open and is not asked again here. There
is **one new question for the Owner, Q2**: whether the line under the claim keeps "the next six weeks", a number
nobody measured. Nothing waits for Q2.

Nothing here reopens a decision the Owner made.

## What was asked, and the answer to each

| Check | Answer |
|---|---|
| The finish the Owner asked for | Close, with gaps. The bones are the design audit's D1 to D11, all covered. Missing were: a top bar that stays (S1), lines that could not be seen (S2), a stamp that could rest half faded (S5), a share picture that was a plain screenshot with buttons in it (S10), a first screen that did not fit a small phone (B3), and the small finishing rules a designed page has (the claim's tracking, balanced titles, selection colour; written into Task 6). Task 9 now asks "does it look finished" against the drawings. |
| Palette No. 325 and its contrast | Yes. The four book values are the spec's. Both mixed shades and all ten contrast figures were worked out again with the repo's own `contrast` and agree with the plan to two places (the table under "Method"). Eugenia Red never carries words, and a journey proves it. One slip: raised lines on raised grounds, 1 to 1 (S2). |
| Fraunces, Onest and JetBrains Mono | Yes for the packages: both exist at the versions named, with the files, family names, weight ranges and licence lines the plan says. One slip against the spec: the plan set small labels in JetBrains Mono, and the spec says labels are Onest's (S4). |
| The strict header | Yes. `public/_headers` is not edited and a journey holds it character for character. Fonts, pictures, the icon and `facts.json` are all the site's own files; nothing is inlined as a `data:` address; no inline script and no `style` attribute. The build's browser (for the pictures) runs in the two jobs that already build the game, and `deploy` still never runs it. |
| The drunk-grandma test | Mostly. The first screen's words are the Owner's. Three places were not yet one voice or not yet true (S11), and two notes were drawn over the game's picture (B1). |
| Onboarding | Yes, with B1 and B3 fixed. A first-time player learns what this is (the claim and lede), what to press (three Play buttons, one always on the first screen), how (the keys or "the buttons on the game", by the kind of pointer), and that the press worked (the page goes to the game, says it is loading, then plays). A first-time developer still gets from clone to the page by the README, which gains the one new command and its test. |
| End-to-end tests in three browsers | Yes. Every new part has a journey at five sizes in Chromium, WebKit and Firefox, against the stand-in game in `ci` and the real game in `site`, plus 320 px, no fonts, no JavaScript, reduced motion, touch and the keyboard. One of the plan's own journeys contradicted its page (B2) and one could not prove what it claimed (S1). |

## Method

- The plan was read whole, twice, against the design audit's D1 to D11, each of the Owner's answers, and the spec's
  "Visual direction" line by line.
- Every file the plan changes was read on `main`: both pages, the stylesheet, `play.ts`, `page.ts`, the icons
  feature, `assemble`, `version`, `pick`, `vite.config.ts`, `playwright.config.ts`, `knip.json`, the three workflows
  and their tests, every journey and its helpers, the tokens test and the architecture rules.
- The demo game's repo was read at `94d0cb5`: `automata.toml`, the level, the recorded play, the page's own words
  and states, and what its build copies to `dist/`.
- The colours were worked out again with `tests/fixtures/contrast.ts`:

  | Pair | Ratio | | Pair | Ratio |
  |---|---|---|---|---|
  | words on ground | 11.54 | | touch on raised | 6.38 |
  | words on raised | 9.89 | | ground on touch | 7.44 |
  | quiet on ground | 6.40 | | mark on ground | 3.64 |
  | quiet on raised | 5.49 | | mark on raised | 3.12 |
  | touch on ground | 7.44 | | raised on ground | 1.17 |

  Mixing 6% and 70% of the words colour into the ground gives `#1f3a33` and `#b5af7d`, as the plan says.
- `@fontsource-variable/fraunces` 5.3.0 and `@fontsource-variable/onest` 5.3.1 were unpacked and read: `opsz.css`
  (3 faces) and `wght.css` (7 faces), each face with a `unicode-range`; the Latin range has `×`, `…` and `·` and
  the up and down arrows only; `fraunces-latin-opsz-normal.woff2` is 67 kB; both licences are the SIL Open Font
  License 1.1 with the copyright lines the plan gives.
- One thing was tried: `vite build` on a copy of today's page with `<img src="/game.png">` and
  `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` added, neither file existing. Vite left both
  addresses as written and the build passed (N1). The page was put back.
- The first screen's heights at 320 by 568 were summed from the plan's own sizes (B3).
- No test was run, here or in CI: this stage changes documents only.

## Blocking (all applied to the plan)

**B1. Two of the site's notes were drawn over the game's picture.** The plan's rule, and the Owner's, is that
nothing is drawn on or over the game's picture. But the plan put "Loading the game…" and the note about JavaScript
inside `#game`, on top of the picture, and said so ("The loading note sits over the poster"); with JavaScript off,
the note would sit on the game's art for good. *Applied:* `#game` holds the picture and the frame and nothing else.
"Loading the game…" is in the sheet's bar, where "Play it" was; the note about JavaScript is a row between the bar
and the picture. `createPlayer` is handed the note, a press scrolls the whole sheet into view so the note is seen,
and a journey checks, before Play, while loading and with JavaScript off, that the thing under five points of the
picture is the picture.

**B2. The plan's size journey would fail on the plan's own page.** It asked that every `p` be at least 18 px, and
the page's kickers and panel heads are `p` at 13 px. *Applied:* a label is known by its class, never by its tag. The
Global Constraints list the label classes (at least 13 px), the journey has a short list of measures (the file's
rows, a panel's file name, the cards' numbers: at least 15 px), and everything else a person reads is at least 18.

**B3. The first screen does not fit a 320 px phone.** The plan's journey asks that the wordmark, the claim, the
lede and the main Play button all be in the window at 320 by 568 before any scroll. By the plan's own sizes that
screen is about 620 px tall: a 64 px bar, the 44 px tag, a claim of four lines at 41.6 px, a lede of eight lines at
19 px, and a 52 px button. Play would be below the fold on the smallest phones, which is the onboarding rule's first
part. *Applied:* in a window less than 360 px wide or less than 600 px high the tag is not shown, the claim is
2.1rem and the lede 18 px (about 470 px). The rule for a window under 500 px high stays.

## Should fix (all applied to the plan)

**S1. The top bar was never said to stay, and one journey depended on it.** Review Focus 2 is "the top bar's Play
button, pressed at the bottom of the page". Unless the bar is kept at the top of the window, that button is not at
the bottom of the page, and the journey's click would quietly scroll back up to find it and prove nothing. A bar
that stays is also what the old site had. *Applied:* the bar is kept (`position: sticky`) in a window 500 px high or
more and scrolls away in a shorter one, where the playing game takes the whole window; `#today`, the sheet and the
game get a scroll margin so the bar never covers what a press goes to; journeys check the bar stays, that the button
is in the window before it is pressed, and that "What works today" lands below the bar.

**S2. Lines the colour of what they lie on.** The numbers row and the claims' cards are on the raised colour, and
the plan divided them with raised lines: 1 to 1, no line at all. The draft's cards are plainly divided. *Applied:* a
dividing line is never the colour it lies on: raised on the ground, the ground colour on a raised ground. A journey
walks every border on the page and fails on one that matches its ground.

**S3. The two small Play buttons were 44 px.** The spec's "Still true": touch targets 44 px and primary actions
48 px. "Play the game" in the bar and "Play it" on the sheet are primary actions. *Applied:* `.small` is 48 px, and
the journey measures it.

**S4. Small labels were in the number font; the spec gives labels to Onest.** The spec, amended the same day as the
fonts were picked: "Labels and drawing notes are still set in capitals, like notes on a drawing, in Onest", and
JetBrains Mono is "for numbers and measures". The plan set kickers ("Built for agents"), the title block's and the
footer's small headings in JetBrains Mono. *Applied:* every label is Onest in capitals; JetBrains Mono is only for
numbers, measures, file names, the file's rows and the recorded ending, shown as they are written. The journey
checks each label's family.

**S5. A stamp could rest half faded.** The stamp's landing follows the scroll, not a clock
(`animation-timeline: view()`), over a range that ended only when the stamp had crossed 30% of the window. A page
at rest with the claims low in the window (which is where "What works today" can leave them) would show "Works
today" partly faded and too large, and the stamp is the one thing in that section a person must read. *Applied:*
the range ends the moment the whole stamp is inside the window, and a journey rests a stamp just inside the bottom
edge and expects it wholly landed. Smooth scrolling for the page's own links is added, off under reduced motion.

**S6. The real game could be shown with the stand-in game's facts.** `GAME_DIR` (the built game) and the new
`GAME_SOURCE` (its repo folder) are set apart, and each falls back to a fixture. Someone following today's README
sets only `GAME_DIR`, and would get the real game under the stand-in's name, numbers and file: an untrue page, built
without a word. *Applied:* `GAME_DIR` without `GAME_SOURCE` stops the build with a sentence that says what to set.

**S7. A game that moves would stop every build of the site.** The picture of the game was taken when two shots in a
row were the same, and a game that never stood still was an error. The demo is about to gain a title screen, music
and moving things (the Owner: it must show every core feature), and the site rebuilds around each new commit of the
game: the first animated one would turn `site` red and freeze the live page. *Applied:* a game that never says it
is playing is still an error; a game that keeps moving is not. After 3 seconds the last picture is kept and a line
says so.

**S8. Playwright loaded at the top of a file every script and the Vite config load.** `pictures` is exported from
`src/build.ts`. A top-level import would load Playwright for every build step, and a Node test that reached it
would load Playwright's `expect` beside Vitest's, which stops with "Cannot redefine property". It also left
`serveFolder`, which promises to serve "nothing outside the folder", with no test. *Applied:* Playwright is loaded
inside `takePictures` with `import()`; `tests/features/pictures/serve.test.ts` tests the server in Node, an address
that climbs out of the folder included.

**S9. The placeholders had two loose ends.** The first screen's "See how it is made" was written with an `href`
and a `data-address` that "gains `href`": two `href`s on one link. And nothing caught a placeholder left unfilled
(a typo in an attribute's name would ship an empty number). *Applied:* a `data-address` element is written with no
`href` and a `data-fact` element empty; either written otherwise, or any placeholder still unfilled at the end, is
a `FillError` naming it and the page. The link's journey expects the game's files at the commit shown.

**S10. The share picture was a screenshot of the top of the page.** At 1200 by 630 it would show the nav, and two
buttons nobody can press, in the one picture that stands for the site everywhere a link is pasted. *Applied:* for
that picture only, the build marks the page (`data-picture="share"`) and the stylesheet lays the first screen out
as a card: the wordmark, "Being built", the claim, the lede and the top of the game. Task 9 reads it.

**S11. Three places where the words were not yet true or not yet one voice.**
- The numbers row said "4 engines"; the claim's line and the checks' section say "four places". *Applied:*
  "4 places" everywhere a person reads a count. "Engine" is not a word a newcomer has to know.
- "Some rows are left out here" under the file panel: the panel also leaves out the file's other parts (today
  `format` and `starts`). *Applied:* "Part of the file is shown here."
- "3 small files: the whole game, apart from its code" left out the project file and the recorded play.
  *Applied:* "hold all of the game's content", which is what `automata.toml` lists and the number counts.

## Notes for execution

- **N1.** Vite leaves `/game.png` and `/apple-touch-icon.png` as written when the files are not there at build time
  (tried on Vite 8.3.3). Task 5 checks the built page still names them.
- **N2.** `claims.json`: import it with `with { type: 'json' }` (and `resolveJsonModule` in `tsconfig.json`), which
  Node 24, Vite and Vitest all read. The plan's fallback (`readFileSync`) stays if that fails; report it as a
  deviation.
- **N3.** A `FactsError`, `ClaimError` or `FillError` should end the build with its sentence, not a stack: read the
  facts in the plugin's `buildStart` and pass the message to `this.error`. Written into Task 4.
- **N4.** `readProject` reads a small part of TOML. A value it cannot read (single quotes, a backslash, more than
  one line) must stop with a `FactsError` naming the line, never be read wrongly. `format = 1` and `hero = "hero"`
  are in the real file and are ignored.
- **N5.** `SITE_ADDRESS` had no user and `knip` would fail on it. Removed from Task 5; the address is typed in the
  head and held to the workflow's `SITE_URL` by a test.
- **N6.** The proof `same-in-every-engine` is only as strong as `pick`: the engines' names come from the site's own
  `REQUIRED_CHECKS`. That is sound (the site shows only a commit that passed them) and the plan says so; a build off
  CI with the fixture still stamps "Works today", which is fine for a page nobody is served.
- **N7.** "Chrome" and "Safari" are the page's names for Playwright's Chromium and WebKit, as in the spec's own
  sentence and the draft the Owner saw. Kept. If the words are ever challenged, "the engines of Chrome, Safari and
  Firefox" is the exact form.
- **N8.** On a phone the game's picture is a 1280 px picture drawn about 360 px wide, so the game's own words in it
  are too small to read (the draft's phone picture shows the same). The sheet's bar says how to play, so nothing is
  lost. Task 9 asks what is seen; it is for the Owner's review.
- **N9.** The three fonts are about 122 kB together and arrive after the first paint, so the claim is drawn in
  Georgia for a moment and then moves. If Task 9's pictures or a slow load show a jump that looks broken, report it;
  a fallback tuned with `size-adjust` is the fix, and is not in this plan.
- **N10.** The name rule reaches the README's first lines and `package.json`'s `description`, and the README still
  says the site "wears Blueprint". Written into Task 9.
- **N11.** `tests/fixtures/game-source/` holds JSON that `biome` formats its own way; run `pnpm format` once and
  commit what it writes. If the real game's `game.png` is ever over 500 kB, say so in the tracker.
- **N12.** `live` runs the journeys in Chromium only, as it does today; the three engines run against the same
  build in `site` before the deploy. The new journeys need nothing more there.

## For the Owner

**Q1 (the plan's): open, not asked again.** Whether "Built for agents" is stamped "Works today" or "Being built".
Task 3 waits for it.

**Q2 (new). Does the line under the claim keep "the next six weeks"?** "Saves, menus, settings, touch controls and
publishing are what take the next six weeks." It is the line of the draft the Owner saw. "Six weeks" is a number
nobody measured, and the rule here is that every claim on a page is true on `main` today; the first cycle's audit
stopped an unmeasured "about 15 minutes" for the same reason.

- (a) Keep it as drawn.
- (b) "...are what take the weeks after that." **Recommended.**

Nothing waits for it: the page is built with the draft's words until the answer, and either answer is one sentence
in the page and the same sentence in a journey.

## What happens next

Stage 4 (execution) follows the plan as it now reads. Tasks 1, 2, 4 and 5 can start; Task 3 waits for Q1.
