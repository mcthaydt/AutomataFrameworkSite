// Whether a run of the `site` workflow builds the site, and whether it then deploys it.
import { isCommit, shortCommit, type Version } from '../version/version.ts'

export type SiteEvent = 'pull_request' | 'push' | 'schedule' | 'workflow_dispatch' | 'repository_dispatch'

export interface Decision {
  /** The game commit to build, when there is one. */
  readonly game: string | undefined
  /** Build the site around the game and run the journeys. */
  readonly build: boolean
  /** Then upload it. */
  readonly deploy: boolean
  /** One plain sentence, printed in the run. */
  readonly reason: string
}

const NOT_READY = 'the Owner has not added CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID'
/** The only ref whose runs may put the site live: `main`, and nothing else a person can start a run on. */
const DEPLOY_REF = 'refs/heads/main'

/**
 * The game is `picked`, or else the live site's game when that is a real commit (the last good game, kept when GitHub
 * could not be asked). That can step back to an older game than the live one, for instance when the newest commit's
 * checks were re-run and failed; it is still a checked commit, which is the rule that matters: only a checked game is shown.
 */
export function decide(input: {
  readonly event: SiteEvent
  /** This run's commit of the site. */
  readonly site: string
  /** The ref the run started on (`GITHUB_REF`), such as `refs/heads/main`. A hand-started run can be on any branch. */
  readonly ref: string
  /** `chooseCommit`'s answer; undefined when none passed or GitHub could not be asked. */
  readonly picked: string | undefined
  /** The live site's version.json, if it could be read. */
  readonly live: Version | undefined
  /** Both Cloudflare settings exist, so the site can be hosted. */
  readonly hostReady: boolean
}): Decision {
  const { event, site, ref, picked, live, hostReady } = input
  const game = picked ?? (live !== undefined && isCommit(live.game) ? live.game : undefined)
  const no = (reason: string): Decision => ({ game, build: false, deploy: false, reason })

  if (game === undefined)
    return no('No commit of the game has passed its checks yet, so there is nothing to show.')
  if (event === 'pull_request') {
    return {
      game,
      build: true,
      deploy: false,
      reason: 'A pull request is built and tested with the real game, and never deployed.',
    }
  }
  if (ref !== DEPLOY_REF) {
    // Only `main` has been reviewed. A branch is built and tested with the real game, but never put live.
    const branch = ref.replace(/^refs\/heads\//, '')
    return {
      game,
      build: true,
      deploy: false,
      reason: `This run is on "${branch}", not main, so the site is built and tested but never deployed.`,
    }
  }
  if (event === 'schedule' && !hostReady) return no(`The site is not live yet: ${NOT_READY}.`)
  if (event === 'schedule' && live?.site === site && live.game === game) {
    return no('The live site already shows this site and this game.')
  }
  const building = `Building the site at ${shortCommit(site)} with the game at ${shortCommit(game)}.`
  return {
    game,
    build: true,
    deploy: hostReady,
    reason: hostReady ? building : `${building} It will not be deployed: ${NOT_READY}.`,
  }
}
