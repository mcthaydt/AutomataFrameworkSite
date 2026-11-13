// The entry of the `pick` feature: which commit of the game to show, and whether this run should deploy.

export type { Candidate, CheckRun } from './choose.ts'
export { chooseCommit, REQUIRED_CHECKS } from './choose.ts'
export type { Decision, SiteEvent } from './decide.ts'
export { decide } from './decide.ts'
export { GitHubError, listCandidates } from './github.ts'
