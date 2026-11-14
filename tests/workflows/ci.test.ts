import { expect, test } from 'vitest'
import { expr, head, job, readWorkflow } from './read.ts'

// These checks read the workflows' text because a workflow only runs on GitHub.
const ci = readWorkflow('ci.yml')
const journeys = readWorkflow('journeys.yml')
const screens = job(journeys, 'screens')

test('the workflow as a whole can only read the repository', () => {
  expect(head(ci)).toMatch(/^permissions:\n {2}contents: read$/m)
  expect(head(journeys)).toMatch(/^permissions:\n {2}contents: read$/m)
})

test('every action is pinned to a commit', () => {
  for (const text of [ci, journeys]) {
    const uses = text.match(/^\s+- uses: \S+/gm) ?? []
    expect(uses.length).toBeGreaterThan(0)
    expect(text.match(/^\s+- uses: \S+@[0-9a-f]{40} # v\S+$/gm) ?? []).toHaveLength(uses.length)
  }
})

test("the build installs Chromium before it builds, because the build takes the site's pictures", () => {
  const build = job(ci, 'build')
  expect(build).toContain('pnpm exec playwright install --with-deps chromium')
  expect(build.indexOf('playwright install')).toBeGreaterThan(build.indexOf('pnpm install --frozen-lockfile'))
  expect(build.indexOf('playwright install')).toBeLessThan(build.indexOf('run: pnpm build'))
})

test('only the call to journeys.yml may write', () => {
  const call = job(ci, 'journeys')
  expect(ci.match(/contents: write/g)).toHaveLength(1)
  expect(call).toContain('uses: ./.github/workflows/journeys.yml')
  expect(call).toMatch(/^ {6}contents: write$/m)
  expect(call).toMatch(/^ {6}actions: read$/m)
})

test('inside journeys.yml only screens asks to write, and its one push goes to ci-screens', () => {
  expect(journeys.match(/contents: write/g)).toHaveLength(1)
  expect(screens).toMatch(/^ {6}contents: write$/m)
  expect(screens).toContain('needs: engines')
  expect(journeys.match(/git push/g)).toHaveLength(1)
  expect(screens).toContain('git push -q origin ci-screens')
  expect(screens).toMatch(/group: ci-screens\n {6}cancel-in-progress: false/)
})

test('the screens job runs for every event but a pull request from a fork', () => {
  // In a called workflow `github` is the caller's, so a guard on `push` alone would skip scheduled and hand-started runs.
  expect(screens).toContain(
    "if: always() && !(github.event_name == 'pull_request' && github.event.pull_request.head.repo.full_name != github.repository)",
  )
})

test("a run of the real game never overwrites the stand-in game's pictures", () => {
  expect(screens).toContain("endsWith(inputs.latest, '-real') || inputs.latest == 'live'")
  expect(screens).toContain(`LATEST: ${expr('inputs.latest')}`)
})

test('the called workflow is given the artifact and where to put the latest pictures', () => {
  expect(head(journeys)).toMatch(/workflow_call:\n {4}inputs:\n {6}site-artifact:/)
  expect(head(journeys)).toContain('latest:')
})

test('the journeys run once per engine, none cancelling another', () => {
  const engines = job(journeys, 'engines')
  expect(engines).toContain('engine: [chromium, webkit, firefox]')
  expect(engines).toContain('fail-fast: false')
  expect(engines).toContain(`pnpm test:journeys --project ${expr('matrix.engine')}`)
})
