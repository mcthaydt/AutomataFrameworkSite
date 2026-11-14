# Plan audit: the site wears Blueprint

Written 2026-11-14. Stage 3 (Plan audit) of Cycle 2, for
[`plans/2026-11-14-blueprint-restyle-site.md`](../plans/2026-11-14-blueprint-restyle-site.md) as merged at `2f342ee`,
read against the "Visual direction" section of the
[spec](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/specs/2026-11-13-2d-first-layer-design.md)
(and its "The site", "CI and testing" and "Constraints"), this repo's `CLAUDE.md`, [`progress.md`](../progress.md),
`main` at `2f342ee`, pull request 6's branch (the plan is written to stand on it), the three packages as published,
and the draft pictures the plan was drawn from.

## The answer first

The plan is sound and true to the spec. It is **ready to execute** once pull request 6 is on `main`. Nothing in it is
blocking.

Six should-fix findings (S1 to S6) are small and are **already written into the plan** by this audit's pull request,
so execution follows the plan as it now reads. Seven notes (N1 to N7) are for execution to read; none changes a step.
There is no new question for the Owner, and Q1 (which font packages) is answered.

Nothing here reopens a decision the Owner made.

## What was asked, and the answer to each

| Check | Answer |
|---|---|
| The Blueprint skin | Yes. The five colours are the spec's, value for value, and a Node test holds the stylesheet to them and to no others. 1 px chalk lines, 2 px corners, no shadows (nothing on the site floats). Marker yellow is only on what can be pressed, and a journey proves it both ways. One slip, S1. |
| Dark by default | Yes. Dark is the only theme, the light colours leave, and a journey loads the page on a device set to light and expects the same page. A light theme is left for later, as the spec says. |
| Phosphor regular icons | Yes. `@phosphor-icons/core` 2.1.1, the regular folder only, written into the HTML when the site is built. All six names exist in the package in the shape the plan expects. Every icon has its words beside it. Two gaps, S1 and S2. |
| The two fonts, from `@fontsource` 5.3.0 | Yes. Both packages exist at 5.3.0, and the three files the plan imports (`latin-400.css` and `latin-600.css` of the first, `latin-400.css` of the second) are there, each pointing at a `.woff2` and a `.woff` beside it. Q1 is answered (S6). |
| The strict header | Yes. `public/_headers` is not edited. `default-src 'self'` covers fonts, the fonts are the site's own files, `assetsInlineLimit: 0` keeps any from becoming a `data:` address, and the icons are plain markup, which the header does not govern. The line the plan pins in a journey is the line in `public/_headers`, character for character. |
| The drunk-grandma test | Yes. No word changes, and the journeys still hold every word. In the draft pictures the yellow Play button is the first thing the eye lands on at every size. Task 4 reads every picture against a written list of ten questions. One wording gap, S3. |
| Onboarding | Yes, unchanged. The page still says what it is, what to press and what to do next, and the README gains how to add an icon. A first-time developer's path (pull request 6's README section and its test) is not touched. |
| "Try it now" opens the demo only | Nothing to check on the site: "Try it now" is the editors' button, and this plan adds no link to the editors and changes no link. See N6. |
| End-to-end tests in CI | Yes. Journeys in Chromium, WebKit and Firefox at five sizes, against the stand-in game in `ci` and the real game in `site`, with the new files picked up by the existing settings (`*.journey.ts`, `tests/**/*.test.ts`) and no workflow change. Two timing gaps, S4. |

## Method

- The spec's "Visual direction" was read line by line against the plan's Global Constraints, its stylesheet and its
  journeys.
- The three packages were installed in a throwaway folder and read: versions, licence files, the CSS files the plan
  imports, the package's export map, and the six icon files.
- `import.meta.resolve` was tried in Node for an icon that exists and one that does not.
- The header line in the plan was compared with `public/_headers` by program.
- `vitest.config.ts`, `playwright.config.ts`, `knip.json`, `journeys.yml` and pull request 6's `home.journey.ts`,
  `styles.css` and README test were read, to see that the plan's new files are picked up and that nothing it removes
  is leaned on elsewhere.
- The plan's counts were recounted on the real pages: 6 icons on the home page and 1 on the 404 page, 17 readable
  things on the home page with the stand-in game (the plan asks for at least 16), 23 pictures an engine, and the
  progress points (22, 44, 89, 100).
- The eight draft pictures were looked at.
- No test was run, here or in CI: this stage changes documents only.

## Should fix (all applied to the plan)

**S1. The "How to play" icons were pencil; the spec gives icons to chalk.** The spec's table: chalk is for "text,
borders, icons", pencil for "quieter text and hints". The plan's sheet had `.help .icon { color: var(--pencil) }`,
which also disagreed with the plan itself: Task 2's test says an icon is "coloured like the words beside it", and
Task 4's question 5 asks whether every icon is "the colour of those words". *Applied:* the rule is gone, a Global
Constraint says icons are chalk or the colour of their words, the icons journey checks it on every icon, and
question 5 names it.

**S2. A mistyped icon name would not reach the plan's own error.** `import.meta.resolve` gives back an address for
`no-such-icon.svg` and does not throw (tried, Node 22), because the package exports the folder as a pattern. So
`readIcon` finds out only when it reads the file, and unless it catches that, the build ends with Node's "no such
file" in place of the sentence that names the icon, the page and where the names are (Review Focus 5). Also, the
plan tried `import.meta.resolve` in Node and in the Vite config but never under Vitest, where `read.test.ts` runs.
*Applied:* Task 2, Step 2 says `readIcon` reads and answers `undefined` when the read fails, and names the fallback
(`createRequire(...).resolve`) if Vitest lacks the call, to be reported as a deviation.

**S3. The 404 page's heading is a sentence, and the plan said sentences are never in capitals.** "This page does not
exist." is an `h1`, so the sheet sets it in capitals, as the draft picture shows. It reads well, like a sign, but the
constraint said otherwise and no journey looked. *Applied:* the constraint now says every heading is a label, this
one included, and the 404 journey checks the heading is in capitals and the sentence and the link are not.

**S4. Two journeys could run before the version line arrives.** The line is filled in after the page's script
fetches `version.json`, and only then does the browser ask for the number font. `arrive` waits for fonts, but it can
return before either. So the whole-page picture could show no version line, or show it in the device's font, and the
Tab journey could count the real game's version link after it had started walking. *Applied:* a `settle` helper
(wait for the version line, then for fonts again), used by the whole-page picture, the Tab journey and the contrast
journey.

**S5. Two of the plan's own rules contradicted what it builds.** (a) "No … border is put on the frame or on anything
around it once the game plays", yet the chalk line round the game's place stays while the game plays (rightly: it is
an outline, outside the box). (b) "The only place a colour is named" is the stylesheet, yet both pages get a
`theme-color` meta with the paper colour, and nothing checked the 404 page's two metas. *Applied:* both sentences now
say what is true; the Node test holds each page's `theme-color` to paper and allows no other colour in the HTML; the
404 journey checks both metas.

**S6. Q1 is answered and the plan still stopped for it.** The coordinator passed on the Owner's yes to
`@fontsource/ibm-plex-sans-condensed` 5.3.0 and `@fontsource/jetbrains-mono` 5.3.0 (2026-11-14). *Applied:* the plan
records the answer and Task 1 no longer stops to ask.

## Notes (nothing to change)

**N1. The spec names a font for labels and for numbers, and none for sentences.** The plan sets sentences in IBM
Plex Sans Condensed too (regular weight, sentence case, 18 px), and sets the whole version line, its words included,
in JetBrains Mono. Both are fair readings and keep the site to two fonts. The Owner sees them at review; the draft
pictures read easily.

**N2. The faint grid on the paper is the plan's own touch.** The spec does not ask for it and does not forbid it. Its
lines are hatch on paper (1.15 to 1), so words over it measure as words on paper. Hatch's job in the spec is "raised
or grouped areas"; using it for the grid lines names no sixth colour.

**N3. On a phone, the link in "See how it is made:" drops to a line of its own.** It is `display: inline-block` so
that it is 44 px tall, and it does not fit beside the words before it. This is on `main` today; in yellow it is
easier to see. It is not this plan's to fix. Task 4's question 10 now asks execution to report it, and the fix (keep
the link in its line and reach 44 px with padding) can go to the implementation audit.

**N4. Licence notices.** The fonts are under the SIL Open Font License and the icons under MIT; all three packages
carry their licence files, and the site serves the font files as they come. If the Owner wants the notices on the
site itself, a `licences.txt` in `public/` would do it. Not asked for by the spec.

**N5. Comparing two boxes exactly.** The "game's own picture is left alone" journey compared the frame's box with its
place's box for exact equality. Cycle 1 met an engine reporting 56 as 55.99997. *Applied in passing:* the plan now
compares rounded edges.

**N6. The link to the editors.** Cycle 1's Task 8 (going live) adds the home page's "Change this game" line when the
editors' address exists. It will be a link, so it will be yellow and underlined by this sheet with no extra rule, and
the journeys here count links as they find them. Whichever of the two lands second checks the other's journeys.
Where that link leads, and that "Try it now" opens only the demo game, is the Editors' to prove.

**N7. A 320 px phone without the fonts.** The fonts-blocked journey runs at 390 px wide and sideways. At 320 px in a
wide device font the heading may break inside the word (the sheet allows it, so nothing runs off the side). That is
a rare pair of troubles and an acceptable result.

## Verified, with no finding

- Principles: the plan names 1 and 2 and breaks none. No framework dependency, no 3D.
- Privacy: nothing from the private notes is in the plan; no product or company is named as a reference.
- Dependencies: exactly three, exact versions, development only; knip's ignore list is explained in `CLAUDE.md`.
- Touch: the Play button 56 px, links 44 px, words 18 px or more, each with a journey.
- Contrast: the seven pairs the plan lists were recomputed and agree; chalk words never go on marker.
- The focus ring: chalk, 3 px, with a gap, measured against what is behind it at every Tab stop. Pull request 6's
  journey already shows a focused button matching `:focus-visible` in all three engines.
- JavaScript off: the look and the icons are there, because the icons are in the HTML.
- Structure: `icons` is a Node-only feature below `play`; `inline.ts` has no `node:` import; `tests/styles/` is
  inside what Vitest runs.
- Tests only in CI; no workflow file changes; no AI attribution; Conventional Commits.
