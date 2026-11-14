# Implementation audit: the site wears Blueprint

Written 2026-11-14. Stage 5 (Implementation audit) of Cycle 2, for `main` at `5388563` (pull request 10, merged), read
against the "Visual direction" section of the
[spec](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/specs/2026-11-13-2d-first-layer-design.md),
the [plan](../plans/2026-11-14-blueprint-restyle-site.md), the [plan audit](2026-11-14-blueprint-restyle-plan-audit.md),
`CLAUDE.md` and [`progress.md`](../progress.md), with Cycle 1's
[implementation audit](2026-11-13-m1-site-implementation-audit.md) as the format.

## The answer first

The site wears Blueprint, as the spec describes it and as the plan drew it, and `main` is green. Both runs on the merge
commit passed: `ci` (run 43543768299, the stand-in game) and `site` (run 43543768403, the real game), in Chromium,
WebKit and Firefox. Nothing here blocks.

**The Owner's four decisions all landed:**

- **The chalk line goes once the game plays.** `#game[data-state="playing"] { outline: none; }`, and a journey checks
  the line is there before Play and gone after, at five sizes in three engines.
- **The fonts are the `@fontsource` packages at 5.3.0**, exact versions, development-only. The build writes three
  `.woff2` and three `.woff` files to `dist/assets/` and inlines none.
- **The icons are Phosphor, regular weight** (`@phosphor-icons/core` 2.1.1), written into the HTML at build time: six
  on the home page, one on the 404 page, each beside its words.
- **The strict header is unchanged.** `public/_headers` is not in the pull request's diff, and a journey now holds the
  whole line, character for character.

**Task 4 did land.** The pull request's body says Task 4 "follows once CI has written the pictures", and was never
updated; that sentence is stale, not true. What is on `main`: the README's Blueprint bullet (commit `7a7b806`), Stage 4
at "Done, 100%" with the counts and the pictures' link, and all eleven checklist answers in the tracker's log. The
pictures were really read: question 8 found a defect only WebKit shows (the loading note on a white frame), and it was
fixed with a stylesheet rule and a journey line (`e6071be`). This audit read the pictures again and agrees with all
eleven answers. Two small things the plan asked for did not land, both in `CLAUDE.md` (F2).

**Findings for Stage 6:** three should-fix (F1 to F3) and six minor (M1 to M6). The one that a visitor sees:

- **F1:** on a phone, the link in "See how it is made:" drops to a line of its own and leaves a gap. It was known
  (the plan audit's N3) and left for this audit; in yellow it is now the most visible flaw on the page.

Two questions are for the Owner (Q3 and Q4). Neither blocks Stage 6.

## Method

- Read the whole diff of pull request 10 (25 files), and in full: `src/styles.css`, both pages, the `icons` feature,
  `vite.config.ts`, every new or changed journey and Node test, the README, `CLAUDE.md` and the tracker.
- Read the spec's "Visual direction" line by line against the stylesheet and the pictures.
- Read the check runs of the pull request's last commit (`e6071be`: 12 passed, `deploy` and `live` skipped, as they
  must be for a pull request) and the two runs on `main`.
- Built the site (`pnpm build`, which the project allows) and read `dist/`: the font files, the icon counts (6 and 1),
  the built stylesheet (no `data:` address, `font-display: swap` three times).
- **The pictures.** All 23 an engine are there, for both games (138 files). Looked at 14 of them by eye, across the
  three engines and both games: arrival, whole page, playing, loading, focus and not-found on the phone; the sideways
  phone; the upright tablet; the desktop. Checked the rest by program:
  - the picture on a device set to light is the same as the ordinary arrival, pixel for pixel, in every engine and
    both games;
  - the whole-page, loading and not-found pictures hold no white at all, in every engine;
  - **the playing game is the same picture as before this work, pixel for pixel**, in every engine, at all five
    sizes, for the real game (against `live/` as it stood before the merge) and the stand-in game (against `main/`).
    At four sizes the two pictures line up as they are; on the upright tablet the game sits 14 px lower (19 in
    Firefox) because the heading above it changed, and lined up it is identical too.
- Counted the tests in the code: 14 Node test files, and 99 journeys an engine (51 in `look`, 5 in `not-found`, 39 in
  `home`, 4 in `hosting`), which matches the tracker. The tracker's "114 Node tests" was not re-read from the log.
- Checked every commit of the pull request for its author, committer and trailers.
- No test was run (project rule).

`live/` and `main/` on `ci-screens` were overwritten by the merge's own runs while this audit was being written. The
"before" pictures used here are still on the branch under the commit's own folders:
`cdee80205cd7d5fb5b0666f1b34de3a5d91fd7a7/` (stand-in) and `cdee80205cd7d5fb5b0666f1b34de3a5d91fd7a7-real/` (real).

## Against the spec's "Visual direction"

| The spec says | On `main` | Verdict |
|---|---|---|
| Deep blue paper, chalk lines and text, pencil for quieter text, one marker yellow for "you can touch this" | The five colours, value for value, as custom properties; a Node test holds the stylesheet to them, and a journey reads them back from the drawn page | Done |
| Marker means touch and nothing else | Yellow is on the Play button and the links only; a journey proves both directions at every size | Done |
| Square corners (2 to 3 px), 1 px chalk borders, a soft shadow only on floating panels | `--corner: 2px`, 1 px chalk lines, no shadow anywhere (nothing on the site floats). The game's place has no rounded corner on purpose: it would cut the game's own corners | Done |
| IBM Plex Sans Condensed for labels, in capitals | Headings, the Play button, the loading note and the footer's links, by `text-transform`, so the words in the page stay as typed | Done |
| JetBrains Mono for numbers and measures, tabular | The version line | Done (see M6) |
| Dark by default | Dark is the only theme; a device set to light gets the same page, proven by picture | Done |
| The game's art is never restyled | No filter, tint, opacity, blend, corner or border on the frame or its place; the frame fills its place edge to edge; the playing game is pixel-identical to before | Done |
| Icons: Phosphor, regular weight; every tool has a word under its icon | Seven icons, all regular, none alone, each the colour of its words, none pencil | Done |
| Touch targets of 44 px, primary actions of 48 px | A journey measures every visible link and button at every size: links 44 px, the Play button 56 px | Done |
| Every word passes the drunk-grandma test | No word changed. The yellow button is the first thing the eye lands on at every size; the loading note and then the game make the press plain | Done, but for F1 |
| Where it applies: the site | The home page and the 404 page | Done |

The editors' parts of the section (canvas-first layout, drawing notes, stamps, each editor's tint) are not the site's.

## Against the plan

| Task | Verdict |
|---|---|
| 1. The fonts as the site's own files | Done. The header journey pins the whole line; a journey proves the three faces load from the site's own address and nothing is fetched from anywhere else; the fonts-blocked journey runs upright and sideways. |
| 2. Icons written in at build time | Done. `inline.ts` is pure, `read.ts` catches a failed read (the plan audit's S2), and an unknown name stops the build with the sentence that names the icon and the page. The README has its "Icons" section. |
| 3. The Blueprint stylesheet | Done, with Q2 (b). Every journey the plan lists is there. Two lines for `CLAUDE.md` are missing (F2). |
| 4. Read the pictures, hand over | Done (see "The answer first"). It has no commit of its own: its parts are in the two `fix(look)` commits. |

The plan audit's S1 to S9 were all applied; each was found in the code. The three deviations in the tracker are fair:
Tasks 1 to 3 in one commit (the install waited for the Owner's yes), Q2 (b), and the one added rule (the blank frame
is not shown until the game plays). That rule is right: nothing of the game exists to be hidden before its page
loads, and once it plays the frame is shown whole.

## Should fix

**F1. On a phone, the link in "See how it is made:" drops to a line of its own.** In all three engines at 390 px
(`pr-10-real/*/phone-390x844-whole.png`), the sentence reads "See how it is made:", then a gap, then the yellow link
on the next line with the full stop after it. The cause is `display: inline-block` with `line-height: 44px` on
`.next a`: the link is one box, it does not fit beside the words before it, and it brings a 44 px line with it.
*Fix:* keep the link in its line (`display: inline`) and reach 44 px with padding above and below (8.5 px each way on
a 27 px line; padding on an inline link grows what a thumb can hit without moving the lines). Add a journey at
390 px: the link starts on the same line as "See how it is made:", and it is still at least 44 px tall. The footer's
links and the 404 page's link stand alone on their lines and can stay as they are; check the version line's link the
same way while there.

**F2. Two lines the plan asked for are not in `CLAUDE.md`.** Task 3, Step 6: a bullet under "What is particular to
this repo" saying the site wears Blueprint, the five colours and two fonts are named only in `src/styles.css`, marker
yellow is only for what can be touched, dark is the only theme, and nothing is drawn on or over the game. Task 3,
Step 1: `tests/styles/` in the structure list. Only the dependency bullet was changed. `CLAUDE.md` is what every later
session reads first, and a session adding a page would not learn the rules of the look from it. *Fix:* add both, and
`tests/features/icons/` needs no line (the list already says tests mirror `src/features`).

**F3. `CLAUDE.md` and the plan still tell sessions to commit under the old author name.** The Owner's rule since
2026-11-14 is the name `McThayDT` and never the other one, anywhere. `CLAUDE.md`'s "No AI attribution" rule and the
plan's Global Constraints both still give the old `git config` line. It cost this cycle three rewrites of the branch:
the first push was authored "Claude", the second under the old name, and only the third was right. The three commits
that merged are correct (author and committer `McThayDT`, no trailer, no footer). *Fix:* change the `git config` line
in `CLAUDE.md` to `McThayDT`. The plans and audits of both cycles also carry the old line; whether old documents are
edited is part of Q4. The same line is in the `CLAUDE.md` of the other repos, which is the coordinator's to pass on.

## Minor

**M1. The tracker names a commit that is not in the history.** Stage 4's log says "the picture of `cf1084c` shows
it". That commit was rewritten away (F3) and is not an ancestor of `main`; its pictures are still on `ci-screens`
under its own folder. *Fix:* say "the pictures under `cf1084cd…/` on `ci-screens`".

**M2. The plan's 26 steps are all unticked.** The plan says steps use checkboxes for tracking, and Cycle 1's plan was
ticked as it went. *Fix:* tick them.

**M3. The Tab journey does not prove each stop is a different thing.** "The ring shows on everything Tab reaches"
presses Tab once per link and button and checks the ring each time, but would still pass if Tab landed on the same
link twice and skipped another. *Fix:* collect what was focused at each stop and expect as many different elements as
stops.

**M4. A colour written as a word would slip past the colours test.** "Those five are the only colours the stylesheet
names" looks for `#…`, `rgb(` and `hsl(`. `color: white` would pass. *Fix:* also fail on a named colour (the sheet
needs only `transparent` and `currentColor`).

**M5. Three copies of one helper.** `fitsSideways` is in `look.ts`, again in `home.journey.ts`, and written out a
third time inside the fonts-blocked journey. *Fix:* use the one in `look.ts`.

**M6. Things seen and left alone, for the Owner's review (Stage 7), none a defect:**
- The words "Game version:" are set in the number font along with the number (the plan audit's N1). The spec gives
  that font to numbers and measures.
- On a sideways phone the sheet's bottom chalk line is just below the first screen, so on arrival the box looks open
  at the bottom; it closes on the first scroll.
- The fonts arrive after the words do (`font-display: swap`, no preload), so on a slow line the words are first drawn
  in the device's font and then change. The journeys wait for the fonts, so no picture shows this.
- The Play button and the links look the same under a mouse as away from it (the pointer changes, nothing else).
- The real game says "Push the yellow box", inside a page where yellow means "you can touch this". The site must not
  restyle the game, so there is nothing to fix here; the Examples plan already has this with the Owner.
- Windows' high-contrast mode was not checked: the Play button has no border, and that mode can drop backgrounds.

## For the Owner

**Q3. Should the site carry the fonts' and icons' licence notices?** (The plan audit's N4, still open.) The fonts are
under the SIL Open Font License and the icons under MIT, and both ask that their notice travel with copies. The font
files are served as they come from the packages and may already carry the notice inside them; this audit could not
read inside the files to confirm it.
- (a) Add one plain file, `public/licences.txt`, with the three notices. No word on a page changes.
- (b) Have Stage 6 look inside the font files first, and add the file only if a notice is missing.
- (c) Leave it.

**Q4. The old author name is still written in this repo. Does anything get changed?** New commits are right. What
remains: merge commits made on GitHub are signed with the account's display name (the merge of pull request 10
carries the old one), and the old `git config` line is written in the plans and audits of both cycles.
- (a) Change the account's display name, so every future merge commit is right:
  `gh api -X PATCH user -f name=McThayDT`. Old commits and old documents stay as they are.
- (b) (a), and Stage 6 also edits the old line out of the plans and audits.
- (c) Leave it all.

This audit does not pick either answer. F3's one-line fix to `CLAUDE.md` does not wait for Q4.

## Verified, with no finding

- **Principles:** 1 and 2 are served; none is broken. The site still imports nothing from the framework or the game.
- **Privacy:** nothing from the private notes; no product or company is named as a reference in the diff.
- **Dependencies:** exactly the three, exact versions, development-only, named in `CLAUDE.md` with the date of the
  Owner's yes, and ignored by knip for the reason written there.
- **No word of copy changed.** The diff of the two pages is metas and icon placeholders only, and the journeys'
  `WORDS` are untouched.
- **No workflow changed,** and `public/_headers` did not change.
- **Structure:** `icons` is a Node-only feature below `play`; `inline.ts` has no `node:` import; the architecture
  rules were updated to say so.
- **Contrast:** every word on both pages is measured on the drawn page at 4.5 to 1 or more, and the focus ring at 3 to
  1 against what is behind it.
- **JavaScript off, fonts blocked, a 320 px phone, a slow game:** each has its journey, as the plan's Review Focus
  asked.
- **Attribution:** no AI attribution in the three commits, the merge commit or the pull request's body.
