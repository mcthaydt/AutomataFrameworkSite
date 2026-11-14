# Plan audit: the site wears Blueprint

Written 2026-11-14. Stage 3 (Plan audit) of cycle 2, for
[`plans/2026-11-14-blueprint-restyle-site.md`](../plans/2026-11-14-blueprint-restyle-site.md) (merged in pull request
7, `main` at `2f342ee`), read against the spec's "Visual direction", "The site", "CI and testing" and "Constraints"
([`2026-11-13-2d-first-layer-design.md`](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/specs/2026-11-13-2d-first-layer-design.md)
on AutomataFramework's `main`), this repo's `CLAUDE.md`, [`progress.md`](../progress.md), and the code the plan
changes as it will be once pull request 6 (Stage 6 of cycle 1, head `3a8efed`) is on `main`.

## The answer first

The plan is sound and true to the spec. It keeps the strict header byte for byte and pins it, never styles the game's
frame or reaches inside it, changes no word of copy and no workflow, and proves the look with journeys in Chromium,
WebKit and Firefox at phone and tablet size, upright and sideways, and at desktop size, against both the stand-in and
the real game. Its "Measured while planning" claims hold where they could be checked: the three packages, their
licences, their file names and export maps, the six icons and their one-line shape, and every contrast figure.

It is **ready to execute once Q1 is answered**, with seven findings applied in the tasks they name. None is blocking.
Two are should-fix (S1, S2): one is the plan saying two different things about the line round the playing game,
the other is Task 4 comparing the real game's pictures with the stand-in game's. Five are smaller (S3 to S7). There
are three notes and no new Owner question.

**How the findings are applied:** Stage 4 (Execution) reads this audit with the plan and applies S1 to S7 in the tasks
they name. Where the two differ, this audit wins. Q1 (the font packages) stays with the Owner, and Task 1 still does
not start until the coordinator passes on the answer.

## Method

- Every rule in the plan's Global Constraints and every value in its stylesheet was read against the spec's "Visual
  direction" table and bullets.
- The plan's journeys were read against the code they drive on pull request 6's head: `index.html`, `404.html`,
  `src/styles.css`, `src/features/play/play.ts`, `src/features/page/page.ts`, `tests/journeys/*.ts`,
  `playwright.config.ts`, and the three workflows (`ci.yml`, `journeys.yml`, `site.yml`).
- `public/_headers` was compared with the policy string Task 1 Step 3 pins: they are the same, character for
  character.
- The three packages were fetched with `npm pack` (nothing installed in the repo) and read: `latin-400.css` and
  `latin-600.css` exist, the files are under `./files/` as `.woff2` and `.woff`, the licences are OFL-1.1 and MIT,
  `@phosphor-icons/core` exports `./assets/regular/*.svg`, and `play`, `keyboard`, `device-mobile`, `cursor-click`,
  `github-logo` and `house` each start with exactly the `<svg …>` tag the plan's tests expect.
- The contrast figures were recomputed with the WCAG formula: all seven match the plan to two places.
- Two risks were looked up in the installed tools rather than guessed: Vitest 5.0.3 builds `import.meta` with Vite's
  `createNodeImportMeta`, which supports `import.meta.resolve` through Node's module hooks, so `read.test.ts` can run
  `readIcon`; and Playwright 1.63's accessible-name code does not apply `text-transform`, so the exact-name locators
  (`'The game on GitHub'`, `exact: true`) still match once the footer's links are in capitals.
- The draft pictures in the project files (`screens/site-blueprint-draft/`) were looked at against the plan's
  stylesheet.
- No test was run (project rule).

## Should fix

### S1. The line round the game: does it stay once the game plays? (Task 3)

The plan says two different things:

- Global Constraints: "No filter, tint, opacity, blend, rounded corner or border is put on the frame **or on anything
  around it once the game plays**."
- "What this replaces": "**Until the game plays**, its place is a hatch-coloured sheet with a chalk line round it."
- But Task 3's stylesheet puts `outline: 1px solid var(--chalk)` on `#game` in every state, so the chalk line stays
  round the playing game. The journey "the game's own picture is left alone" checks `border-top-width` and so does
  not notice either way.

The outline is drawn outside the box and never over the game, so this is not restyling the art, but the plan's own
rule and its stylesheet disagree, and a reviewer cannot tell which is meant. **Apply:** follow the plan's own rule. In
Task 3 Step 5 add

```css
/* Once the game plays, nothing of the site's is drawn round it: the game is shown exactly as players see it. */
#game[data-state="playing"] {
  outline: none;
}
```

and in "the game's own picture is left alone" also expect `outline-style` of `#game` to be `none` once it plays. The
per-size "blue paper" journey's check of `#game`'s chalk `outline-color` stays, because it runs before Play.

### S2. Task 4 compares the real game's pictures with the stand-in game's (Task 4)

Task 4 Step 2, question 7, compares "every playing picture of the real game" with "the pictures from before this
work (`main/` on `ci-screens`)". `main/` is written by `ci` (`latest: main` on a push), which runs the **stand-in**
game. The real game's latest pictures are in `live/`, written by `site`'s `journeys-real` on every push to `main` and
every scheduled run (`latest: live` off a pull request). Comparing `pr-<n>-real/` with `main/` would compare two
different games and either fail for no reason or teach the reader to ignore the question. **Apply:** question 7
compares `pr-<n>-real/<engine>/<size>.png` with `live/<engine>/<size>.png`, and `pr-<n>/<engine>/<size>.png` with
`main/<engine>/<size>.png`.

## Smaller

### S3. The help icons are pencil, but the plan says icons take the colour of their words (Task 3)

The Architecture says icons "take the colour of the words beside them", and Task 4's question 5 asks whether every
icon is "the colour of those words". Task 3's stylesheet then adds `.help .icon { color: var(--pencil); }`, so the
three "How to play" icons are pencil beside chalk words (the draft picture `whole-390x844.png` shows it). The spec's
table gives icons to chalk ("text, borders, icons"); pencil is for "quieter text and hints". **Apply:** drop the
`.help .icon` colour rule, so the help icons are chalk like their words. If execution finds they read too loud, it
reports that with the pictures rather than keeping the rule.

### S4. No journey proves the home page's links are still 44 px to touch (Task 2 or 3)

The Global Constraints keep targets at 44 px or more, and Task 2 puts icons inside the footer's links. The only touch
sizes the plan's journeys measure are the Play button (56 px, already in `home.journey.ts`) and the 404 page's home
link. Nothing measures the footer's links, the link in "What to do next" or the version line's link. **Apply:** in
`look.journey.ts`'s per-size block, add one test: after `arrive`, every visible `a[href]` and visible `button` has a
bounding box at least 44 by 44 (rounded, as `home.journey.ts` rounds for Firefox).

### S5. `arrive` can return before the number font is asked for (Task 1)

`arrive` waits for `document.fonts.ready` once. But the version line, the only place JetBrains Mono is used, stays
hidden until `page.ts` has fetched `/version.json`. If that fetch finishes after the page's other fonts, the mono face
starts loading after `ready` has already settled, and a picture or a measure taken straight after `arrive` can catch
the device's font. The font journey survives this (it uses `expect.poll`), but Task 4's question 4 ("the version line
in the number font") reads pictures taken this way. **Apply:** `arrive` first waits until the version line has
settled (the page has no version line, as the 404 page has none; or the line is visible; or the `/version.json`
response has arrived and the line stayed hidden), then waits for `document.fonts.ready`. Don't use `document.fonts.load` for this: loading a
face by hand would make `loadedFonts` prove nothing.

### S6. The new pictures' folder is not named (Task 3)

Task 3 names the pictures `<size>-not-found.png` and `phone-390x844-loading.png` but not where they go. `journeys.yml`
uploads only `tests/journeys/__screenshots__/**`, and Task 4 Step 1 stops on a missing picture. **Apply:** every
picture the plan adds is written under `tests/journeys/__screenshots__/`, as `home.journey.ts` does.

### S7. Onboarding is not named (Task 4)

`CLAUDE.md` says onboarding comes first: a first-time player must learn what to do, how to do it, and that they did it.
The plan keeps the words that teach the first two, and Task 4's questions 1 and 2 check the arrival picture, but
nothing asks about the third, now that the button, the loading line and the empty sheet all look new. **Apply:** add
to Task 4's list: "11. After Play is pressed, do the loading note and then the game make it plain that the press
worked (`phone-390x844-loading.png`, then `<size>.png`)?" and say in the plan's Goal paragraph that onboarding is kept
by the unchanged words and checked by questions 1, 2 and 11.

## Notes

- **N1. The colour in the two pages' heads.** The Architecture says `src/styles.css` "is the only place a colour or a
  font is named", and Task 3 Step 6 repeats it in `CLAUDE.md`, but Task 3 also writes `#0A1F3C` into
  `<meta name="theme-color">` in both pages (the browser's own bar cannot read CSS). Say so: "the only stylesheet;
  the pages' `theme-color` repeats paper, and a journey checks it" in both places.
- **N2. The empty favicon.** The Global Constraints say nothing comes "from a `data:` address", while both pages keep
  `<link rel="icon" href="data:," />` and the font journey allows it by name. It is empty and harmless; the
  constraint should say "except the empty favicon" so nobody removes it to obey the sentence.
- **N3. Pull request 6.** At this audit it was open with every `ci` check green and `build-real` still running. Git
  merges it onto today's `main` with no conflict (both change `progress.md`, in different sections). Task 1 Step 1
  checks it is in before anything starts.

## Against the spec and the coordinator's checklist

| Asked | Where the plan meets it | Verdict |
|---|---|---|
| The five colours, exactly | Global Constraints; `tokens.test.ts` reads each and allows no other | Met |
| Marker only for what can be touched | "yellow means you can touch it, and only that", every size and engine | Met |
| Plex Sans Condensed in capitals for labels, JetBrains Mono tabular for measures | Task 1 and "labels are in capitals" | Met (S5 for the pictures) |
| Square corners 2 to 3 px, 1 px chalk lines, shadow only on floating panels | `--corner: 2px`, no `box-shadow`, tested | Met |
| Dark by default | Dark only, the light setting ignored and pictured | Met (light theme later, as the spec says) |
| Icons Phosphor regular, each with its words | Task 2's build step and journey | Met (S3 for their colour) |
| The game's art never restyled | Nothing styles the iframe; journey checks filter, opacity, blend, corner, border, box | Met (S1 for the line round it) |
| The strict header unchanged | `_headers` not edited; the whole policy pinned in `hosting.journey.ts` | Met; checked character for character |
| No word of copy changed | Global Constraints; `WORDS` unchanged | Met |
| Touch 44 px, primary 48 px | Play button 56 px tested; 404 link tested | Partly (S4) |
| Contrast | Measured on the real page, every size and engine, words 4.5, ring 3 | Met |
| The drunk-grandma test | Task 4's written list, every picture in three engines | Met |
| Onboarding | Words unchanged | Partly (S7) |
| E2E in three browsers, phone and tablet, both ways | Every look journey in `SIZES`, in all three engines, with the stand-in and the real game | Met |
| Fonts as packages, with the Owner's yes | Q1, stopped on until answered | Waiting for the Owner |
| Nothing private copied | No reference names, no reasoning; the plan points at the private notes | Met |

## Also in this pull request

`progress.md`: Cycle 2's Stage 3 is done, and the overall percentage moves from 10% to 15%.
