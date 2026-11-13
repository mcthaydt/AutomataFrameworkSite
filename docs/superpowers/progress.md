# Progress

The tracker every stage reads first and updates last. One section per cycle; newest first.

## Cycle 1: the 2D first layer, the Site's share of M1

Spec: [`2026-11-13-2d-first-layer-design.md`](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/specs/2026-11-13-2d-first-layer-design.md)
in AutomataFramework (Stage 1 was done there). The project-wide tracker is AutomataFramework's
[`progress.md`](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/progress.md).

Overall: **38%** (the plan is 10 points, its audit 5, execution 45, the implementation audit 15, fixes 15, the Owner's
review 10)

| Stage | State | Output |
|---|---|---|
| 2. Plan (M1, site) | Done, 100% (in review) | [`plans/2026-11-13-m1-thin-thread-site.md`](plans/2026-11-13-m1-thin-thread-site.md) |
| 3. Plan audit | Done, 100% (in review) | [`audits/2026-11-13-m1-site-plan-audit.md`](audits/2026-11-13-m1-site-plan-audit.md) |
| 4. Execution | In progress, 52% (Tasks 1 to 4 done; 5 to 7 in CI; 8 waits for the Owner) | the plan, ticked as it goes; [pull request 3](https://github.com/mcthaydt/AutomataFrameworkSite/pull/3) |
| 5. Implementation audit | Not started | `audits/2026-11-13-m1-site-implementation-audit.md` |
| 6. Fixes | Not started | |
| 7. Owner review | Not started | |

### Log

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
