# Progress

The tracker every stage reads first and updates last. One section per cycle; newest first.

## Cycle 4: the game plays itself

The game's watch mode (framework `watchReplay`, then the game's `?watch`) reaches the page. The plan is
[`2026-11-14-watch-mode.md`](https://github.com/mcthaydt/AutomataFrameworkExamples/blob/main/docs/superpowers/plans/2026-11-14-watch-mode.md)
in AutomataFrameworkExamples (Part D is this repo's); its spec addendum is in AutomataFramework. The Owner's answers
are in: Q1 (a) the strip says "The game is playing by itself. Tap it to play."; Q2 (a) a tap or click on the moving
game starts it, and a dragging finger still scrolls the page; Q3 (b) it plays itself for everyone, reduced motion and
saved data included, so there is no gate and no `mayWatch`; Q4 (a) it loops, with a one-second rest.

| Stage | State | Output |
|---|---|---|
| Framework `watchReplay` (Part A) | Done, merged | AutomataFramework pull requests 29 and 31 |
| Pin move and the game's watch mode (Parts B, C) | Done, merged | AutomataFrameworkExamples pull requests 25 and 26 |
| Part D: the stand-in watches, the page shows the game playing itself, the journeys | In review | this repo's pull request |

### Log

- 2026-11-14: Part D, in this repo's pull request. The page asks for `/play/?watch` once it has loaded and the game's
  place is within a window's height (`whenNear`); the frame sits in the picture's own box with pointer events off, so
  a wheel or a dragging finger scrolls the page and a tap starts the game. Play, or that tap, tells the same frame to
  play (`tellGameToPlay`); the frame is never loaded twice. Each side checks who sent a message and from where
  (`talk.ts`). The built game now downloads for every visitor, which it did not before Play: its size on the wire is
  recorded below once the build's own log has it.

## Cycle 3: the home page looks finished

A design audit came first (the Owner, 2026-11-14: the site "looks unfinished"; combine it with the first attempt's
site). It stands in for the spec, with the "Visual direction" section of the spec in AutomataFramework.

Overall: **90%** (the design audit is 5 points, the plan 10, its audit 5, execution 40, the implementation audit 15,
fixes 15, the Owner's review 10)

| Stage | State | Output |
|---|---|---|
| Design audit | Done, 100% | [`audits/2026-11-14-home-design-audit.md`](audits/2026-11-14-home-design-audit.md) |
| The Owner's answers (Q1 to Q5) | Done, 100% | the audit's "The Owner's answers" |
| The Owner's pick of fonts | Done, 100% | the audit's "The fonts" |
| 2. Plan | Done, 100% | [`plans/2026-11-14-home-redesign-site.md`](plans/2026-11-14-home-redesign-site.md) |
| 3. Plan audit | Done, 100% | [`audits/2026-11-14-home-redesign-plan-audit.md`](audits/2026-11-14-home-redesign-plan-audit.md) |
| 4. Execution | Done, 100% (waits only for CI on its last push) | [pull request 17](https://github.com/mcthaydt/AutomataFrameworkSite/pull/17); pictures: `ci-screens/pr-17` and `pr-17-real` |
| 5. Implementation audit | Done, 100% | [`audits/2026-11-14-site-redesign-implementation-audit.md`](audits/2026-11-14-site-redesign-implementation-audit.md) |
| 6. Fixes | Done, 100% (waits only for CI on its last push) | [pull request 19](https://github.com/mcthaydt/AutomataFrameworkSite/pull/19) |
| 7. Owner review | Not started | |

### Log

- 2026-11-14: Stage 6, the fixes, in [pull request 19](https://github.com/mcthaydt/AutomataFrameworkSite/pull/19).
  The Owner's answers: Q1 (a) the stamp lands once when in view; Q2 (b) the share card drops the lede so about a
  third is the game; Q3 (a) the tiny phone words wait for the "watch" state; Q4 (b) the card reads "The part after
  the demo comes built in" until it works. Lenis stays on for everyone, subtle. In the order done:
  - **F7, first.** Playwright keeps a trace on failure and `journeys.yml` uploads `test-results/` for a failed
    engine (`test-results-<engine>`, 14 days). The Play journey names the button it pressed and, when the game does
    not say it is playing, says the state the game showed, its words, its console and how long it had been; it also
    prints how long each press took. The picture journey reads `/game.png`'s own pixels in Node (`png.ts`, with a
    test of the reader against pictures made with each row filter), not through a canvas. *The causes.* The
    picture's: WebKit's canvas handed back nothing for a 2560 by 1440 picture once (one colour, where Chromium and
    Firefox read the same bytes and passed); a canvas is the engine's own memory, the file is not, so that way of
    looking is gone; it was never the page. The Play journey's: time. The printed times of the first CI run after
    the change are 1.0 to 1.3 s for the first (cold) press of a test and 0.5 to 0.7 s for the next, and one press took
    3.8 s while the runner's other worker was busy: a 5 s limit has about a second to spare at the worst of those and
    fails when a busier moment comes. That is the best-supported cause, not a proven one for the run that failed (the
    run kept nothing, which is why the trace and the message were added first); the message now tells a hang from a
    slow start. The limit is 15 s (the build's own limit for the same wait), and each press's time is printed.
  - **F1 and Q2.** The share card hides the sheet's button, the keys line, the loading note and the lede; the game's
    two lines of words are whole and the level starts under them. `share.journey.ts` sets the attribute the build
    sets and checks nothing is a button, nothing is words in the touch colour, and the game fills a quarter to two
    fifths of the card.
  - **F2 and Q1.** The stamp waits (`data-landing="waiting"`, set by `land.ts`) and lands once over 220 ms when 90% of
    it is in the window; with no script, with reduced motion, or with no `IntersectionObserver` it is simply there.
  - **F3.** A press on a link to a place on the page gives that place the keyboard (`tabindex="-1"`, no ring);
    `links.journey.ts` presses each way at three sizes, then Tab, and expects the focus on and then past the list.
  - **F4.** The bar is kept only from 700 px wide and 500 px high; on a phone it scrolls away. `#game` clears 64 px
    where the bar is kept and none where it is not, so the playing game's top edge is the bar's bottom edge (or the
    window's top) to the pixel (`bar.journey.ts`).
  - **Q4.** `claims.json` gives the card a `whileBuilding` title; the spec's title returns with the stamp.
  - **F5.** The three untrue lines above are corrected in place.
  - **F6.** The stylesheet is six parts in `src/styles/` that `src/styles.css` imports in order; the built CSS is byte
    for byte what it was, the six colours are named in `base.css` only, and the architecture test counts lines in
    every `.ts` and `.css` under `src`, `scripts` and `tests` (a test of the rule). `look.journey.ts` is split into
    look, touch and fallbacks, `home.journey.ts` into home, play and bar; every file is under 600 lines.
  - **Minor.** M1 the motion comment and the plan's Task 8 say where the build left them, and the reduced-motion
    journey is renamed. M2 `CLAUDE.md` says six colours. M3 a refused build ends on its sentence. M4 the version link
    keeps its line. M5 the four numbers stand one under another below 480 px. M6 the README names `GAME_COMMIT`. M7 and
    M8 are left as the audit left them. The `commit-authors` pattern now also catches "Generated by Claude Code" (B1's
    cause), with cases in its test.
  - Run here, not as tests: `biome check`, `tsc`, `knip` and the builds; the pictures and measurements were read from
    a build of the real game in Chromium. No test was run locally; CI is the check, and its result is in the pull
    request.

- 2026-11-14: Stage 5, the implementation and design audit of pull request 17 at `4ceba86`, run on Fable as the
  Owner asked for design audits. The build is what the plan asked for and looks finished on a computer and a tablet;
  all 15 checks are green; nothing stops the stage. Before the merge, B1: the pull request's description carries a
  "Generated by Claude Code" line with a session link, which `commit-authors` misses (its pattern says "with").
  Seven should-fix for Stage 6: F1, the share picture has a "Play it" button and the keys line in it, and cuts a line
  of the game's words in half; F2, the stamp's landing takes 32 px of scroll at the bottom edge of the window and
  cannot be seen; F3, a press on one of the page's own links leaves the keyboard and a screen reader behind; F4, on
  a phone the kept bar holds only the wordmark, and at every size a 16 px strip of the sheet's bar shows above the
  playing game; F5, three statements in the entry below are not true (answer 10, answer 13, the Node test count,
  which is 231); F6, the stylesheet is 1,094 lines against a limit of 600; F7, two journeys each failed once on this audit's own documents-only pull request, a different one in each
  of its two runs, both against the real game (a Play button on a sideways tablet in Chromium; the picture's
  colour count in WebKit), and the runs kept nothing to say why: that is the first thing for Stage 6. Eight minor notes. Measured, since a
  cloud session cannot feel it: one 100 px wheel notch is 63% done at 80 ms and at rest at about 300 ms, ending
  exactly, with touch and keyboard left to the browser. The game's words in its picture are 14.6 px on a computer,
  11 px on an upright tablet and 5 px on a phone. Four questions for the Owner, none decided: Q1, how the stamp
  lands; Q2, what the share picture shows; Q3, the game's words on a phone; Q4, "already done" beside "Being
  built". The site was built in a cloud container around the real game (`pnpm build` only) and opened in Chromium to
  measure; no test was run locally. This stage changes documents only.

- 2026-11-14: Stage 4, execution of all nine tasks, plus smooth scrolling the Owner asked for during it.
  Journeys: 181 per engine against the stand-in game (180 run, 1 skipped: the live check), in Chromium, WebKit and
  Firefox; Node tests: CI ran 231 (this line said 226 plus 3; corrected in Stage 6, audit F5). Tasks 6 and 7 are one commit (their pages
  share one stylesheet and one journey file). Deviations, each with its reason:
  1. **Lenis added (the Owner, 2026-11-14: "super subtle smoothed page scrolling").** `lenis` 1.3.27, MIT, bundled by
     Vite so it is self-hosted and the strict header is unchanged; its notice is in `public/licences.txt`. A new
     feature `motion` (between `pictures` and `play`) starts it and answers every in-page link and every
     `scrollIntoView` the Play buttons used to do. It is very gentle (`lerp` 0.25, wheel speed 1, no smoothing of
     touch). `scroll-behavior: smooth` is gone in its favour.
  2. **No "motion off" (the Owner: "it shouldn't be that obnoxious").** The smooth wheel is on for everyone,
     including devices that ask for less motion. What reduced motion still turns off is the arriving, the stamps'
     landing and the buttons' answers; a press on a link also jumps rather than travels, which is the one thing I
     decided (it keeps the old behaviour for a long trip; cost if wrong: a one-line change in `reveal`).
  3. `biome.json` turns off two rules for `src/styles.css` (descending specificity; the reduced-motion
     `!important` pair) and four accessibility rules for `index.html`; why is in `CLAUDE.md`.
  4. The first push of the Lenis commit had Claude as author by a reset identity; the Owner approved one
     force-push of this branch to fix it, and the clone now has a hook that refuses any other author. An empty
     commit named "probe", made while testing that hook, is on the branch and harmless.
  5. Found by CI on the Lenis commit: a link pressed right after the browser had scrolled it into view (the
     footer's) went nowhere, because Lenis worked from its old place. `reveal` now tells it where the page really is
     first; the existing journey ("What works today" in the bar, the tag and the footer) was the failing test.

  Picture checklist (Task 9), stand-in game in `pr-17`, real game in `pr-17-real`, Chromium and Firefox, WebKit
  where noted:
  1. Yes: the claim, a line saying what it is, one big yellow button.
  2. Yes: the claim is by far the biggest; the wordmark is the word `automata`, no mark.
  3. Yes: the game's own picture, nothing of the site over it; "Loading the game..." sits in the sheet's bar beside it.
  4. Yes: ocher only on what can be pressed; red only on the "Being built" edges, the stamp edge and icons.
  5. Yes: Fraunces on the claim, titles and wordmark; Onest on words; mono on numbers and file text.
  6. Yes at 390 and at 320: nothing overlaps or scrolls sideways (WebKit wraps the claim to three lines and still fits).
  7. Yes: the wordmark, claim, lede and button fit before any scroll at 844 by 390.
  8. Yes: the numbers, file rows, table and title block are `facts.json`'s; the stamps read one "Works today", four "Being built".
  9. Yes: after Play the note says "Loading the game..." in the sheet, then the game; a second press goes back to it.
  10. Not as first written: `share.png` had the sheet's "Play it" button and the keys line drawn in it (audit F1). It no
      longer does: no button, no keys line and no lede, and about a third of the card is the game; `share.journey.ts` holds it.
  11. Yes: the 404 page is the same site with one way home.
  12. Yes, to the eye of its author: one biggest thing per screen, air between sections, visible dividing lines. The
      Owner's judgement.
  13. Not as first written (audit F5): the game's own words in the picture are 14.6 px on a computer, 11 px on an upright
      tablet and 5 px on a phone, where they do not read. The Owner's answer to Q3 (a): leave it until the game's "watch"
      state replaces the picture with the real game at the phone's own size.

  For the Owner to look at first in Stage 7: the live first screen on a phone, the stamps landing as the cards come
  in, the share picture, and how the smooth wheel feels (it is meant to be barely noticed).

- 2026-11-14: the Owner answered both questions. Q1 (a): "Built for agents" is stamped "Being built", so one claim
  reads "Works today" and four "Being built", and no second proof is written. Q2 (b): the line under the claim reads
  "...are what take the weeks after that." Both are in the plan; nothing is open and every task can start.

- 2026-11-14: Stage 3. The plan audit: sound in shape and true to the Owner's answers, not ready as written. Three
  blocking findings: B1, the loading note and the note about JavaScript were drawn over the game's picture (they
  move into the sheet, beside it); B2, the size journey asked 18 px of every `p` while the page's small labels are
  `p` at 13 px (a label is now known by its class); B3, the first screen is about 620 px tall on a 320 by 568 phone,
  so Play was below the fold (smaller sizes there). Eleven should-fix: S1, the top bar stays at the top; S2, lines
  the colour of what they lie on; S3, the small Play buttons are 48 px; S4, labels are Onest's, as the spec says;
  S5, a stamp could rest half faded; S6, the real game could be shown with the stand-in's facts; S7, a game that
  moves would stop every build; S8, Playwright loaded inside the function, and a Node test of the pictures' server;
  S9, the placeholders' loose ends; S10, the share picture is laid out as a card; S11, three wordings ("4 places",
  "Part of the file is shown here", "all of the game's content"). All fourteen are written into the plan. Twelve
  notes for execution. The palette's contrast was worked out again and agrees; the two font packages were unpacked
  and read; one build was tried (Vite leaves a picture's address alone when the file is not there yet). Q1 is still
  open. One new Owner question, Q2: whether the line under the claim keeps "the next six weeks", an unmeasured
  number (nothing waits for it). No test was run: documents only.

- 2026-11-14: Stage 2. The plan: nine tasks. The colours and fonts first (No. 325; Fraunces, Onest, JetBrains Mono),
  on the page as it is. Then three small Node features so nothing on the page is typed: `facts` reads the game's own
  files at the commit being shown and writes `facts.json`, `claims` holds the five claims and stops the build when a
  "Works today" stamp has no proof, `fill` writes both into the pages. The build takes the game's real picture, the
  share picture and the touch icon itself, in a browser. Then the page: the top bar, the first screen, the game on
  its sheet, the numbers, the level's file, the checks, the five claims, the close and the footer; small motion in
  the stylesheet; the 404 page; and the pictures read against a written list. The strict header is not touched and
  the site still does not depend on the framework. Journeys in Chromium, WebKit and Firefox at phone and tablet
  size, upright and sideways, at desktop size and at 320 px. One Owner question, Q1: whether "Built for agents" is
  stamped "Works today" or "Being built" (Task 3 waits for it). The game playing by itself before Play is left for
  the plan that follows the demo's "watch" state. Found while planning: Eugenia Red is 3.64 to 1 on the ground, so
  it is an edge and an icon and never words; after an editor's save the engines no longer end at the recorded
  number, so the page says they end the same; the fonts' Latin files have no arrow characters. The packages' files
  and the colours' contrast were read and worked out; no test was run.

- 2026-11-14: the Owner picked the fonts: Fraunces, Onest and JetBrains Mono for the site and the editors; Fredoka
  with M PLUS Rounded 1c, Jua and ZCOOL KuaiLe for the Examples screens and the demo games, with no second font.
  Nothing is open; the audit is ready to merge and the plan can start.

- 2026-11-14: the fonts. The Owner asked for better ones than the two the site has: one combination for the site and
  the editors (nine languages), one for the Examples screens and the demo games (six). Four of the first and three
  of the second were drawn in their palettes and languages, with the packages each needs. Recommended: Fraunces,
  Onest and JetBrains Mono; and Oxanium with Zen Kaku Gothic New, Gothic A1 and Noto Sans SC. The pick is open.

- 2026-11-14: the Owner's final call on colours: A (No. 325) for the site, E (No. 310) for the editors, D (No. 340)
  for the Examples demo game's screens, and B (No. 276) for the 2D and 3D example games themselves. The audit holds
  all four sets of values.

- 2026-11-14: the Owner picked the palette: A, No. 325 (Deep Slate Green, Naples Yellow, Yellow Ocher, Eugenia Red).
  Every question is answered and the plan can start.

- 2026-11-14: the Owner's answers. The name is "Automata Framework" and the logo is the word "automata". The
  colours are a palette from *A Dictionary of Color Combinations*, on the site only for now; five were drawn and the
  pick is open. The claim is "Finish the game your agent started." The game plays its recorded play by itself
  before Play is pressed, which needs work in AutomataFrameworkExamples first. All five claims are listed with
  stamps.

- 2026-11-14: the design audit. Nine findings (no first screen, one type size, no rhythm, Blueprint only as paint,
  words about the page, no proof shown, no motion, a dead end, no icon or share picture), a table of what the old
  site got right, a direction in eleven parts (the old site's bones in Blueprint's skin, saying only what is true
  today), draft pictures beside the old site and today's, and five questions for the Owner: the colours, the claim,
  the game before Play, the list of what works, the mark. No test was run.

## Cycle 2: the site wears Blueprint

Spec: the "Visual direction" section of
[`2026-11-13-2d-first-layer-design.md`](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/specs/2026-11-13-2d-first-layer-design.md)
in AutomataFramework (Stage 1 was done there, 2026-11-14).

Overall: **90%** (the plan is 10 points, its audit 5, execution 45, the implementation audit 15, fixes 15, the Owner's
review 10)

| Stage | State | Output |
|---|---|---|
| 2. Plan | Done, 100% | [`plans/2026-11-14-blueprint-restyle-site.md`](plans/2026-11-14-blueprint-restyle-site.md) |
| 3. Plan audit | Done, 100% | [`audits/2026-11-14-blueprint-restyle-plan-audit.md`](audits/2026-11-14-blueprint-restyle-plan-audit.md) |
| 4. Execution | Done, 100% | [pull request 10](https://github.com/mcthaydt/AutomataFrameworkSite/pull/10); pictures: [`ci-screens/pr-10`](https://github.com/mcthaydt/AutomataFrameworkSite/tree/ci-screens/pr-10) |
| 5. Implementation audit | Done, 100% | [`audits/2026-11-14-blueprint-restyle-implementation-audit.md`](audits/2026-11-14-blueprint-restyle-implementation-audit.md) |
| 6. Fixes | Done, 100% | the pull request that carries this row |
| 7. Owner review | Not started | |

### Log

- 2026-11-14: Stage 6. F1: the link in "See how it is made:" is now an inline link with 12 px of padding above and
  below, so it stays in its line and is still 44 px tall; a journey at every size holds both (and checks the version
  line's link the same way). F2: `CLAUDE.md` has the Blueprint bullet and `tests/styles/` in its structure list. F3:
  its `git config` line says `McThayDT`. M1: the commit name above is now "the pictures under `cf1084cd…/`". M2: the
  plan's steps are ticked. M3: the Tab journey collects what each stop focused and expects as many different things
  as stops. M4: the colours test also fails on a colour written as a word. M5: one `fitsSideways`, in `look.ts`. M6 is
  the Owner's to look at in Stage 7 and is left alone. Q3 (the Owner chose (a)): `public/licences.txt` carries the two fonts' and the icons'
  notices, copied from the packages' own `LICENSE` files at the pinned versions, with a journey that serves it. Q4 (the
  Owner chose (b)): the old author name is replaced by `McThayDT` in the plans, the audits and `CLAUDE.md`; git history
  is not rewritten, and `LICENSE`'s copyright line says `McThayDT` too (the Owner confirmed). Changing the account's
  display name, which fixes future merge commits, is the Owner's: `gh api -X PATCH user -f name=McThayDT`. No test was
  run locally.

- 2026-11-14: Stage 5. The implementation audit of `main` at `5388563` (pull request 10): the site wears Blueprint as
  the spec's "Visual direction" describes it, and `main` is green in `ci` and `site`. The Owner's four decisions all
  landed (the chalk line goes once the game plays, the `@fontsource` 5.3.0 fonts, Phosphor regular icons, the strict
  header unchanged). Task 4 did land; only the pull request's body was stale. The pictures were read again: all 23 an
  engine are there, and the playing game is the same picture as before, pixel for pixel, in every engine at every
  size. Three should-fix findings for Stage 6: F1, on a phone the link in "See how it is made:" drops to a line of its
  own; F2, the Blueprint bullet and `tests/styles/` the plan asked for are not in `CLAUDE.md`; F3, `CLAUDE.md` still
  gives the old author name in its `git config` line. Six minor (M1 to M6). Two Owner questions, neither blocking:
  Q3, whether the site carries the fonts' and icons' licence notices; Q4, whether anything is done about the old
  author name on GitHub's merge commits and in old documents. No test was run.

- 2026-11-14: Stage 4, Tasks 1 to 4 done (pull request 10). One commit for Tasks 1 to 3, because the package install
  was blocked until the Owner's own yes arrived. `ci` and `site` are green on the first run: 114 Node tests in 14
  files, and 99 journeys in each of Chromium, WebKit and Firefox, against the stand-in game and the real one. 23
  pictures an engine, in `pr-10/` and `pr-10-real/` on `ci-screens`. **The checklist, one line a question:**
  1. Blue paper, chalk words, the yellow Play button first: yes, all engines. 2. A drunk grandma can say what the page
  is and what to press from the arrival picture: yes. 3. Yellow only on what can be pressed (the button, the links):
  yes, and a journey proves it. 4. Condensed font for words, mono for the version line: yes. 5. Every icon beside its
  words, sharp, the colour of those words (chalk, yellow in a link, paper on the button), none pencil: yes. 6. The
  heading, the lede and the button fit upright and sideways, phone and tablet: yes. 7. The playing game, real
  (`pr-10-real/`) against `live/`: the same game, no tint, no rounded corner, and with Q2's answer no line round it.
  8. **No in WebKit, fixed:** the loading note sat on a white frame in WebKit only (a blank frame is painted white
  there, whatever is behind it); the frame is now not shown until the game plays (`visibility`, in the stylesheet), with
  a journey line that checks it; Chromium and Firefox were already right. A first try, the sheet's colour as the
  frame's background, did not work in WebKit (the pictures under `cf1084cd…/` on `ci-screens` show it) and was replaced. The focus ring is clear. 9. A device set to light looks the same: yes. 10. Nothing cut off or
  overlapping. **Reported, not fixed (the plan audit's N3):** on the phone, the link in "See how it is made:" drops
  to a line of its own and leaves a gap in the sentence. 11. After Play, the loading note then the game make the
  press plain: yes.
  Deviations: Tasks 1 to 3 in one commit; Task 3's playing-game rules follow Q2 (b); the frame's `visibility` rule is
  the one stylesheet rule added that the plan's sheet did not have.

- 2026-11-14: Stage 4 starts. Pull request 6 is on `main` (`3893c72`). The Owner answered Q2: (b), the chalk line goes
  once the game plays; the plan says so now (Global Constraints, Task 3's two journeys and its stylesheet).

- 2026-11-14: Stage 3. The plan audit: sound, true to the spec's "Visual direction", and ready to execute once pull
  request 6 is on `main`. Nothing blocking. Nine should-fix findings, all written into the plan by the audit's own
  pull request: S1, the "How to play" icons were pencil and the spec gives icons to chalk; S2, a mistyped icon name
  would not reach the plan's own error, because resolving a missing icon does not throw; S3, the 404 page's heading
  is a sentence set in capitals, now said and tested; S4, two journeys could run before the version line and its
  font arrive (a `settle` helper); S5, two rules that contradicted what the plan builds (the chalk line round the
  playing game, the `theme-color` meta); S6, Q1 is answered (a), the `@fontsource` packages at 5.3.0. A second audit of the same
  plan was written at the same time by another session (pull request 8); what it found and this one had not is taken
  in as S7 to S9 (compare the real game's pictures with `live/`, measure every link at 44 px, ask whether the press
  plainly worked). Seven notes for execution. One Owner question, Q2: whether the chalk line stays round the game
  once it plays (the two audits read it differently); Task 3 waits for it. Checked against the published packages
  and the draft pictures; no test was run.

- 2026-11-14: Stage 2. The plan: four tasks. The two fonts come from packages and are served as the site's own
  files; Phosphor's regular icons are written into the pages when the site is built; one stylesheet holds the five
  Blueprint colours, dark only; the pictures are read against a written list. Not one word of copy changes, the
  strict header stays byte for byte, no workflow changes, and nothing is drawn on or over the game. Journeys in
  Chromium, WebKit and Firefox at phone and tablet size, upright and sideways, and at desktop size, with contrast
  measured on the real page. It replaces the light theme and F4's fix (the Play button no longer sits on the game's
  sky). One Owner question, Q1: which font packages the Owner's yes covers (the plan is written for
  `@fontsource/ibm-plex-sans-condensed` and `@fontsource/jetbrains-mono`, 5.3.0). The fonts, the icons, the build
  and the colours' contrast were tried in a throwaway copy while planning; no test was run.

## Cycle 1: the 2D first layer, the Site's share of M1

Spec: [`2026-11-13-2d-first-layer-design.md`](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/specs/2026-11-13-2d-first-layer-design.md)
in AutomataFramework (Stage 1 was done there). The project-wide tracker is AutomataFramework's
[`progress.md`](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/progress.md).

Overall: **89%** (the plan is 10 points, its audit 5, execution 45, the implementation audit 15, fixes 15, the Owner's
review 10)

| Stage | State | Output |
|---|---|---|
| 2. Plan (M1, site) | Done, 100% | [`plans/2026-11-13-m1-thin-thread-site.md`](plans/2026-11-13-m1-thin-thread-site.md) |
| 3. Plan audit | Done, 100% | [`audits/2026-11-13-m1-site-plan-audit.md`](audits/2026-11-13-m1-site-plan-audit.md) |
| 4. Execution | In progress, 91% (Tasks 1 to 7 done and merged; Task 8, going live, waits for the Owner's Cloudflare settings) | the plan, ticked as it goes; [pull request 3](https://github.com/mcthaydt/AutomataFrameworkSite/pull/3) |
| 5. Implementation audit | Done, 100% | [`audits/2026-11-13-m1-site-implementation-audit.md`](audits/2026-11-13-m1-site-implementation-audit.md) |
| 6. Fixes | Done in code, 100% (F1 to F6; F7 is settled by the Owner); waits for CI on its pull request | this branch's pull request |
| 7. Owner review | Not started | |

### Log

- 2026-11-14: Stage 6, the fixes. F1: `decide` takes the run's ref and says in words that a run off `main` is built
  and tested but never deployed, and the `deploy` job's `if` also requires `github.ref == 'refs/heads/main'`. F2: the
  `site` workflow's jobs are `build-real` and `journeys-real` (their checks are `build-real` and
  `journeys-real / engines (…)`), so `ci`'s `check`, `build` and `journeys / engines (…)` are the only checks of those
  names, and a test reads both workflows and fails on a shared name. F3: in the short-window rule the playing game is
  `100svh`, with a journey at 844 by 390 (and in the turning-the-phone journey). F4: the Play button and its ring stay
  dark in both colour schemes, with a dark-mode journey and picture. F5: the touch journey `tap()`s each button before
  the hold. F6: a "Try it on your machine" section in the README and `tests/docs/readme.test.ts`. F7 stays as the
  Owner ruled (a), and the merge session checks authors. Lint, typecheck and knip pass; the tests wait for CI.

- 2026-11-14: Stage 5. The implementation audit of `main` at `97b0940`: the build is what the plan asked for and
  `main` is green (73 Node tests, 40 journeys per engine; the real game passed the same journeys in `site`). The
  top-level `404.html` is there and proven. Seven should-fix findings for Stage 6: F1, a hand-started `site` run off
  `main` would deploy (fix before Task 8); F2, `ci` and `site` share job names, so required checks are ambiguous; F3,
  the playing game is too short on a sideways phone; F4, the Play button and its focus ring fade in dark mode; F5,
  the touch journey skips hit testing; F6, the README has no commands for a first-time developer; F7, one commit on
  `main` is authored by "Claude". Six minor notes, and one Owner question (Q1, about F7's commit), answered (a): the
  commit stays, and the merge session checks commit authors before every merge. All of Stage 4's rulings stand. `main`'s protection is now on.

- 2026-11-13: Stage 4, Task 7 done: the `site` workflow. The Owner chose to keep the strict header (the eval was zod's
  probe), the framework fixed it (AutomataFramework 9109fa3), Examples moved its pin (9fab3c0), and the re-run of
  `site` on pull request 3 picked that game: `pick`, `build` and the journeys passed in Chromium, WebKit and Firefox
  (40 journeys per engine, touch included), and `deploy` and `live` were skipped because a pull request is never
  deployed. `ci` is green too (73 Node tests in 9 files, the same 40 journeys per engine against the stand-in game).
  The `ci` checks the Owner can make required on `main`: `check`, `build`, `journeys / engines (chromium)`,
  `journeys / engines (webkit)`, `journeys / engines (firefox)`. Task 8, going live, waits for `CLOUDFLARE_API_TOKEN`
  and `CLOUDFLARE_ACCOUNT_ID` and for the editor's address (the home page's "Change this game" line).

- 2026-11-13: Stage 4, Tasks 5 and 6 done: the home page, the Play button, the 404 page and the headers. `ci`
  is green (39 journeys per engine in Chromium, WebKit and Firefox, plus 5 Node test files for workflows and the
  rest). Task 7's `site` workflow is written and runs: its `pick` found a real game commit, `build` built it, and the
  journeys pass against the real game in Chromium and WebKit, touch included. **One stop:** in Firefox only, the real
  game logs a Content-Security-Policy error (a blocked eval in `/play/assets/headless-*.js`) under the site's header,
  so 6 Firefox journeys are red in `site`. The game still plays. This is reported to the coordinator as an Owner
  question (keep the strict header and fix zod's eval probe in the framework or Examples, or add `'unsafe-eval'`);
  the header stays strict meanwhile. Audit findings applied so far: B1 (the build job's pnpm and cache paths, with a
  check that both repos use the same pnpm), B2 (the new words, the "What to do next" section, the arrival pictures
  and the before-any-scroll journey), B3 (no minutes on the page), S1 (a touch journey on a phone and a tablet),
  S2 (the `screens` guard and the `-real` folder), S3 (both Cloudflare settings), S4 (the plan and tracker say the
  editors have their own project), S5 (the game's own words), S6 (`live` runs the wait first and alone), N3 and N4.
  Pictures read: the arrival and playing pictures of the stand-in and the real game (`pr-3`, `pr-3-real` on
  `ci-screens`); every size shows the heading, the lede and the Play button without scrolling, and the real game
  plays at every size. Rulings: the journeys' `actionTimeout` is 8 seconds so a missing button fails in seconds; the
  Play button's height is rounded in its journey, because Firefox reports 56 px as 55.99997; the journeys import the
  version helpers by relative path, not `#src/`.

- 2026-11-13: Stage 4, Tasks 1 to 4 done and green in CI (pull request 3): the skeleton and the architecture test,
  the version stamp, picking the game's commit and deciding whether to deploy, and assembling the site around a game
  (44 + 8 Node test files' worth: 57 tests passing at Task 3). Rulings so far: (a) Tasks 2 and 3 pushed their tests
  together, so one red run read both; (b) `wrangler.toml`'s `compatibility_date` is `2026-09-30`, the newest date the
  pinned `workerd` supports, not the day the file was written (CI's first run said so); (c) `pnpm-workspace.yaml`
  lists `esbuild` and `workerd` in `onlyBuiltDependencies`, because pnpm 10 skips their install scripts and
  `wrangler pages dev` needs both; (d) `decide`'s sentences say "CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID"
  (audit S3).

- 2026-11-13: Stage 3. The plan audit: sound in shape, not ready as written. Three blocking findings: B1, the `site`
  workflow can't set up pnpm in sub-folders; B2, onboarding (the Owner's rule), with new words for what this is and
  what to do next, and the Play button proven on screen on arrival; B3, the unmeasured "about 15 minutes". Six
  should-fix (S1 to S6, touch journeys included), one Owner question (Q1, a link to the editor) and six notes.
  Execution applies them. The editors get their own Cloudflare Pages project (the Owner), so the line below about
  where they are hosted is settled.
- 2026-11-13: Stage 2. The Site's M1 plan written: 8 tasks, from the repo's skeleton to going live. The site does not
  depend on the framework: its `site` workflow picks the newest commit on the game's `main` whose checks all passed,
  builds the game with the game's own `pnpm build`, serves it at `/play/` in a frame behind a "Play the game" button,
  runs the journeys against it in Chromium, WebKit and Firefox, and only then uploads to Cloudflare Pages. It looks
  for a newer game every 10 minutes. Pull-request CI uses a stand-in game so the site can be built before the game is.
  This pull request also adds `CLAUDE.md` and this tracker; CI arrives with the plan's Task 1.
- 2026-11-13: The Owner's answers while the plan was written: the Cloudflare Pages project is `automataframework`
  (`automataframework.pages.dev`); `wrangler` 4.140.0, `@playwright/test` 1.63.0 and `@types/node` 24.19.1 are
  approved; deploying waits until M1 is complete, so Tasks 1 to 7 need no Cloudflare access and Task 8 (going live)
  waits for the Owner's `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
- 2026-11-13: What the site relies on from the Examples repo was agreed with its plan session (the plan's "What this
  plan relies on"). Where M1's browser editor and its sign-in function are hosted is with the Owner, through the
  Editors plan; neither is in this plan.
