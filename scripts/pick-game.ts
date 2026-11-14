// Thin wrapper for the `pick` job: asks GitHub which commit of the game passed, reads what the live site shows, decides
// and writes `game=`, `build=` and `deploy=` to the file GITHUB_OUTPUT names. It exits 0 whatever GitHub or the live
// site answered: a failed look-up leaves the live site as it is.
import { appendFileSync } from 'node:fs'
import {
  chooseCommit,
  decide,
  GAME_REPO,
  GitHubError,
  listCandidates,
  parseVersion,
  type SiteEvent,
  VERSION_FILE,
} from '#src/build.ts'

const env = process.env
const event = (env.GITHUB_EVENT_NAME ?? 'workflow_dispatch') as SiteEvent
// A pull request's own commit, not the merge commit GITHUB_SHA names for it.
const site = (event === 'pull_request' ? env.PR_HEAD_SHA : env.GITHUB_SHA) ?? 'dev'

let picked: string | undefined
try {
  const token = env.GH_TOKEN
  picked = chooseCommit(
    await listCandidates({ repo: GAME_REPO, branch: 'main', limit: 10, ...(token ? { token } : {}) }),
  )
} catch (error) {
  console.log(error instanceof GitHubError ? error.message : `Could not ask GitHub: ${String(error)}`)
}

let live: ReturnType<typeof parseVersion>
try {
  const response = await fetch(`${env.SITE_URL}/${VERSION_FILE}`)
  if (response.ok) live = parseVersion(await response.text())
} catch {
  // The live site may not exist yet, or may be unreachable. Either way there is no last good game to keep.
}

const decision = decide({ event, site, picked, live, hostReady: env.HOST_READY === 'true' })
console.log(decision.reason)

if (env.GITHUB_OUTPUT) {
  appendFileSync(
    env.GITHUB_OUTPUT,
    `game=${decision.game ?? ''}\nbuild=${decision.build}\ndeploy=${decision.deploy}\n`,
  )
}
