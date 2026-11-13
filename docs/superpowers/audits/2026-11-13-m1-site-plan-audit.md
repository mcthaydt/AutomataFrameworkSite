# Plan audit: the Site's M1 thin-thread plan

Written 2026-11-13. Stage 3 (Plan audit) of cycle 1, for
[`plans/2026-11-13-m1-thin-thread-site.md`](../plans/2026-11-13-m1-thin-thread-site.md), read against the
[spec](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/specs/2026-11-13-2d-first-layer-design.md),
this repo's `CLAUDE.md`, [`progress.md`](../progress.md), the framework at `ec4fddd96d0f1e39365ff807306faf9b42ac3190`
(its `ci.yml`, its input code and its two M1 audits), and the Examples M1 plan
(AutomataFrameworkExamples pull request 1, `docs/superpowers/plans/2026-11-13-m1-thin-thread-examples.md` at
`7950d00`).

## The answer first

The plan is sound in shape and true to the spec's M1 Site line. It keeps the site free of the framework, shows only a
game commit whose checks all passed, keeps the Cloudflare token in one job, has end-to-end journeys in three browsers
against both a stand-in and the real game, and holds deploying back until the Owner adds the secrets, as the Owner
decided. What it relies on from Examples matches the Examples plan line for line (the build, `dist/`, the root
element, the keys and the four check names).

It is **not ready to execute as written**. Three blocking findings need applying first:

- one would fail the `site` workflow's first run;
- one is the Owner's new rule that onboarding is one of the most important parts of the product, which the page's
  pinned words don't meet yet;
- one is a claim on the page that nobody has measured and is likely false.

Then there are six should-fix findings (S1 to S6), one question for the Owner (Q1, now answered) and six notes (N1 to N6).

**How the findings are applied** (the Owner, 2026-11-13, as for the framework): the workflow runs as written, with no
extra fix pass. Stage 4 (Execution) reads this audit with the plan and applies B1 to B3 and S1 to S6 in the tasks they
name. Where the two differ, this audit wins. Q1 is answered (below). Nothing here
reopens a decision the Owner made.

## Method

- The plan's "What this plan relies on" was checked line by line against the Examples plan's "What the other repos
  rely on" and its Tasks 5 and 6.
- The workflow jobs in Tasks 1, 5 and 7 were read against the framework's `ci.yml` at `ec4fddd`, which the plan
  copies (the actions it pins, the `screens` job and its guard).
- The page's input path was checked against the framework's `keyboard.ts` and `touch.ts`: keys are read on the
  frame's `window`, and the touch buttons show at once on a coarse pointer or on the first touch.
- Every word the page shows was read as a first-time visitor would read it, for the drunk-grandma test and the
  Owner's onboarding rule: does a newcomer know what this is, what to press, and what to do after?
- No tests were run (project rule). Nothing here is measured.

## Blocking (fix before execution)

**B1. The `site` workflow's `build` job can't set up pnpm or Node in two sub-folders.** Task 7 checks out this repo
into `site/` and the game into `game/`. `pnpm/action-setup` (pinned without a `version`) reads `packageManager` from
`package.json` at the workspace root, and there is none there, so the job stops before any install. `setup-node`'s
`cache: pnpm` looks for `pnpm-lock.yaml` at the root too.

*Fix:* in that job, give `pnpm/action-setup` `package_json_file: site/package.json`, and give `setup-node`
`cache-dependency-path` both `site/pnpm-lock.yaml` and `game/pnpm-lock.yaml`. If the game's `packageManager` ever
differs from the site's, stop and report. Add a check to `tests/workflows/site.test.ts`: the `build` job names
`site/package.json` for pnpm.

**B2. Onboarding: a newcomer is told what to press, but not clearly what this is or what to do next.** The Owner's
rule (2026-11-13) is that onboarding is one of the most important parts of any product. Read as a first visit, the
page does the middle part well: one button, plain help, a loading line, and a page for a JavaScript that is off. Three
things are missing.

1. **What this is.** The lede says "A toolkit for making 2D games. It is still being built. This is its first small
   game." "Toolkit" doesn't tell anyone what they'd use it for, and "This" doesn't point at anything.
2. **What to do after playing.** The page ends at two footer links named "The game's files" and "The toolkit". Both
   land a newcomer on a GitHub code page with no warning. There's no next step in words.
3. **The first press is not proven on arrival.** No journey checks that the Play button is on screen before any
   scroll. The tightest size is the phone on its side (844 by 390): the heading and lede sit above a `#game` that is
   `100svh` tall, so the button's centre is near the bottom of the first screen. A slightly longer lede pushes it off.

*Fix (Task 5), words pinned as the plan pins every word:*

| Where | Words |
|---|---|
| `p.lede` | AutomataFramework is a toolkit for making 2D games that play in a web browser. It is still being built. Below is the first game made with it. |
| `h2` (new, after "What you are playing") | What to do next |
| next, line 1 | Play the game above. It takes a minute. |
| next, line 2 | See how it is made: the game's files are on GitHub. (the words "the game's files are on GitHub" link to `https://github.com/mcthaydt/AutomataFrameworkExamples`) |
| next, line 3 | Make your own game: not yet. The toolkit is still being built, and this page will say when it is ready. |
| footer links | "The game on GitHub" and "The toolkit on GitHub" (same targets), so the link names say where they go. |

A fourth line goes under "What to do next", by the Owner's answer to Q1 (see "The Owner's answers").

Add to `home.journey.ts`, at every size: "before any scroll, the heading, the lede and the Play button are all inside
the window" (`toBeInViewport()` for each, at `scrollY === 0`), and "the What to do next section has its three lines".
Make the short-window rule (under 500 px tall) size `#game` so the button stays in the first screen, for example
`height: calc(100svh - <the header's height>)` with a smaller heading. The test decides; the CSS is the executor's.
Task 5 Step 4's picture review also reads each size *before* the press. Add a `page.screenshot` named
`<size>-arrival.png` beside the existing one, so the implementation audit sees what a newcomer sees first.

**B3. "Within about 15 minutes" is a claim nobody has measured, and it's probably false.** The site's run starts on a
10-minute schedule, and GitHub often starts scheduled runs late, by tens of minutes when its runners are busy. Then
come:

- `pick`;
- the game's install, which builds the framework from git;
- both builds;
- the journeys in three browsers, each with `playwright install --with-deps`;
- the upload and `live`.

The page's rule is "a claim on the page must be true on `main` when it is shown". The project's rule is that facts
come from what was measured.

*Fix (Task 5's words, then Task 8 Step 3):* until it is measured, the line reads: "You are playing the game exactly as
it is saved on GitHub. When someone changes it there and the change passes its checks, this page shows the new game
a little while later." Task 8 Step 3 already reports the time the game's checks finished and the time `live` passed.
Once that is measured on a few runs, a number may go on the page, but only with the Owner seeing it. That would be a
separate change.

## Should fix

**S1. No journey touches the game.** The help says "On a phone or tablet: use the buttons on the screen." But every
journey drives the keyboard, and the stand-in game has no buttons. "What this plan relies on" line 4 names the touch
buttons, yet the stand-in follows only its keys. A frame that swallowed touches, or a page layout that covered the
buttons, would pass.

*Fix:*
- **Task 4:** the stand-in shows one button named "Right" in the bottom-left corner, at least 48 by 48. It shows at
  once on a coarse pointer, or after the first `pointerdown` with `pointerType` `touch`, as the framework's
  `touch.ts` does. Holding it moves the box.
- **Task 5:** add a journey at `phone-390x844` and `tablet-820x1180` with `hasTouch: true`. Press Play, tap the
  frame, and the frame's button named "Right" is visible and wholly inside the window. Holding it changes the canvas,
  as the keys test does.
- **Task 7:** against the real game, the same journey also finds "Left" and "Jump".

**S2. The `screens` job's guard skips the scheduled and hand-started runs.** Task 5 copies the framework's `screens`
job "as it is" into `journeys.yml`. Its `if` is `github.event_name == 'push' ||` a same-repo pull request. In a called
workflow, `github` is the caller's, so for `schedule`, `workflow_dispatch` and `repository_dispatch` the job never runs,
and `latest: live` gets no pictures. Also, `COMMIT` is the same site commit for a pull request's `ci` run (stand-in)
and its `site` run (real game). The second run overwrites the first one's pictures in `<commit>/`.

*Fix:* the guard allows any event but a pull request from a fork, and `COMMIT` gets the `latest` input's suffix
(`<commit>-real` when `latest` ends in `-real` or is `live`). Add both to `tests/workflows/ci.test.ts`.

**S3. "Host ready" checks the token but not the account id.** `HOST_READY` is only `secrets.CLOUDFLARE_API_TOKEN !=
''`. If the Owner adds the token first, every push and schedule tries to deploy and fails in `wrangler`. *Fix:*
`HOST_READY` is true only when both the token and `vars.CLOUDFLARE_ACCOUNT_ID` are set. Rule 3 and 5's sentence becomes
"the Owner has not added CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID". The `site.test.ts` token-count test is
unchanged, because the variable is not a secret.

**S4. The plan's line on where the editors live is out of date.** "What this plan covers" says where M1's editor is
hosted "is the Editors plan's question, with the Owner", and `progress.md` says the same. The Owner has decided that
the browser editors get their own Cloudflare Pages project, so the Site doesn't host them in M1. *Fix:* say so in the
plan and the tracker. The "For later plans" note about frames on this origin still holds for M4's gallery. It no
longer holds for the editors' sign-in, which won't be on this origin.

**S5. The site's help and the game's own help use different words for the same thing.** The game says "Hold the left
or right arrow key to move. Press Space to jump." and "Hold Left or Right to move. Tap Jump to jump." (Examples'
`WORDS`). The site says "press the arrow keys to move", which tells a newcomer to tap, while the game says to hold.
*Fix (Task 5's words):*

- help, line 1: "On a computer: hold the left or right arrow key to move. Press Space to jump."
- help, line 2: "On a phone or tablet: hold the Left or Right button to move. Tap Jump to jump."

The site still imports nothing from the game; the words are only copied. Line 3 becomes "Keys not working? Click the
game once, then try again."

**S6. `live` runs every journey against the live address, with no order.** `pnpm test:journeys --project chromium`
runs `home` and `hosting` as well as `live`. That's useful, but if Cloudflare is still serving the old build, the home
journeys pass or fail against the wrong build before `live` has waited for the new one. *Fix:* run `live.journey.ts`
first, in its own step (`pnpm test:journeys --project chromium tests/journeys/live.journey.ts`), and then the rest in a
second step.

## For the Owner

**Q1. Should the M1 home page send a newcomer on to the browser editor?** M1's "done means" is the thread from the
editor to the site: move the crate in the editor, and the site's game shows it. A visitor who has just played the game
would naturally try changing it next. The editor will have its own Cloudflare Pages address (the Owner's decision),
which the Editors plan names.

- **(a) Yes, once the editor is live.** One more line under "What to do next": "Change this game: open it in the
  editor. You will need a GitHub account." Its link is the editor's address. `live` checks that the link answers 200.
  It lands in Task 8, after the Editors' address exists, so no claim shows before it is true. *Recommended*, because
  it is the onboarding's natural next step and it shows M1's whole thread.
- **(b) No, wait for M4.** The editors join the site with the rest of M4 ("the free editors"). The page stays as B2
  has it.

**Answered: (a)** (the Owner, 2026-11-13; see "The Owner's answers" below).

## Notes

**N1. On a phone, the game's own words come before its buttons only in a headless browser.** The framework shows the
touch buttons at once on a coarse pointer, and a frame sees the same pointer as its page. So on a real phone or iPad,
"Hold Left or Right" appears with the buttons already there. The Examples journeys, run with `hasTouch` but a fine
pointer, see the buttons only after a tap. That is right, and nothing changes here. It is noted so nobody "fixes" the
Site's words for a case real devices don't have.

**N2. "Game version: 1a2b3c4" means nothing to a newcomer.** It is true and harmless, and Task 8 needs it. A line in
plain words (when the game was last changed) needs a date in `version.json`, which no one has asked for. Leave it for
M4's site.

**N3. `wrangler pages project create … || echo "The project already exists."` hides every failure,** including a
wrong token. The next step fails anyway, so nothing ships wrong. The message can mislead whoever reads the log, so
"Creating the project failed or it already exists; the deploy step says which." is truer.

**N4. The site can step back to an older game.** If the newest green commit is ever older than the live one (a
re-run that failed on the newer commit), `decide` deploys the older one. That keeps the rule "only a checked commit is
shown", so it is right. One line in `decide`'s doc comment says so.

**N5. The schedule runs about 144 times a day,** each with a checkout and an install in `pick`. The repo is public, so
the minutes are free, but the Actions list will be mostly these runs. Rule 4 keeps them short. No change is asked for.

**N6. The site's desktop size is 1440 by 900 and the game's is 1280 by 720.** Both are fine, and each repo tests its
own page. Noted so nobody aligns them by mistake.

## Against the spec and the Owner's decisions

| Item | Plan | Verdict |
|---|---|---|
| Spec M1: "Site: one page with the game playing, deployed" | Tasks 5 to 8 | Covered (after B1) |
| Spec M1 "done means": "the site's game shows the crate where it was moved" | Task 8 Step 3 | Covered, by version. The site can't see the crate, and doesn't need to: Examples' `files` journey proves the game plays the file it is given |
| Hosted on Cloudflare Pages | Tasks 6 to 8, `wrangler pages dev` in the journeys | Covered |
| Every plan has end-to-end tests (the Owner) | `home`, `hosting` and `live` journeys, three browsers, stand-in and real game | Covered (after S1, for touch) |
| Tests in GitHub CI only | "How every task is verified" | Covered |
| Build and test everything; deploy only after M1 is complete (the Owner) | Tasks 1 to 7 need no Cloudflare; Task 8 waits for the secrets | Covered (after S3) |
| The name is `automataframework.pages.dev`; no old site (the Owner) | "Before starting"; Task 8 Step 2 stops if Cloudflare gives another address | Covered |
| `wrangler`, `@playwright/test`, `@types/node` approved (the Owner) | Tech Stack, `CLAUDE.md` | Covered; no other dependency |
| The editors get their own Pages project (the Owner) | "What this plan covers" | Out of date (S4) |
| The site reads the game at its newest green `main` commit (the Owner) | Task 3 (`chooseCommit`, `REQUIRED_CHECKS`) | Covered; the names match Examples |
| Drunk-grandma test | Words pinned and asserted; pictures read in Tasks 5 and 7 | Covered (after B2, B3, S5) |
| Onboarding (the Owner, 2026-11-13) | One button, help, loading line, a page for JavaScript that's off | Not enough (B2; Q1) |
| No strategy in public repos | "Nothing private on the page" | Holds. The B2 words come from the public vision in `CLAUDE.md` |
| No AI attribution | Global Constraints | Holds |

Principles: 1 (what the site shows comes from the game's repo, nothing set by hand), 3 (2D only), 4 (its own repo)
and 6 (the stack, with Svelte and Effect left out for a written reason) are served as the plan says. Touch targets
(44 px, the Play button 56 px) are above the spec's 48 px for a primary action. The plan copies the framework's
architecture test with two rules of its own, and those rules fit `CLAUDE.md`'s structure.

## The Owner's answers (2026-11-13)

- **Q1: yes.** The home page sends a newcomer on to the editor. The Owner also set how the editor treats a visitor:
  the primary way to make a game is through agents working on the code, and what a person edits in the editor is the
  authorable content, the JSON the agents produce. Anyone can use the editor freely without signing in, and can
  export their work. Signing in with GitHub is needed only to save and to work together. So the link works for every
  visitor, and the line says nothing about needing an account.

  *Apply (Task 5's words, landing in Task 8):* the fourth line under "What to do next" is "Change this game: open it
  in the editor. You can try changes without signing in. To save them, sign in with GitHub." The words "open it in the
  editor" link to the editor's own Cloudflare Pages address, which the Editors plan names. The line and its link land
  only once that address is live and the editor behaves as above, so no claim shows before it is true. Until then the
  line is not on the page. A journey checks the line word for word. `live` checks that the link answers 200 and that
  the page it opens loads with no sign-in. If the Editors plan has the editor ask for sign-in before anything can be
  edited, stop and report it to the coordinator, because the line would then be false.

## Also in this pull request

`progress.md`: stage 3 is done and the overall progress is 15%. This pull request is built on the plan's branch (pull
request 1), so it merges after that one.
