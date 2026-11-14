# M1 Thin Thread: the Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task, in
> one session, with no subagents (project rule). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One page at `automataframework.pages.dev` where a person presses "Play the game" and plays the demo game,
always the newest version of it that passed its checks in the Examples repo.

**Architecture:** A static site built with Vite, with no dependency on the framework. The game is built by its own
repo (`pnpm build` in AutomataFrameworkExamples), copied into the site at `/play/`, and shown in a frame, so the game's
code and content always come from one checked commit. A `site` workflow picks that commit, builds the site around it,
runs the journeys against the real game in three browsers, uploads to Cloudflare Pages, and checks the live address;
it looks for a newer game every 10 minutes.

**Tech Stack:** TypeScript 7.0.2 strict, Vite 8.3.3, Vitest 5.0.3 (Node only), `@playwright/test` 1.63.0 (the
journeys), Biome 2.5.15, knip 6.39.0, `wrangler` 4.140.0, `@types/node` 24.19.1, pnpm 10.34.6, Node 24.21.0. Every
package is a dev dependency; the page ships no library.

**Spec:**
[`2026-11-13-2d-first-layer-design.md`](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/specs/2026-11-13-2d-first-layer-design.md)
in AutomataFramework: milestone M1, the Site line ("one page with the game playing, deployed") and the last clause of
M1's "done means" ("the site's game shows the crate where it was moved"). Principles served: 1 (the site shows what is
in the game's repo, with nothing set by hand), 3 (2D only; the frame keeps a later 3D game's code apart), 4 (its own
repo and package), 6 (the old stack; what is left out is listed below).

## What this plan covers, and what it does not

This is the Site's share of M1. Read with it: the spec, the framework's
[plan](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/plans/2026-11-13-m1-thin-thread-framework.md)
and its two audits, this repo's `CLAUDE.md` and [`progress.md`](../progress.md).

Not in this plan, because M1's Site line does not use it:

- The home page's five claims, guides, the examples gallery and the API reference (M4).
- The browser editors and their sign-in function. The Owner has decided that the editors get their own Cloudflare Pages
  project, so the Site does not host them in M1 (plan audit S4). The home page links to the editor once its address
  exists (the Owner's answer to Q1); that line lands in Task 8.
- A price page. Its brief is in the Owner's private notes and it starts after M1.
- A domain (spec, open item 2), other languages, Svelte (one static page has no use for it; it arrives with M4's
  site), Effect (three short scripts).
- npm: nothing is published, and nothing is installed from the `@automataframework` scope.

## Before starting: the Owner's part

Decided by the Owner on 2026-11-13, while this plan was written:

- **The address** is the Cloudflare Pages project `automataframework`, so `https://automataframework.pages.dev`.
- **Approved dev dependencies** outside the spec's stack table: `wrangler` 4.140.0, `@playwright/test` 1.63.0 and
  `@types/node` 24.19.1 (the old repo's pins).
- **Deploying waits until M1 is complete.** Tasks 1 to 7 build and test everything, the real game included, with no
  Cloudflare access. Task 8 (going live) starts only when the Owner has added both of these to this repo, under
  Settings, then Secrets and variables, then Actions:
  - the secret `CLOUDFLARE_API_TOKEN`, a Cloudflare API token with the permission "Cloudflare Pages: Edit";
  - the variable `CLOUDFLARE_ACCOUNT_ID`.

Stop and report to the coordinator if either of these is not true. Do not work around one.

1. `main` is protected in this repo (pull requests only).
2. GitHub-hosted runners accept jobs for this repo. Task 1's first push shows it.

## Global Constraints

- **Tests run only in GitHub-hosted CI, never locally**, and that includes the journeys. `pnpm lint`, `pnpm typecheck`,
  `pnpm knip` and `pnpm build` are not tests and are run locally before every push.
- No dependency beyond the Tech Stack line. A task that needs one stops and asks.
- The site never imports `@automataframework/framework` or any file of the game. It knows the game only through
  "What this plan relies on" below.
- The site shows only a commit of the game whose required checks all passed. No path may put an unchecked commit live,
  and a failed look-up leaves the live site as it is.
- **The drunk-grandma test.** Every word on a page is pinned in this plan (Tasks 5 and 6) and asserted by a journey,
  word for word. The journeys save a picture of each size to the `ci-screens` branch; the implementation audit reads
  those pictures and treats a screen that fails the test as a defect.
- **Nothing private on the page.** Copy comes from this plan only. No positioning, pricing, competitor or market words
  (the Owner's rule); nothing is copied from the private notes.
- A claim on the page must be true on `main` when it is shown. The page says the toolkit is still being built.
- Touch targets are at least 44 px; the Play button, the page's one primary action, is at least 56 px tall.
- Structure: `src/index.ts` (the page's entry), `src/build.ts` (the entry for Node), `src/lib/`,
  `src/features/<feature>/<feature>.ts` with one job per file beside it, `scripts/` (thin wrappers),
  `tests/architecture.test.ts`, `tests/features/<feature>/`, `tests/fixtures/`, `tests/journeys/`, `tests/workflows/`.
  A feature imports only itself, `src/lib/` and features below it, through their entry files. A source file has at
  most 600 lines.
- Workflow actions are pinned to the commit SHAs the framework's `ci.yml` uses. Only the `deploy` job may read the
  Cloudflare token, and it never checks out or runs the game's code.
- Every test that waits, waits on something being ready (`expect.poll`, a locator), never on a sleep.
- Comments say why. Conventional Commits. **No AI attribution anywhere** (commits, the pull request, docs). Before the
  first commit: `git config --global user.name "Dawson McThay" && git config --global user.email "107786093+mcthaydt@users.noreply.github.com"`.
  The pull request's credit line reads "Requested by **McThayDT**"; edit its body only with the GitHub MCP tool.

## How every task is verified

There is no local test run, so each task proves itself in the pull request's CI (Task 1 creates it). Read runs with the
session's GitHub tools.

- Each task pushes twice. First the tests alone: the named job must fail, and its log must show the reason the step
  names. Then the implementation: every job must pass. Do not write the implementation before reading the red run.
- Pictures are read from this repo's `ci-screens` branch (`pr-<number>/<engine>/<size>.png`), never from artifacts:
  the cloud network refuses the artifact host.
- After each task: tick its boxes here, update [`progress.md`](../progress.md) (the stage row and the percentage: each
  of Tasks 1 to 7 is 13% of this stage, Task 8 is the last 9%), and send the coordinator one line: commit, test
  counts, surprises.
- Stop rules (project): a failing check you cannot explain, a third fix for the same failure, an access refusal or a
  missing tool. Stop that task and report at once. Report each deviation from this plan with its reason. An
  Owner-only question goes to the coordinator with options, and the task waits. Hand off at 90 minutes.

## What this plan relies on

**From AutomataFrameworkExamples** (agreed with its plan session on 2026-11-13; the site tests each line):

1. In a fresh checkout, `pnpm install --frozen-lockfile && pnpm build` (Node 24.21.0, pnpm 10.34.6 from
   `packageManager`) leaves `dist/` with `index.html`, `assets/` and the game's files (`automata.toml`, `content/`).
   The install builds the framework from git, so it needs the network and takes longer than a plain install.
2. Every address in `dist/` is relative, so the folder works at `/play/`. The page fetches `./automata.toml` and the
   content files when it runs. The host must answer 404 for a file that is missing, not the home page.
3. The page fills the window with the game and nothing else. Its root is
   `<main id="game" data-state="loading|playing|problem">`. The game shows its own short lines of help, and a full
   window message when a game file is broken.
4. Keys: Left and Right arrows (or A and D) move; Space (or the Up arrow) jumps. Touch buttons: Left, Right, Jump.
5. The demo game is at the repo's root. Its checks on `main` are named `check`, `engines (chromium)`,
   `engines (webkit)` and `engines (firefox)`. A `screens` job also runs and proves nothing about the game.
6. Examples sends nothing to this repo in M1. The site looks for a new game by itself.

**From Cloudflare Pages:** a top-level `404.html` makes a missing address answer 404; without one, Pages answers every
missing address with the home page. `public/_headers` sets response headers. `wrangler pages dev dist` serves a folder
the way Pages does, headers and 404s included, with no account; the journeys run against it.

## File structure

```
package.json  tsconfig.json  vite.config.ts  vitest.config.ts  playwright.config.ts  biome.json  knip.json
wrangler.toml                      the Pages project's name and its output folder
index.html  404.html               the two pages (Vite's inputs)
public/_headers                    the headers Cloudflare sends
src/index.ts                       the page's entry: starts `page`
src/build.ts                       the entry for Node: re-exports version, pick, assemble
src/styles.css
src/features/version/version.ts    which site commit and which game commit a build holds
src/features/pick/                 pick.ts (entry)  choose.ts  decide.ts  github.ts
src/features/assemble/assemble.ts  puts a built game into the built site and stamps the version
src/features/play/play.ts          the Play button and the frame
src/features/page/page.ts          wires the page: the player and the version line
scripts/                           pick-game.ts  add-game.ts
tests/architecture.test.ts  tests/architecture/rules.ts  tests/architecture/rules.test.ts
tests/features/<feature>/          mirrors src/features (Node tests)
tests/fixtures/game/               index.html  game.js: the stand-in game for pull-request CI
tests/journeys/                    sizes.ts  watch.ts  home.journey.ts  hosting.journey.ts  live.journey.ts
tests/workflows/                   ci.test.ts  site.test.ts
.github/workflows/                 ci.yml  journeys.yml  site.yml
```

Feature order, lowest first: `version`, `pick`, `assemble`, `play`, `page`. `pick` and `assemble` are for Node;
`play` and `page` need a page. Node tests are `tests/**/*.test.ts`; journeys are `tests/journeys/*.journey.ts`.

## Review Focus

What a person will meet that the spec does not name. Each has a test in the task that owns the code.

1. **JavaScript is off or blocked.** The page must say so in words; it must not show a Play button that does
   nothing. Task 5.
2. **A slow phone connection, and an impatient thumb.** "Loading the game…" shows until the game's page has loaded,
   and a double tap starts one game, not two. Task 5.
3. **Turning the phone while playing.** The game is not restarted, and the page does not scroll sideways. Task 5.
4. **The game's repo is in the middle of a change:** its newest commit is still being checked, failed, or GitHub
   refuses the question. The site keeps the last good game and never shows an unchecked one. Task 3.
5. **A game build that would be a blank frame** (no `index.html`, or addresses starting with `/`). The site's build
   fails with a sentence, before anything is uploaded. Task 4.
6. **A mistyped address.** A page that says so, with a way home, and a real 404. Task 6.

---

### Task 1: The repo's skeleton, the `check` job and the architecture test

**Files:**
- Create: `package.json`, `tsconfig.json`, `biome.json`, `knip.json`, `vitest.config.ts`, `.gitignore`,
  `.github/workflows/ci.yml`, `src/index.ts`, `src/build.ts`, `tests/architecture.test.ts`,
  `tests/architecture/rules.ts`, `tests/architecture/rules.test.ts`, `tests/workflows/ci.test.ts`
- Modify: `README.md`

**Interfaces:**
- Produces: `pnpm lint`, `pnpm format`, `pnpm typecheck`, `pnpm knip`, `pnpm test:node`; the CI job `check`; and in
  `tests/architecture/rules.ts`:

```ts
export const LAYERS = ['version', 'pick', 'assemble', 'play', 'page'] as const
export type SourceFiles = Readonly<Record<string, string>> // path from the repo root -> file text
export interface Violation { readonly file: string; readonly rule: string; readonly detail: string }
export function checkArchitecture(files: SourceFiles): Violation[]
```

- [x] **Step 1: Write the config.** Copy from AutomataFramework at `ec4fddd96d0f1e39365ff807306faf9b42ac3190` and
  change only what is named: `biome.json` (drop `!schemas` and `!docs/api`), `.gitignore` (add `.wrangler/`,
  `test-results/`), `tsconfig.json` (drop `isolatedDeclarations` and `declaration`; nothing is published), `knip.json`
  (entries `scripts/*.ts`, `tests/**/*.test.ts`, `tests/journeys/*.journey.ts`, `playwright.config.ts`; ignore
  `tests/fixtures/game/**`). `package.json`: name `@automataframework/site`, `"private": true`, version `0.0.0`,
  `"type": "module"`, `packageManager` `pnpm@10.34.6`, `engines.node` `>=24.21.0`, imports `"#src/*": "./src/*"`,
  scripts `lint` (`biome check .`), `format` (`biome check --write .`), `typecheck` (`tsc -p .`), `knip`,
  `test:node` (`vitest run`). Add each dev dependency, at the Tech Stack's exact version, in the task that first uses
  it (knip fails on an unused one): this task adds `@biomejs/biome`, `typescript`, `knip`, `vitest`, `@types/node`.
  `vitest.config.ts`: one Node project, `tests/**/*.test.ts`.
- [x] **Step 2: Write `ci.yml`,** job `check` only, copied from the framework's `ci.yml` (`on`, `permissions`,
  `concurrency` and the `check` job as they are). `tests/workflows/ci.test.ts` reads the file's text:

```ts
test('the workflow as a whole can only read the repository', ...)   // /^permissions:\n {2}contents: read$/m before `jobs:`
test('every action is pinned to a commit', ...)                     // each `uses:` of an action matches /@[0-9a-f]{40} # v/
```

- [x] **Step 3: Write the failing tests.** Lift `tests/architecture/rules.ts`, `rules.test.ts` and
  `tests/architecture.test.ts` from the framework at the commit above (first line
  `// Lifted from AutomataFramework@ec4fddd9: <path>`), then change the rules to this repo's:
  - `LAYERS` as above. Drop `sim-is-pure` and `headless-is-headless` with their tests; replace `CONFINED` and the
    Effect rule with the two rules below.
  - `node-stays-in-node`: a `node:` import is allowed only in `src/features/pick/`, `src/features/assemble/` and
    `src/build.ts`.
  - `page-and-node-stay-apart`: nothing reachable from `src/index.ts` is in `pick` or `assemble`, and nothing
    reachable from `src/build.ts` is in `play` or `page`.

```ts
test('node modules stay on the Node side', () =>
  expect(one({ 'src/features/play/play.ts': "import { readFileSync } from 'node:fs'" })).toEqual(['node-stays-in-node']))
test('the page reaches nothing that needs Node', () =>
  expect(one({ 'src/index.ts': "import './features/assemble/assemble.ts'", 'src/features/assemble/assemble.ts': '' }))
    .toEqual(['page-and-node-stay-apart']))
test('the Node entry reaches nothing that needs a page', () =>
  expect(one({ 'src/build.ts': "export * from './features/play/play.ts'", 'src/features/play/play.ts': '' }))
    .toEqual(['page-and-node-stay-apart']))
```

  Keep the lifted tests for `imports-go-down`, `through-the-entry`, `lib-is-below-features`, `no-cycles`,
  `no-tests-in-src`, `at-most-600-lines`, `feature-has-entry` and `unknown-feature`, with this repo's feature names.
- [x] **Step 4: Push; `check` fails** on the three new rule tests (the lifted rules do not know them). This run also
  answers "Before starting" item 2. Open the stage's pull request as a draft, with a few lines saying what M1's site is.
- [x] **Step 5: Implement the two rules.** `src/index.ts` and `src/build.ts` are one comment each for now.
  `README.md`: what the site is, that the game comes from AutomataFrameworkExamples, and that tests run only in
  GitHub Actions.
- [x] **Step 6: Push; `check` passes.**
- [x] **Step 7: Commit** (`chore: repo skeleton, the check job and the architecture test`).

### Task 2: The version stamp

**Files:**
- Create: `src/features/version/version.ts`; modify `src/build.ts`
- Test: `tests/features/version/version.test.ts`

**Interfaces:**
- Produces:

```ts
export const GAME_REPO = 'mcthaydt/AutomataFrameworkExamples'
export const VERSION_FILE = 'version.json'
/** What one build of the site holds. Each is a 40-digit commit id, or a plain word ('dev', 'fixture') off CI. */
export interface Version { readonly site: string; readonly game: string }
export function writeVersion(version: Version): string             // 2-space JSON, `site` then `game`, '\n' at the end
export function parseVersion(text: string): Version | undefined    // never throws
export function isCommit(text: string): boolean                    // exactly 40 lowercase hex digits
export function shortCommit(text: string): string                  // the first 7 digits of a commit; anything else unchanged
export function gameCommitUrl(version: Version): string | undefined // https://github.com/<GAME_REPO>/commit/<game>, only for a commit
```

- [x] **Step 1: Write the failing tests:**

```ts
const A = 'a'.repeat(40), B = 'b'.repeat(40)
test('writeVersion then parseVersion gives the same version', ...)   // and the text is '{\n  "site": "aaa…",\n  "game": "bbb…"\n}\n'
test('parseVersion gives undefined for anything that is not a version', ...)
  // '', 'null', '[]', '<!doctype html>', '{"site":"x"}', '{"site":1,"game":2}', '{"site":"","game":"b"}' -> undefined each
test('parseVersion ignores keys it does not know', ...)             // extra "builtAt" -> { site, game } only
test('shortCommit shortens a commit and leaves a word alone', ...)   // A -> 'aaaaaaa'; 'fixture' -> 'fixture'
test('gameCommitUrl links a commit and nothing else', ...)
  // { site: A, game: B } -> 'https://github.com/mcthaydt/AutomataFrameworkExamples/commit/' + B; game 'fixture' -> undefined
```

- [x] **Step 2: Push; `check` fails** because `version.ts` does not exist.
- [x] **Step 3: Implement.** No package: `JSON.parse` in a `try`, then field checks.
- [x] **Step 4: Push; `check` passes.**
- [x] **Step 5: Commit** (`feat(version): the stamp that says which site and game a build holds`).

### Task 3: Picking the game's commit, and deciding whether to deploy

**Files:**
- Create: `src/features/pick/pick.ts`, `choose.ts`, `decide.ts`, `github.ts`, `scripts/pick-game.ts`; modify
  `src/build.ts`
- Test: `tests/features/pick/choose.test.ts`, `decide.test.ts`, `github.test.ts`

**Interfaces:**
- Consumes: `Version`, `parseVersion`, `isCommit`, `GAME_REPO`.
- Produces:

```ts
export const REQUIRED_CHECKS = ['check', 'engines (chromium)', 'engines (webkit)', 'engines (firefox)'] as const
export interface CheckRun { readonly name: string; readonly status: string; readonly conclusion: string | null }
export interface Candidate { readonly sha: string; readonly checks: readonly CheckRun[] }
/** The newest candidate (they come newest first) where every required check is completed with success. */
export function chooseCommit(candidates: readonly Candidate[]): string | undefined

export type SiteEvent = 'pull_request' | 'push' | 'schedule' | 'workflow_dispatch' | 'repository_dispatch'
export interface Decision {
  readonly game: string | undefined    // the game commit to build, when `build`
  readonly build: boolean              // build the site around the game and run the journeys
  readonly deploy: boolean             // then upload it
  readonly reason: string              // one plain sentence, printed in the run
}
export function decide(input: {
  readonly event: SiteEvent
  readonly site: string                // this run's commit of the site
  readonly picked: string | undefined  // chooseCommit's answer; undefined when none passed or GitHub could not be asked
  readonly live: Version | undefined   // the live site's version.json, if it could be read
  readonly hostReady: boolean          // the Cloudflare token exists
}): Decision

export class GitHubError extends Error {}
/** The newest `limit` commits of `branch`, each with its check runs. Throws GitHubError with a plain sentence. */
export function listCandidates(options: {
  readonly repo: string; readonly branch: string; readonly limit: number
  readonly token?: string; readonly fetch?: typeof fetch
}): Promise<Candidate[]>
```

  `decide`'s rules, in order. The game is `picked`, or else `live.game` when that is a commit (the last good game).
  1. No game: `build` and `deploy` false. Reason: `No commit of the game has passed its checks yet, so there is nothing to show.`
  2. `pull_request`: build, never deploy. Reason: `A pull request is built and tested with the real game, and never deployed.`
  3. `schedule` and not `hostReady`: neither. Reason: `The site is not live yet: the Owner has not added CLOUDFLARE_API_TOKEN.`
  4. `schedule` and `live` equals `{ site, game }`: neither. Reason: `The live site already shows this site and this game.`
  5. Otherwise build, and deploy when `hostReady`. Reason: `Building the site at <site 7> with the game at <game 7>.`,
     plus ` It will not be deployed: the Owner has not added CLOUDFLARE_API_TOKEN.` when not `hostReady`.

- [x] **Step 1: Write the failing tests:**

```ts
const run = (name: string, conclusion: string | null = 'success', status = 'completed') => ({ name, status, conclusion })
const green = REQUIRED_CHECKS.map((name) => run(name))
test('the newest commit whose required checks all passed is chosen', ...)      // [{A, green}, {B, green}] -> A
test('a commit still being checked is passed over', ...)                       // A has engines (webkit) 'in_progress'/null -> B
test('a commit with a failed check is passed over', ...)                       // A has check 'failure' -> B
test('a commit missing one required check is passed over', ...)                // A has three of the four -> B
test('checks that are not required do not count either way', ...)              // A green plus screens 'failure' -> A
test('no candidate that passed gives undefined; so does an empty list', ...)
test('decide: each rule gives its sentence', ...)   // one case per rule above, asserting the whole Decision
test('decide: when GitHub cannot be asked, the last good game is kept', ...)
  // push, picked undefined, live { site: OLD, game: B }, hostReady -> { game: B, build: true, deploy: true }
test('decide: a new game on a schedule is built and deployed', ...)            // live.game B, picked A -> game A, both true
test('decide: a live version that is not a commit is never reused', ...)       // live.game 'fixture', picked undefined -> rule 1
test('listCandidates asks for the commits, then each commit\'s check runs', ...)
  // a fake fetch records URLs: https://api.github.com/repos/o/r/commits?sha=main&per_page=2, then
  // /repos/o/r/commits/<sha>/check-runs?per_page=100 for each; sends `authorization: Bearer t` only when a token is given
test('listCandidates turns a refusal into a sentence', ...)
  // status 403 -> GitHubError 'GitHub answered 403 for https://api.github.com/…. The site keeps the game it has.'
  // a fetch that rejects -> GitHubError 'GitHub could not be reached. The site keeps the game it has.'
```

- [x] **Step 2: Push; `check` fails** because `pick.ts` does not exist.
- [x] **Step 3: Implement.** `scripts/pick-game.ts` is the thin wrapper: it reads `GITHUB_EVENT_NAME`, `GITHUB_SHA`
  (for a pull request, `PR_HEAD_SHA`), `GH_TOKEN`, `SITE_URL` and `HOST_READY`; calls `listCandidates` for
  `GAME_REPO`, `main`, 10 commits (a `GitHubError` is printed and means `picked` is undefined); fetches
  `${SITE_URL}/version.json` (any failure means `live` is undefined); prints the reason; and appends `game=`,
  `build=` and `deploy=` to the file `GITHUB_OUTPUT` names. It exits 0 whatever GitHub or the live site answered.
- [x] **Step 4: Push; `check` passes.**
- [x] **Step 5: Commit** (`feat(pick): choose the newest checked game and decide whether to deploy`).

### Task 4: The stand-in game, and putting a game into the site

**Files:**
- Create: `src/features/assemble/assemble.ts`, `scripts/add-game.ts`, `tests/fixtures/game/index.html`,
  `tests/fixtures/game/game.js`, `vite.config.ts`, `index.html` (a title and an empty body for now); modify
  `src/build.ts`, `package.json`, `.github/workflows/ci.yml`
- Test: `tests/features/assemble/assemble.test.ts`

**Interfaces:**
- Consumes: `Version`, `writeVersion`, `VERSION_FILE`.
- Produces: `pnpm build` (`vite build && node scripts/add-game.ts`), a `build` step at the end of the `check` job, and:

```ts
export const PLAY_FOLDER = 'play'
export class AssembleError extends Error {}
/** Copies the built game into `<siteDir>/play/` (replacing what is there) and writes `<siteDir>/version.json`. */
export function addGame(options: { readonly siteDir: string; readonly gameDir: string; readonly version: Version }): void
```

  The stand-in game follows "What this plan relies on" lines 2 to 4 and nothing more: `index.html` is
  `<main id="game" data-state="loading">` filling the window, loading `./game.js` (a file, because the site's headers
  allow no inline script); `game.js` puts a canvas in it, draws a sky (`#9fd3f0`) with one red box, moves the box
  right while `ArrowRight` or `KeyD` is held, and sets `data-state="playing"`.

  `scripts/add-game.ts` reads `GAME_DIR` (default `tests/fixtures/game`), `GAME_COMMIT` (default `fixture`) and
  `SITE_COMMIT` (default `GITHUB_SHA`, else `dev`), and calls `addGame` with `siteDir` `dist`. An `AssembleError`
  is printed as its sentence, without a stack, and exits 1.

- [x] **Step 1: Write the failing tests** (each in its own folder under `os.tmpdir()`, removed afterwards):

```ts
test('the game is copied to play/ with everything beside it', ...)
  // gameDir: index.html, assets/a.js, content/levels/level-1.json -> all three under siteDir/play/
test('version.json says which site and game', ...)                 // file text === writeVersion(version)
test('an older game in play/ is replaced, not mixed in', ...)      // siteDir/play/old.js exists before -> gone after
test('a game folder with no index.html is refused in words', ...)
  // -> AssembleError 'There is no built game at "<gameDir>": index.html is missing. Run pnpm build in the game\'s repo first.'
test('a site folder with no index.html is refused in words', ...)
  // -> AssembleError 'The site is not built yet: "<siteDir>" has no index.html. Run vite build first.'
test('a game that uses addresses starting with / is refused, because it would be a blank frame', ...)
  // game index.html has <script src="/assets/a.js"> -> AssembleError
  // 'The game\'s index.html points at "/assets/a.js". Every address must be relative (./assets/a.js) so the game works inside /play/.'
  // and <link href="/x.css"> likewise; "//cdn" and "https://…" and "./a.js" are left alone
test('nothing is written when the game is refused', ...)           // siteDir has no play/ and no version.json afterwards
```

- [x] **Step 2: Push; `check` fails** because `assemble.ts` does not exist.
- [x] **Step 3: Implement,** with `node:fs`'s `cpSync`, `rmSync` and `writeFileSync`. Add `vite` and the `build` script.
  `vite.config.ts`: inputs `index.html` and (from Task 6) `404.html`, output `dist/`.
- [x] **Step 4: Run `pnpm build` locally** and confirm `dist/play/index.html`, `dist/play/game.js` and
  `dist/version.json` (`"game": "fixture"`) exist. Push; `check` passes, its last step being `pnpm build`.
- [x] **Step 5: Commit** (`feat(assemble): put a built game into the site at /play/`).

### Task 5: The page, the Play button and the journeys

**Files:**
- Create: `src/features/play/play.ts`, `src/features/page/page.ts`, `src/styles.css`, `playwright.config.ts`,
  `wrangler.toml`, `tests/journeys/sizes.ts`, `tests/journeys/watch.ts`, `tests/journeys/home.journey.ts`,
  `.github/workflows/journeys.yml`
- Modify: `index.html`, `src/index.ts`, `package.json`, `.github/workflows/ci.yml`, `tests/workflows/ci.test.ts`

**Interfaces:**
- Consumes: `parseVersion`, `shortCommit`, `gameCommitUrl`, `VERSION_FILE`.
- Produces: `pnpm test:journeys` (`playwright test`); the reusable workflow `journeys.yml`; and:

```ts
export const GAME_ADDRESS = '/play/'
export const FRAME_TITLE = 'The demo game'
export type PlayState = 'ready' | 'loading' | 'playing'
export interface Player { readonly state: PlayState; destroy(): void }
/** `root` is the page's `#game` section. Shows the Play button; a press swaps it for the game's frame. */
export function createPlayer(root: HTMLElement): Player
/** Starts the player on `#game` and fills the version line from `/version.json`. Never throws. */
export function startPage(doc: Document): Promise<void>
```

**The page's words,** exactly (`index.html`, `lang="en"`, `<title>AutomataFramework</title>`):

| Where | Words |
|---|---|
| `h1` | AutomataFramework |
| `p.lede` | A toolkit for making 2D games. It is still being built. This is its first small game. |
| `#game` button | Play the game |
| `#game` status | Loading the game… |
| `noscript` in `#game` | This game needs JavaScript. Turn it on in your browser's settings, then load this page again. |
| `h2` | How to play |
| help, line 1 | On a computer: press the arrow keys to move and Space to jump. |
| help, line 2 | On a phone or tablet: use the buttons on the screen. |
| help, line 3 | Keys not working? Click the game once. |
| `h2` | What you are playing |
| `p` | You are playing the game exactly as it is saved on GitHub. When someone changes it there and the change passes its checks, this page shows the new game within about 15 minutes. |
| `#game-version` | Game version: `<short commit>` (the commit is a link to it on GitHub; the whole line is hidden until it is known) |
| footer links | "The game's files" to `https://github.com/mcthaydt/AutomataFrameworkExamples`; "The toolkit" to `https://github.com/mcthaydt/AutomataFramework` |

**How it behaves.** In the HTML the button has `hidden`; the script shows it, so with JavaScript off only the
`noscript` words are there. A press sets `#game`'s `data-state` to `loading`, hides the button, shows the status
(`role="status"`), and adds one `<iframe title="The demo game" src="/play/">`. When the frame's `load` fires:
`data-state` is `playing`, the status is hidden, the frame takes the keyboard focus, and `#game` is scrolled to the
top of the window. A press while not `ready` does nothing.

**How it looks** (`src/styles.css`; no font files, the system's sans-serif):
- Colours: page `#fbfaf7`, words `#1b1b24`, button `#1b1b24` with words `#ffffff`; under
  `prefers-color-scheme: dark`, page `#14141b`, words `#f2f1ec`, button `#f2f1ec` with words `#14141b`. Links are
  underlined. Words are at least 18 px; the column is at most 960 px wide with 16 px at the sides plus the safe-area
  insets.
- The button: at least 56 px tall and 200 px wide, 20 px bold words, centred in `#game`, with a visible focus ring.
- `#game`: full column width, `aspect-ratio: 16 / 9`, `max-height: 80svh`, background `#9fd3f0` (the game's sky, so
  there is no flash). Upright and narrower than 700 px: no aspect ratio, `height: 80svh`, so the game has room for
  its touch buttons under the level. Window shorter than 500 px (a phone on its side): `height: 100svh`. The frame
  fills `#game` with no border.

**The journeys' set-up.** `playwright.config.ts`: `testDir` `tests/journeys`, `testMatch` `*.journey.ts`, one project
per engine named `chromium`, `webkit` and `firefox`, `forbidOnly` in CI, no retries (a test that passes on a retry is
a defect to find). `baseURL` is `BASE_URL` when set; otherwise `http://127.0.0.1:8788`, with `webServer`
`pnpm exec wrangler pages dev dist --ip 127.0.0.1 --port 8788` (`WRANGLER_SEND_METRICS=false`), so the journeys see
the headers and 404s Cloudflare will send. `wrangler.toml`: `name = "automataframework"`,
`pages_build_output_dir = "dist"`, and a `compatibility_date` of the day it is written. `tests/journeys/sizes.ts`:

```ts
export const SIZES = [
  { name: 'phone-390x844', width: 390, height: 844 },
  { name: 'phone-844x390', width: 844, height: 390 },
  { name: 'tablet-820x1180', width: 820, height: 1180 },
  { name: 'tablet-1180x820', width: 1180, height: 820 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
] as const
```

  `tests/journeys/watch.ts` exports `watchForTrouble(page): () => string[]`, which collects console errors, page
  errors, failed requests and responses of 400 or above, as sentences; a journey ends with
  `expect(trouble()).toEqual([])`.

  `journeys.yml` is `on: workflow_call` with inputs `site-artifact` (the uploaded `dist/`) and `latest` (the folder
  name on `ci-screens`). Job `engines`, matrix `[chromium, webkit, firefox]`, `fail-fast: false`: checkout, pnpm,
  Node, install, `gh run download` the artifact into `dist/`, `pnpm exec playwright install --with-deps <engine>`,
  `pnpm test:journeys --project <engine>`, upload `tests/journeys/__screenshots__/**` as `screens-<engine>`
  (`if: always()`). Job `screens`: the framework's `screens` job as it is, with `LATEST` from the input. `ci.yml`
  gains a job `build` (install, `pnpm build`, upload `dist/` as `site`) and calls `journeys.yml` after it with
  `latest` `main` or `pr-<number>`. A called workflow gets no more than its caller grants, so the calling job (and
  only it) carries `permissions: actions: read, contents: write`: `actions: read` for `gh run download`,
  `contents: write` for the `screens` job's push to `ci-screens`, which stays guarded against forks as in the
  framework. Add to `tests/workflows/ci.test.ts`: only the call to `journeys.yml` may write; inside `journeys.yml`
  only `screens` asks for `contents: write`, and its one `git push` goes to `ci-screens`.

- [x] **Step 1: Write the failing journeys,** `home.journey.ts`. Each `describe` below runs once per size in `SIZES`
  (`test.use({ viewport })`), except where it names one:

```ts
test('the page says what it is and what to press', ...)
  // every row of the words table is on the page with exactly those words; one button, named 'Play the game', visible,
  // at least 56 px tall; document.documentElement.scrollWidth <= clientWidth; trouble() is []
test('pressing Play starts the game inside the page', ...)
  // click -> one iframe titled 'The demo game'; inside it '#game[data-state="playing"]' and a visible canvas wider and
  // taller than 100 px; the page's #game has data-state 'playing'; the status and the button are hidden; the frame is
  // inside the window's width and at least 200 px tall; then page.screenshot to
  // tests/journeys/__screenshots__/<size name>.png (compared with nothing: people look at it)
test('the keys reach the game with no second click', ...)
  // after Play: before = canvas screenshot; keyboard.down('ArrowRight');
  // expect.poll(async () => (await canvas.screenshot()).equals(before)).toBe(false); keyboard.up
test('the version line names the game that is playing', ...)
  // v = parseVersion(await (await request.get('/version.json')).text()); '#game-version' has text
  // 'Game version: ' + shortCommit(v.game); it holds a link to gameCommitUrl(v) exactly when that is defined
// desktop-1440x900 and phone-390x844 only:
test('a slow game says it is loading, and then stops saying it', ...)
  // page.route('**/play/', hold) -> after the press the status 'Loading the game…' is visible and data-state is
  // 'loading'; release the route -> the status is hidden and data-state is 'playing'
test('a double press starts one game', ...)                      // dblclick the button -> exactly one iframe
test('with JavaScript off, the page says what to do and shows no button', ...)
  // test.use({ javaScriptEnabled: false }) -> the noscript words are visible; the button is not
test('a missing version file hides the line and breaks nothing', ...)
  // route '**/version.json' to a 404 -> '#game-version' is hidden; Play still starts the game
// phone-390x844 only:
test('turning the phone keeps the same game going', ...)
  // after Play: set `window.keptThroughTheTurn = true` on the frame's window; setViewportSize 844 x 390 -> the iframe
  // is visible, its window still has the marker (a reloaded frame would have lost it), its #game is still 'playing',
  // and the page has no sideways scroll
```

- [x] **Step 2: Push; the three `engines` jobs fail** because the page has no button (`check` and `build` pass).
- [x] **Step 3: Implement** the page, the styles, `play.ts`, `page.ts` and `src/index.ts` (which calls
  `startPage(document)`).
- [x] **Step 4: Push; all jobs pass.** Read the fifteen pictures on `ci-screens` under `pr-<number>/` and check each
  against the drunk-grandma test: can she tell what this is and what to press, at every size? Report what you saw in
  the task's line; a picture that fails is fixed here, not noted.
- [x] **Step 5: Commit** (`feat(page): the home page, the Play button and its journeys`).

### Task 6: The missing page and the headers

**Files:**
- Create: `404.html`, `public/_headers`, `tests/journeys/hosting.journey.ts`
- Modify: `vite.config.ts`

**The 404 page's words,** exactly (`<title>Page not found: AutomataFramework</title>`): `h1` "This page does not
exist."; `p` "The address may be mistyped, or the page may have moved."; a link "Go to the home page" to `/`. It
uses the same stylesheet and carries no script.

**The headers,** for every address (`/*`):

```
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' data: blob:; worker-src 'self' blob:; frame-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'
```

  `'wasm-unsafe-eval'` is for the game's physics (WebAssembly); there is no `'unsafe-eval'`, which the framework
  promises games do not need. If the real game trips this policy in Task 7, the journey's `trouble()` names the
  directive: widen that one directive only, and report it as a deviation with the browser's message.

- [x] **Step 1: Write the failing journeys** (desktop size, each engine):

```ts
test('a missing address answers 404, says so, and offers the way home', ...)
  // response of page.goto('/no-such-page') has status 404; the three pieces of words are visible; clicking the link
  // lands on '/' with the h1 'AutomataFramework'
test('a missing file of the game answers 404, not the home page', ...)
  // request.get('/play/content/no-such-file.json') -> status 404
test('every page is sent with its safety headers', ...)
  // for '/', '/play/' and '/no-such-page': x-content-type-options 'nosniff'; content-security-policy contains
  // "frame-ancestors 'self'" and "script-src 'self' 'wasm-unsafe-eval'" and does not match /(?<!wasm-)unsafe-eval/
test('the game still plays under those headers', ...)   // Play -> '#game[data-state="playing"]' in the frame; trouble() is []
```

- [x] **Step 2: Push; the `engines` jobs fail** on the 404 status (Pages answers a missing address with the home page
  while there is no `404.html`).
- [x] **Step 3: Implement.**
- [x] **Step 4: Push; all jobs pass.**
- [x] **Step 5: Commit** (`feat(hosting): a real 404 page and the safety headers`).

### Task 7: The `site` workflow, and the real game in the site

**Files:**
- Create: `.github/workflows/site.yml`, `tests/workflows/site.test.ts`, `tests/journeys/live.journey.ts`

**Interfaces:**
- Consumes: `scripts/pick-game.ts` (outputs `game`, `build`, `deploy`), `pnpm build` with `GAME_DIR`, `GAME_COMMIT`
  and `SITE_COMMIT`, `journeys.yml`.
- Produces: the workflow `site`:

  - **Starts on** `pull_request`, `push` to `main`, `schedule` (`*/10 * * * *`), `workflow_dispatch`, and
    `repository_dispatch` of type `game-changed` (nothing sends it in M1; it costs one line and lets the game's repo
    push later). `permissions: contents: read`. `concurrency`: group `site-${{ github.ref }}`, never cancelling a
    run in progress. `env`: `SITE_URL: https://automataframework.pages.dev`.
  - **`pick`**: checkout, install, `node scripts/pick-game.ts` with `GH_TOKEN: ${{ github.token }}`,
    `PR_HEAD_SHA` and `HOST_READY: ${{ secrets.CLOUDFLARE_API_TOKEN != '' }}` (a yes or no, never the token).
    Outputs `game`, `build`, `deploy`.
  - **`build`** (needs `pick`, `if: build == 'true'`): checks out this repo into `site/` and
    `mcthaydt/AutomataFrameworkExamples` at the picked commit into `game/` (`persist-credentials: false`); in
    `game/`, `pnpm install --frozen-lockfile && pnpm build`; in `site/`, install and
    `GAME_DIR=../game/dist GAME_COMMIT=<game> SITE_COMMIT=<this commit> pnpm build`; uploads `site/dist` as `site`.
  - **`journeys`** (needs `build`; `permissions: actions: read, contents: write`, as in `ci.yml`): calls `journeys.yml` with `latest: live` for a push, a schedule or a dispatch,
    and `pr-<number>-real` for a pull request. The same journeys as Task 5 and 6, now against the real game.
  - **`deploy`** (needs `pick`, `journeys`; `if: deploy == 'true'`; `concurrency: deploy`, not cancelling): checkout
    of this repo only, install, `gh run download` the `site` artifact into `dist/`, then with
    `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}` and
    `WRANGLER_SEND_METRICS: 'false'`: `pnpm exec wrangler pages project create automataframework
    --production-branch main || echo "The project already exists."`, then
    `pnpm exec wrangler pages deploy dist --project-name automataframework --branch main`.
  - **`live`** (needs `pick`, `deploy`): checkout, install, Chromium, then
    `BASE_URL=$SITE_URL EXPECT_SITE=<this commit> EXPECT_GAME=<game> pnpm test:journeys --project chromium`.

  `tests/journeys/live.journey.ts` is skipped unless `EXPECT_GAME` is set:

```ts
test('the live address serves this build', ...)
  // expect.poll(() => request.get('/version.json') parsed, { timeout: 120_000 }).toEqual({ site: EXPECT_SITE, game: EXPECT_GAME })
```

- [x] **Step 1: Write the failing tests,** `tests/workflows/site.test.ts`, over the workflow's text:

```ts
test('it starts on exactly these five events, and looks for a new game every 10 minutes', ...)
test('the workflow as a whole can only read the repository', ...)
test('only the deploy job is given the Cloudflare token', ...)
  // 'secrets.CLOUDFLARE_API_TOKEN' appears twice: once as `!= ''` in pick, once in deploy's env
test('the deploy job never checks out or builds the game', ...)
  // the deploy job's text has no 'AutomataFrameworkExamples' and no 'pnpm build'
test('nothing is deployed unless the journeys passed against the real game', ...)   // deploy `needs` includes journeys
test('a pull request is never deployed', ...)
  // covered by decide (Task 3); here: the deploy job's `if` reads needs.pick.outputs.deploy and nothing else
test('the game is checked out at the picked commit, without credentials', ...)
test('two deploys never run at once', ...)
test('the address is written once and matches the project name in wrangler.toml', ...)
```

- [x] **Step 2: Push; `check` fails** because `site.yml` does not exist.
- [x] **Step 3: Write `site.yml`.** Push.
- [x] **Step 4: Read the `site` run on the pull request.** One of two things is true:
  - **The game has a commit that passed.** `pick` says so, `build` and the three `journeys` engines pass against the
    real game, and `deploy` and `live` are skipped. This is the join of the two repos, proven before anything is
    live. Read the pictures under `pr-<number>-real/` on `ci-screens`, as in Task 5 Step 4. If a journey fails
    because the real game differs from "What this plan relies on" (a key, a root element, an absolute address, a
    header), **stop and report** the exact difference to the coordinator: the fix may belong in either repo.
  - **The game has no commit that passed yet.** `pick` prints rule 1's sentence and the other jobs are skipped. Report
    that the join is waiting on the Examples repo, and finish the task's other steps. The join then happens on the
    first `site` run after Examples is green; read it and report it.
- [x] **Step 5: Push; all jobs of `ci` and `site` pass** (or are skipped for the reason Step 4 names).
- [x] **Step 6: Commit** (`feat(site): pick the checked game, build, test and deploy around it`). Mark the pull request
  ready, set this stage to 91% in `progress.md`, and send the coordinator the summary: commits, test counts per job,
  what the pictures show, every deviation, and that going live waits on the Owner's two settings. Tell the
  coordinator the exact check names of the `ci` workflow, so the Owner can make them required on `main`.

### Task 8: Going live (after M1 is complete: the Owner's settings first)

Do not start until the Owner has added `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (see "Before starting") and
the coordinator says so. This task changes no file but the tracker; it is done by reading runs.

- [ ] **Step 1: Ask the coordinator to have the Owner start the `site` workflow by hand** on `main` (Actions, then
  `site`, then "Run workflow"), or wait for the next 10-minute run.
- [ ] **Step 2: Read that run.** `pick` builds and deploys; `journeys` pass against the real game; `deploy` uploads;
  `live` finds `version.json` at `https://automataframework.pages.dev` with this site commit and the picked game
  commit. If Cloudflare gave the project another address (the name was taken), stop and report it: the address is the
  Owner's to see first.
- [ ] **Step 3: Prove the last clause of M1's "done means".** After the next commit on the game's `main` passes its
  checks (an editor's save, or any merged change), read the next scheduled `site` run: `pick` names the new commit,
  the run deploys, and `live` passes. Report the two commit ids, the time the game's checks finished and the time
  `live` passed.
- [ ] **Step 4: Set this stage to 100%** in `progress.md`, with the address, and report to the coordinator.

## For later plans (noted, not built)

- The game runs in a frame on the site's own origin. That is right while both repos are the Owner's. Before any page
  on this origin shows other people's examples (M4's gallery), frames must move to their own origin or be sandboxed.
  The editors' sign-in will not be on this origin (they have their own project).
- A push from the game's repo (`repository_dispatch`, already accepted) would replace the 10-minute wait. It needs an
  Owner token stored in the Examples repo.
- GitHub stops a repo's scheduled workflows after 60 days with no commits; a quiet stretch needs one run started by
  hand.
- Pull-request previews on Cloudflare (one address per pull request) would let the Owner try a page before it merges.
