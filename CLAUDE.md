This codebase is yours: what it's for and how it's built are your call, and you'll keep building on it.

# AutomataFrameworkSite

A framework and set of editors for making games, where agents do the authoring and every piece of authorable content
can be edited on an iPad. This repo is the website. The first layer's design is
[the spec in AutomataFramework](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/specs/2026-11-13-2d-first-layer-design.md);
where this page is short, the spec has the detail. This repo's plans, audits and tracker are in `docs/superpowers/`.

## What is particular to this repo

- **The site is static files on Cloudflare Pages**, at `automataframework.pages.dev` until there is a domain (the
  Owner, 2026-11-13). `deploy` is the only job that holds the Cloudflare token, and it never runs the game's code.
- **The site does not depend on the framework.** The demo game is built by its own repo
  (AutomataFrameworkExamples, `pnpm build`), copied to `/play/` and shown in a frame. The site shows the newest commit
  on the game's `main` whose checks all passed, never an unchecked one.
- **Every claim on a page is true on `main` today.** A sentence that is true only on a branch, or only in one browser,
  is a defect.
- **Site copy is where strategy leaks.** Words on a page come from the public spec and READMEs. Nothing is copied from
  the private notes; a plan may say "the brief is in the private notes" and no more.
- **Dependencies the Owner approved for this repo** (2026-11-13): `wrangler` 4.140.0, `@playwright/test` 1.63.0,
  `@types/node` 24.19.1, and (2026-11-14, for the Blueprint
  look) `@fontsource/ibm-plex-sans-condensed` 5.3.0, `@fontsource/jetbrains-mono` 5.3.0 and `@phosphor-icons/core`
  2.1.1, all development-only. `knip.json` is told to ignore the three, because knip reads neither CSS `@import`s
  (the fonts) nor the icon reader's `import.meta.resolve` (the icons).
- **The site wears Blueprint** (the spec's "Visual direction"). The five colours and the two fonts are named only in
  `src/styles.css`, and `tests/styles/` holds the sheet to them. Marker yellow is only for what can be touched. Dark is
  the only theme. Nothing is drawn on or over the game: its art is never restyled.
- **The fonts' and icons' licence notices** are in `public/licences.txt` (the Owner, 2026-11-14), served at
  `/licences.txt`. Move a font or icon package to a new version, and copy its `LICENSE` there again.

## Principles

1. **Agent-first.** Anything a person can author, an agent can create, read and change through the same documented
   formats and commands. No hidden state, nothing mouse-only.
2. **iPad-first editors.** Touch first; desktop is a bonus.
3. **Layers in order.** 2D built in full (runtime, editors, publishing) before any 3D. 3D is a layer on top, never
   mixed in.
4. **Separate repos per layer or tool**, each with its own release. No monorepo.
5. **Characters and scenes come from the environment builder and figure builder**, carried over from the first attempt.
6. **The stack carries over whole** (PixiJS, Pixi3D, Colyseus, Effect, strict TypeScript, a deterministic sim with
   cross-browser parity tests, API reports, GitHub-hosted CI). Anything left out has a written reason. New dependencies
   need the Owner's yes.
7. **Port in layer order** from AutomataFrameworkFailed, reviewed as it lands, never ahead of the layer using it. That
   repo is a reference, not a template.

Every spec names the principle it serves; a spec serving none, or breaking one, doesn't start.

**Left out:** Ruken as a target (web, itch and desktop stay); a monorepo layout; anything mixing 2D and 3D in one
package.

## The Owner's decisions (2026-11-13)

- **Strategy and research stay private.** Positioning, competitors, pricing and market research never go in these
  public repos; the Owner keeps them in the project's private files.
- **The first layer** is a thin slice through the whole offering: the framework, a demo game, the editors, the site and
  deployment, built as a thin thread through all four repos first and then widened (milestones M1 to M4).
- **Repos:** AutomataFramework, AutomataFrameworkExamples (the demo game, later the 3D game, the site's
  examples), AutomataFrameworkEditors, AutomataFrameworkSite (this one). PixiJS is the biggest inspiration.
- **Determinism means physics.** Rapier's deterministic 2D build. Physics and networking (Colyseus) are in the core,
  like the ECS (Koota).
- **Multiplayer:** every game is built as if it were multiplayer; turning it on is a per-game choice. Networking is
  built and proven in CI, not deployed. Fly.io hosts the room server once the 3D game uses it.
- **The demo game** is a small original physics platformer, single-player, with every built-in: saves; title, pause and
  settings screens; keyboard, touch and gamepad with remapping; music and sound with volume; phone, tablet and desktop
  layouts; languages.
- **Editors:** all nine old 2D editors plus the figure and environment builders, which make 2D art only, combined
  into five: World (Levels, Tiles, the environment builder), Characters (the figure builder, clips and entity kinds,
  Schematic), Feel (Feel, Tuner), Sound (Audio) and Story (Writer, Sequence). World and Characters have a 2D and a 3D
  version; the 2D ones work the way the old 3D builders did. In the browser, and as a Tauri app for iPad, Android
  and desktop.
- **Edits live in the game's GitHub repo.** Save makes a commit; edits that collide merge the way GitHub does.
  Sign-in runs through a Cloudflare Pages Function; the site is on Cloudflare Pages.
- **Formats:** game content is JSON; everything else is TOML.
- **Order inside the editors:** World's Levels part (M1), then Feel with Tuner inside it (the first editor slice),
  then the rest of the five.
- **Releases are big and few** (the Owner, 2026-11-13). Release 1 is when 2D is finished (the framework in full and
  the demo game), Release 2 the 2D editors, Release 3 the website, Release 4 distribution (shipping games and the
  editor app), Release 5 3D, and the loop repeats for 3D. Milestones are not releases: nothing is published per
  milestone, and `release.yml` runs only when the Owner starts it by hand. Small releases come back only once the
  product is officially feature complete.
- **Publish targets:** web, itch.io, Wavedash (if its rules fit the host port) and desktop.
- **Languages:** games ship English, Spanish, Korean, Japanese, Chinese and Portuguese. Editors add French, Russian and
  German. The list follows the most popular languages for Godot.
- **`main` is protected** in every repo: pull requests only, no force pushes or deletion, checks required once CI exists,
  no required approving review. Every new repo gets the same protection, and its own copy of this page, when it is
  created.

## Workflow

Each stage is a fresh session on its own branch; the handoff is committed docs.

1. **Spec**: coordinator and Owner, superpowers brainstorming, written to `docs/superpowers/specs/<date>-<topic>-design.md`
   in AutomataFramework.
2. **Plan**: Fable 5.2, medium effort, writing-plans, written to `docs/superpowers/plans/<date>-<topic>.md`.
3. **Plan audit**: Opus, medium effort, the audit prompt, written to `docs/superpowers/audits/<date>-<cycle>-plan-audit.md`.
4. **Execution**: Sonnet, high effort, executing-plans, the implementation prompt.
5. **Implementation audit**: Opus, medium effort, written to `docs/superpowers/audits/<date>-<cycle>-implementation-audit.md`.
6. **Fixes**: Sonnet, high effort.
7. **Owner review.**

Every stage reads the spec, the plan, the audits and [`docs/superpowers/progress.md`](docs/superpowers/progress.md),
updates the tracker with a progress percentage, and ends by committing and pushing.

**Implementation prompt:** "Now implement precisely as planned, in full. Implementation Requirements: - Write elegant,
minimal, modular code. - Adhere strictly to existing code patterns, conventions, and best practices. - Include
thorough, clear comments/documentation within the code. - As you implement each step: - Update the markdown tracking
document and overall progress percentage dynamically."

**Audit prompt:** "Audit all of your work for completeness, consistency, cohesion, and harmony, both within itself and
relative to the spec and relative to the codebase. Assume nothing. Verify everything. Investigate any incomplete
implementations or incomplete integrations. Do your best work."

## Sessions and reporting

- One long-lived coordinator. One long-lived merge session merges each finished stage branch to `main` by pull request
  once checks pass, then deletes the branch; it never leaves a passing pull request open. Stage sessions are archived
  when done.
- **Stage sessions report to the coordinator:**
  - one line per task: the commit, the test count, any surprises;
  - immediately at any stop (a stop rule, a cap, a failing test, an access refusal, a missing tool), and that task
    stops;
  - each deviation from the plan, with the reason;
  - Owner-only questions, with options, before defaulting;
  - a handoff at 90 minutes;
  - a summary at the end.
- **The merge session reports:**
  - each merge;
  - immediately, then waits for an answer, on any of these: a failing check, a conflict, a golden moved without a
    commit naming it, more than five branches, an unrequested branch, or any judgement call.

## Rules

- **The drunk-grandma test.** All copy and UX (every editor, the site, the game's screens) must let a drunk grandma
  tell what is happening and what to press. A screen that fails it is a defect.
- No subagents unless the Owner says so.
- **CLI first.** If something can be done with a CLI (gh, npm, wrangler and the like), do it with the CLI, and give
  the Owner CLI commands rather than click-through steps.
- **No AI attribution anywhere.** No `Co-Authored-By: Claude`, no session-link trailer and no "Generated with Claude Code" in
  commits, pull request bodies or docs (the Owner, 2026-11-13). Before any commit, set the author with
  `git config --global user.name "McThayDT" && git config --global user.email "107786093+mcthaydt@users.noreply.github.com"`.
  The `commit-authors` check (`.github/workflows/commit-authors.yml`) fails a pull request when one of the Owner's
  commits is not exactly that author and committer, when any commit is by Claude, or when a commit message or the
  pull request's words have a Claude credit. Its failure message gives the fix.
- Refresh sessions after 90 minutes.
- Branches: `main` plus branches with CI running, five at most.
- **Tests run only in GitHub-hosted CI, never locally.** Verify through the pull request's CI runs.

## Structure

```
index.html, 404.html          the pages (Vite's entries)
public/                       files served as they are (`_headers`)
src/index.ts                  the page's entry
src/build.ts                  the entry for Node: what the scripts use, nothing that needs a page
src/lib/                      shared helpers, no feature logic
src/features/<feature>/       <feature>.ts entry, <part>.ts one job per file
scripts/                      thin CLI wrappers
tests/architecture.test.ts    imports go down, no cycles, no tests in src
tests/features/<feature>/     mirrors src/features
tests/fixtures/               shared test helpers and the stand-in game
tests/journeys/               end-to-end journeys in real browsers, against the built site
tests/styles/                 checks that read the stylesheet: the five colours, dark only, contrast
tests/workflows/              checks that read a workflow
tests/docs/                   checks that read the README
docs/superpowers/             plans/, audits/, progress.md (the spec is in AutomataFramework)
```

Features import only from features below them. No top-level `components/`, `services/` or `utils/`.
