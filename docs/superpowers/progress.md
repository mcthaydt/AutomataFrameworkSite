# Progress

The tracker every stage reads first and updates last. One section per cycle; newest first.

## Cycle 2: the site wears Blueprint

Spec: the "Visual direction" section of
[`2026-11-13-2d-first-layer-design.md`](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/specs/2026-11-13-2d-first-layer-design.md)
in AutomataFramework (Stage 1 was done there, 2026-11-14).

Overall: **15%** (the plan is 10 points, its audit 5, execution 45, the implementation audit 15, fixes 15, the Owner's
review 10)

| Stage | State | Output |
|---|---|---|
| 2. Plan | Done, 100% | [`plans/2026-11-14-blueprint-restyle-site.md`](plans/2026-11-14-blueprint-restyle-site.md) |
| 3. Plan audit | Done, 100% | [`audits/2026-11-14-blueprint-restyle-plan-audit.md`](audits/2026-11-14-blueprint-restyle-plan-audit.md) |
| 4. Execution | Not started (waits for Cycle 1's fixes, pull request 6, on `main`; Q1 is answered; Task 3 waits for the Owner's answer to Q2) | |
| 5. Implementation audit | Not started | |
| 6. Fixes | Not started | |
| 7. Owner review | Not started | |

### Log

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
