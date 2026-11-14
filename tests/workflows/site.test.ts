import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { expr, head, job, readWorkflow } from './read.ts'

// These checks read the `site` workflow's text because a workflow only runs on GitHub.
const site = readWorkflow('site.yml')
const pick = job(site, 'pick')
const build = job(site, 'build')
const deploy = job(site, 'deploy')
const live = job(site, 'live')

test('it starts on exactly these five events, and looks for a new game every 10 minutes', () => {
  const on = head(site).slice(head(site).indexOf('\non:'), head(site).indexOf('\npermissions:'))
  const events = [...on.matchAll(/^ {2}(\w+):/gm)].map((m) => m[1])
  expect(events).toEqual(['pull_request', 'push', 'schedule', 'workflow_dispatch', 'repository_dispatch'])
  expect(on).toContain("- cron: '*/10 * * * *'")
  expect(on).toContain('types: [game-changed]')
})

test('the workflow as a whole can only read the repository', () => {
  expect(head(site)).toMatch(/^permissions:\n {2}contents: read$/m)
})

test('a run in progress is never cancelled, because it may be part way through a deploy', () => {
  expect(head(site)).toContain(`group: site-${expr('github.ref')}\n  cancel-in-progress: false`)
})

test('every action is pinned to a commit', () => {
  const uses = site.match(/^\s+- uses: \S+/gm) ?? []
  expect(uses.length).toBeGreaterThan(0)
  expect(site.match(/^\s+- uses: \S+@[0-9a-f]{40} # v\S+$/gm) ?? []).toHaveLength(uses.length)
})

test('only the deploy job is given the Cloudflare token', () => {
  // Twice: once as a yes-or-no in `pick`, once as the secret itself in `deploy`.
  expect(site.match(/secrets\.CLOUDFLARE_API_TOKEN/g)).toHaveLength(2)
  expect(pick).toContain("secrets.CLOUDFLARE_API_TOKEN != ''")
  expect(deploy).toContain(`CLOUDFLARE_API_TOKEN: ${expr('secrets.CLOUDFLARE_API_TOKEN')}`)
  expect(build).not.toContain('CLOUDFLARE')
  expect(live).not.toContain('CLOUDFLARE')
})

test('the site counts as hostable only when both Cloudflare settings exist', () => {
  expect(pick).toContain(
    `HOST_READY: ${expr("secrets.CLOUDFLARE_API_TOKEN != '' && vars.CLOUDFLARE_ACCOUNT_ID != ''")}`,
  )
})

test('the deploy job never checks out or builds the game', () => {
  expect(deploy).not.toContain('AutomataFrameworkExamples')
  expect(deploy).not.toContain('pnpm build')
})

test('nothing is deployed unless the journeys passed against the real game', () => {
  expect(deploy).toMatch(/needs: \[pick, journeys\]/)
  expect(job(site, 'journeys')).toContain('needs: build')
  expect(job(site, 'journeys')).toContain('uses: ./.github/workflows/journeys.yml')
})

test('a pull request is never deployed: deploy asks only what `pick` decided', () => {
  // `decide` is tested in tests/features/pick; here, that the job obeys it and nothing else.
  expect(deploy).toContain(`if: needs.pick.outputs.deploy == 'true'`)
  expect(deploy.match(/^ {4}if:/gm)).toHaveLength(1)
})

test('the game is checked out at the picked commit, without credentials', () => {
  const game = build.slice(build.indexOf('repository: mcthaydt/AutomataFrameworkExamples'))
  expect(game).toContain(`ref: ${expr('needs.pick.outputs.game')}`)
  expect(game.slice(0, game.indexOf('- uses: pnpm/action-setup'))).toContain('persist-credentials: false')
})

test('pnpm and Node are told where the two folders are, since there is no package.json at the root', () => {
  expect(build).toContain('package_json_file: site/package.json')
  expect(build).toMatch(/cache-dependency-path: \|\n\s+site\/pnpm-lock\.yaml\n\s+game\/pnpm-lock\.yaml/)
})

test('the build stops, in words, if the game and the site use different pnpm', () => {
  expect(build).toContain('Stop and tell the coordinator.')
})

test('two deploys never run at once', () => {
  expect(deploy).toContain('concurrency:\n      group: deploy\n      cancel-in-progress: false')
})

test('the address is written once and matches the project name in wrangler.toml', () => {
  expect(site.match(/automataframework\.pages\.dev/g)).toHaveLength(1)
  const wrangler = readFileSync(new URL('../../wrangler.toml', import.meta.url), 'utf8')
  const project = /^name = "(.+)"$/m.exec(wrangler)?.[1]
  expect(project).toBe('automataframework')
  expect(site).toContain(`wrangler pages project create ${project} --production-branch main`)
  expect(site).toContain(`wrangler pages deploy dist --project-name ${project} --branch main`)
})

test('the live job waits for this build first and alone, then runs the other journeys', () => {
  const wait = live.indexOf('tests/journeys/live.journey.ts')
  const rest = live.indexOf('--grep-invert')
  expect(wait).toBeGreaterThan(0)
  expect(rest).toBeGreaterThan(wait)
  expect(live).toContain('needs: [pick, deploy]')
})
