# Implementation audit: the Site's M1 thin thread

Written 2026-11-14. Stage 5 (Implementation audit) of cycle 1, for `main` at `97b0940` (pull request 3, merged), read
against the [spec](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/specs/2026-11-13-2d-first-layer-design.md),
the [plan](../plans/2026-11-13-m1-thin-thread-site.md), the [plan audit](2026-11-13-m1-site-plan-audit.md),
`CLAUDE.md` and [`progress.md`](../progress.md) (Stage 4's log and rulings), with the framework's
[implementation audit](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/audits/2026-11-13-m1-framework-implementation-audit.md)
as the format and the bar.

## The answer first

The build is what the plan asked for, and it holds together. Tasks 1 to 7 are done, the plan audit's B1 to B3, S1 to
S6, N3 and N4 were applied where they fall, and `main` is green: `ci` on `97b0940` (run 43531354082) passed with 73
Node tests in 9 files and 40 journeys per engine in Chromium, WebKit and Firefox (one skipped each: `live`, which runs
only against the live address). On pull request 3's last commit (`0f1b4be`), `site` (run 43530950392) picked the real
game at Examples `9fab3c0`, built it, and passed the same 40 journeys per engine against it; `deploy` and `live` were
skipped, as they must be for a pull request. The site imports nothing from the framework or the game, the Cloudflare
token is named in one job only, and every word on the page is the plan's, asserted word for word.

The top-level `404.html` the Examples audit asked for (its F4 and M5) is there. Vite builds it to `dist/404.html`,
and the `hosting` journey proves, in all three engines under `wrangler pages dev`, that a missing page answers 404
with its own words and that a missing file of the game (`/play/content/no-such-file.json`) answers 404, not the home
page.

Nothing here blocks M1's code. There are **seven should-fix findings** for Stage 6 (Fixes), F1 to F7. The two that
matter most:

- **F1:** a hand-started `site` run on any branch would deploy that branch to the live address. Fix it before Task 8.
- **F2:** `ci` and `site` both have jobs named `build` and `journeys / engines (…)`, so the required checks the Owner is
  about to set name two jobs at once.

Six minor items are noted for later (M1 to M6). One question is for the Owner (Q1).

Two things are still open and are **not code findings**:

- **Going live (Task 8) waits on the Owner,** by decision: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, then
  the editor's address for the "Change this game" line. The `site` run on `main` says so in its own words: "Building
  the site at 97b0940 with the game at 9fab3c0. It will not be deployed: the Owner has not added CLOUDFLARE_API_TOKEN
  and CLOUDFLARE_ACCOUNT_ID."
- **`main` was not protected when pull request 3 merged.** `GET /branches/main/protection` answered 404 "Branch not
  protected", so it merged with no required checks. The Owner has since turned protection on. `CLAUDE.md` says every repo's `main` is protected. The coordinator has
  given the Owner the commands; F2 explains why they still work once F2 is fixed.

## Method

- Read every file under `src/`, `scripts/`, `tests/`, the three workflows, the two pages, `public/_headers` and the
  config files in full.
- Read the check runs of pull request 3's last commit and of `main` through the GitHub API, and the `pick`, `check`
  and journey logs for the counts above.
- Read 8 of the 30 real-game pictures on `ci-screens` under `pr-3-real/`: WebKit phone upright and sideways (arrival
  and playing), Chromium desktop (arrival and playing), Firefox tablet upright (playing) and sideways (arrival).
- Worked out colour contrast with the WCAG formula from the colours in `src/styles.css`.
- Checked `git log` on `main` for authors and attribution, and the tree for strategy words.
- No tests were run (project rule).

## Against the spec and the plan

| Item | Where | Verdict |
|---|---|---|
| Spec M1: "Site: one page with the game playing" | Tasks 4 to 7 | Done |
| Spec M1: "deployed" | Task 8 | Waits for the Owner's two settings (by decision); F1 first |
| Spec M1 "done means": the site's game shows the crate where it was moved | Task 8 Step 3 | Not started (needs going live) |
| Only a game commit whose checks all passed is shown | `chooseCommit`, `decide`, `pick` | Done. The four names match the Examples `ci` jobs |
| The site never imports the framework or the game | architecture test, `assemble` | Done |
| Only `deploy` holds the Cloudflare token, and it never runs the game | `site.yml`, `site.test.ts` | Done |
| End-to-end tests in three browsers, stand-in and real game (the Owner's rule) | `home`, `hosting`, `live` journeys | Done (F5 for touch) |
| A real 404, for pages and for the game's files | `404.html`, `hosting` journey | Done |
| The strict Content-Security-Policy (the Owner's decision) | `public/_headers`, `hosting` journey | Done; no `'unsafe-eval'`, and the real game plays under it in all three engines |
| Onboarding (the Owner's rule) | B2's words, the before-any-scroll journey, the arrival pictures | Done for a visitor; not for a developer (F6) |
| Drunk-grandma test | Words pinned and asserted; pictures read | Holds, apart from F3 and F4 |
| Touch targets 44 px, the Play button 56 px | `styles.css`, journeys | Done |
| Tests in GitHub CI only | "How every task is verified" | Done |
| No AI attribution | `git log` | One commit breaks it (F7, Q1) |
| No strategy in a public repo | tree search | Holds |
| Only the approved dependencies | `package.json` | Holds: the Tech Stack line, nothing more |

The interfaces in the plan match the code name for name (`version`, `pick`, `assemble`, `play`, `page`), the layers
go down, no file is near 600 lines, and the page's words in `index.html` are exactly B2's, S5's and B3's.

## Should fix (Stage 6)

**F1. A hand-started `site` run on any branch would deploy that branch to the live address.** `workflow_dispatch`
can be started on any branch. Then `pick` reads `GITHUB_SHA` (that branch's head) as the site, `decide` gives
`deploy: hostReady` (rule 5), and the `deploy` job runs `wrangler pages deploy dist --branch main`, which is
production. So once the Cloudflare settings exist, `gh workflow run site --ref some-branch` puts unreviewed site code
live, past `main`'s protection. The game would still be a checked one, but the page around it would not. Today
nothing deploys because `hostReady` is false, so this must land before Task 8. *Fix:* the `deploy` job's `if` also
requires `github.ref == 'refs/heads/main'`, and `decide` takes the ref and says in words why a run off `main` is
built but not deployed. Add a `decide` case and a `site.test.ts` check that `deploy` names `refs/heads/main`.

**F2. The `ci` and `site` workflows have jobs with the same names.** On pull request 3's last commit, `build`,
`journeys / engines (chromium)`, `journeys / engines (webkit)` and `journeys / engines (firefox)` each appear twice:
once from `ci` (the stand-in game) and once from `site` (the real game). GitHub matches a required check by its name
alone. The checks the Owner is about to require (`check`, `build` and the three `journeys / engines`) are meant to be
`ci`'s, but with two of each, which one counts is not up to us. Also, `site` skips its `build` and journeys when there
is no green game (rule 1), and a skipped job reports success. *Fix:* rename `site`'s jobs so no name is shared, for
example `build-real` and `journeys-real` (their checks become `build-real` and `journeys-real / engines (…)`), and add
a test that reads both workflows and fails on a shared job name. The Owner's protection command stays as it is: it
then names only `ci`'s jobs.

**F3. On a phone held sideways, the playing game gets only about three quarters of the window.** The plan had the
short-window rule make `#game` `100svh` tall. B2 made it fit beside the heading and the lede so the Play button is on
the first screen, which was right for arrival. But the same height stays after the press. The picture
`pr-3-real/webkit/phone-844x390.png` shows the game about 287 px tall, with "How to play" and its first line taking
the bottom 100 px of a 390 px window. A thumb that swipes there scrolls the page instead of playing. *Fix:* inside
the short-window rule, `#game[data-state="playing"]` is `flex: none; height: 100svh`, so the scroll on load fills the
window with the game. Add to the turning-the-phone journey, and to a playing journey at `phone-844x390`: after
Play, the frame's top is at 0 and its height is the window's height, within 1 px.

**F4. In dark mode, the Play button and its focus ring almost disappear against the sky** (drunk-grandma). The sky
behind the button is always `#9fd3f0`, whatever the colour scheme. In dark mode the button turns `#f2f1ec`, a pale
pill on a pale blue at 1.4 to 1. Its words (`#14141b` on `#f2f1ec`) are still easy to read, so the button is usable.
But its focus ring (`outline: 4px solid var(--words)`, 4 px outside the button) is drawn in `#f2f1ec` on the sky at
1.4 to 1. WCAG asks 3 to 1 for a focus indicator, so a keyboard user in dark mode cannot see where they are. In light
mode both are dark on the sky, at about 10 to 1. The journeys take light-mode pictures only, so nobody has seen this.
*Fix:* the button and its ring keep the light-mode colours (`#1b1b24` with white words, a `#1b1b24` ring) in both
schemes, since what is behind them never changes. Add one `colorScheme: 'dark'` arrival picture at
`phone-390x844`, so the Owner sees it.

**F5. The touch journey presses the buttons with a made-up event, so a layer covering them would still pass.** S1
asked for a journey that fails when "a page layout … covered the buttons". The journey checks that each button is
visible and wholly inside the window. Then it holds Right with `dispatchEvent('pointerdown')`, which goes straight to
the element and skips hit testing. A transparent layer over the buttons (on the page or in the game) would not be
caught. *Fix:* `tap()` each button first. Playwright's `tap()` checks that the button is what receives the touch at
that point, and fails if something else would. Keep `dispatchEvent` only for the hold, since a tap cannot be held.

**F6. The README doesn't take a first-time developer from clone to a page on their screen** (the Owner's onboarding
rule). It says what the site is and that tests run in GitHub Actions, but it gives no commands. A newcomer, or an
agent, is left to guess how to see the page, and how to put the real game in it instead of the stand-in. *Fix:* a
"Try it on your machine" section, CLI first:

```
pnpm install
pnpm build                                  # the site with the stand-in game, in dist/
pnpm exec wrangler pages dev dist           # serves it the way Cloudflare does: http://localhost:8788

# With the real game instead of the stand-in:
git clone https://github.com/mcthaydt/AutomataFrameworkExamples ../AutomataFrameworkExamples
(cd ../AutomataFrameworkExamples && pnpm install && pnpm build)
GAME_DIR=../AutomataFrameworkExamples/dist pnpm build
```

The section also says what each command shows, in a sentence each. Add a `tests/docs/readme.test.ts` that checks the
section names `pnpm build`, `wrangler pages dev` and `GAME_DIR`. `CLAUDE.md`'s Structure block gains `tests/docs/`.

**F7. One commit on `main` is authored by "Claude".** `0f1b4be` ("docs: Task 7 done, the tracker at 59 percent") has
the author `Claude <noreply@anthropic.com>`. The other 30 commits are Dawson McThay's. The rule is "No AI attribution
anywhere", and the git identity is to be set before every commit. It can't be fixed without rewriting `main`, which
its rules forbid, so it is a question for the Owner (Q1). *Fix forward, in Stage 6:* nothing in the code. The
coordinator reminds each stage session to run the `git config` line, and the merge session reads the authors of a
pull request's commits before it merges.

## Minor (noted, not fixed now)

**M1. A failed picture push can hold back a deploy.** `deploy` needs `journeys`, and the `screens` job is part of
that called workflow. If the push to `ci-screens` fails, or its concurrency group cancels a waiting job (a third
writer arrives), `journeys` is not a success and `deploy` is skipped. The next scheduled run deploys within 10
minutes, since the live site does not match yet (rule 4 looks at what is live). *For later:* if it is ever seen, run
`screens` as its own job in `site.yml`, outside the call, so `deploy` needs only the engines.

**M2. The wait for the real game to start runs on Playwright's default 5 s.** The `play` helper waits on
`#game[data-state="playing"]` with `expect`, whose timeout is not set, so it is 5 s. The 8 s `actionTimeout` does not
apply to it. The real game, which compiles its physics, starts well within 5 s on the runners today. *For later:* set
`expect: { timeout: … }` on purpose in `playwright.config.ts`, so a slow runner does not read as a broken game.

**M3. `pick` installs packages it does not use.** `scripts/pick-game.ts` needs only Node's own modules. Its
`pnpm install` runs about 144 times a day on the schedule. Dropping the install (and the pnpm setup) from `pick`
would make the schedule's quiet runs shorter. Plan audit N5 asked for no change, so this is only a note.

**M4. The `build` job of `site` keeps the site's token in `site/.git`.** The site is checked out with the default
`persist-credentials`, and the game's `pnpm install` and `pnpm build` run in the same job. The token can only read
this public repo, so nothing can be done with it. `persist-credentials: false` on that checkout too would make the
rule "the game's code never sees a token" hold with no exceptions.

**M5. On an iPad held upright the game is a wide strip.** The tall layout is only for windows narrower than 700 px,
so at 820 by 1180 the game is 788 by 443, under half the screen (`pr-3-real/firefox/tablet-820x1180.png`). It plays,
and its buttons are on screen (the touch journey checks it). The layouts for phone, tablet and desktop are M2's (the
demo game's built-ins), and that's where this belongs.

**M6. The 404 page names the site only in its tab title.** "This page does not exist." and "Go to the home page" are
clear, but nothing on the page says which site this is. That's fine for M1; the M4 site should carry its name on
every page.

## The rulings and deviations, reviewed

Each one in `progress.md` and the execution thread's list was checked against the code and the runs. All stand.

- **`compatibility_date = "2026-09-30"`, not the day the file was written.** Right. `wrangler pages dev` refuses a
  date newer than its `workerd` supports, and CI's first run said so. The site has no Functions, so the date changes
  nothing that is served. The comment in `wrangler.toml` says why. When `wrangler` moves, the date can move with it.
- **`esbuild` and `workerd` in `onlyBuiltDependencies`.** Right. pnpm 10 skips install scripts unless they are
  listed, and `wrangler pages dev` needs both programs. It is an install setting for packages already in the lockfile
  (through `vite` and `wrangler`), not a new dependency, so it needed no Owner's yes.
- **`actionTimeout: 8_000`.** Right: a missing button fails in seconds and names itself. See M2 for the one wait it
  does not cover.
- **The Play button's height rounded in its journey,** because Firefox reports 56 px as 55.99997. Right. The rule is
  56 px, and rounding keeps a 55 px button failing.
- **The journeys import the version helpers by relative path, not `#src/`.** Right. Playwright loads the journeys
  with its own loader, and this repo's `CLAUDE.md` has no `#src/` rule for tests.
- **The strict Content-Security-Policy kept** (the Owner's decision). It holds: the framework fixed zod's eval probe
  (AutomataFramework `9109fa3`), Examples moved its pin (`9fab3c0`), and the `hosting` journey fails on any
  `unsafe-eval` and on any console error.
- **Tasks 2 and 3 pushed their tests together.** Right: one red run read both, and each failed for its own reason.

## Drunk-grandma check, from the pictures

- **Upright phone (390 by 844), arrival:** the name, three short lines saying what this is and that it is still being
  built, and one dark "Play the game" button in the middle of a blue box. She can tell what it is and what to press.
- **Upright phone, playing:** the game fills the window under its own words ("You are the red box. Push the yellow
  box."), with the level in the middle and room below it for the touch buttons. The headless browser shows the
  computer's words, since it has a fine pointer (plan audit N1).
- **Sideways phone (844 by 390):** arrival is good, with the button on the first screen. Playing, the game is too
  short (F3).
- **Tablet and desktop:** clear. After Play the page scrolls so the game is at the top, with the help and "What to do
  next" below it.
- **Dark mode:** not pictured; the button and its ring fade (F4).
- **What to do next:** three plain lines, and the links say where they go. The "Change this game" line waits for the
  editor's address, as the Owner decided.

## For the Owner

**Q1. The commit `0f1b4be` on `main` names "Claude" as its author (F7).** Taking it out means rewriting `main` and
force-pushing, which `main`'s rules forbid and which changes the commit id of the merge.

- **(a) Leave it, and prevent the next one** (recommended). The history stays true and nothing is force-pushed; the
  merge session checks authors before it merges.
- **(b) Rewrite `main` once.** The Owner lifts the protection, the commit's author is rewritten, `main` is
  force-pushed, and the protection goes back on. Every open branch must then be rebased.

**Answered: (a)** (the Owner, 2026-11-14). `0f1b4be` stays as it is. From now on the merge session checks the authors
of a pull request's commits before every merge. `main`'s protection is now on.

## Also in this pull request

`progress.md`: stage 5 is done, and the overall progress is 74%.
