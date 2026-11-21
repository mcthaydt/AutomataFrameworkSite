import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { expr, head, job, readWorkflow } from './read.ts'

// These checks read the workflows' text because a workflow only runs on GitHub.
const ci = readWorkflow('ci.yml')
const journeys = readWorkflow('journeys.yml')

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

test("the build has Chromium before it builds, because the build takes the site's pictures", () => {
  const build = job(ci, 'build')
  // Installed before the build, or ready-made in Playwright's own image (how is `ci.yml`'s own pull request's call).
  const image = /\n {4}container:\n {6}image: mcr\.microsoft\.com\/playwright:/.test(build)
  if (!image) {
    expect(build).toContain('pnpm exec playwright install --with-deps chromium')
    expect(build.indexOf('playwright install')).toBeGreaterThan(
      build.indexOf('pnpm install --frozen-lockfile'),
    )
    expect(build.indexOf('playwright install')).toBeLessThan(build.indexOf('run: pnpm build'))
  }
})

// A job that drives a browser and runs in a container runs in Playwright's own image, whose tag is the lockfile's
// `@playwright/test`, pinned by digest, so it installs no browser or system library from the runner's package mirror
// (whose slow days hung `install-deps` until the job's timeout).
const playwright = (
  JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
    devDependencies: Record<string, string>
  }
).devDependencies['@playwright/test']
const image = new RegExp(
  `\\n {4}container:\\n {6}image: mcr\\.microsoft\\.com/playwright:v${playwright?.replaceAll('.', '\\.')}-noble@sha256:[0-9a-f]{64}\\n {6}options: --user 1001\\n`,
)

test.each([
  ['the build', () => job(ci, 'build')],
  ['the journeys', () => job(journeys, 'shards')],
])(
  '%s, when it runs in a container, runs in the Playwright image pinned by digest and installs no browser',
  (_, read) => {
    expect(playwright).toMatch(/^\d+\.\d+\.\d+$/)
    const text = read()
    if (!/\n {4}container:/.test(text)) return
    expect(text).toMatch(image)
    expect(text).toContain(`test "$(pnpm exec playwright --version)" = "Version ${playwright}"`)
    const commands = text.split('\n').filter((line) => !line.trim().startsWith('#'))
    expect(commands.filter((line) => /playwright install|install-deps/.test(line))).toEqual([])
  },
)

test('nothing may write, and nothing pushes a branch (the pictures are artifacts only)', () => {
  for (const text of [ci, journeys, readWorkflow('site.yml')]) expect(text).not.toContain('git push')
  expect(ci).not.toContain('contents: write')
  expect(journeys).not.toContain('contents: write')
  expect(journeys).not.toContain('\n  screens:')
  expect(job(ci, 'journeys')).toMatch(/^ {6}actions: read$/m)
})

test('the called workflow is given the artifact', () => {
  expect(head(journeys)).toMatch(/workflow_call:\n {4}inputs:\n {6}site-artifact:/)
})

test('the journeys run per engine in two shards, and each engine has one check that no other cancels', () => {
  const engines = job(journeys, 'engines')
  expect(engines).toContain('engine: [chromium, webkit, firefox]')
  expect(engines).toContain('fail-fast: false')
  const shards = job(journeys, 'shards')
  expect(shards).toContain('shard: [1, 2]')
  expect(shards).toContain(
    `pnpm test:journeys --project ${expr('matrix.engine')} --shard=${expr('matrix.shard')}/2`,
  )
})

// Audit F7: a journey failed once on code that had just passed and the run kept nothing to say why.
test('a failed journey leaves its trace and its error behind, for every engine', () => {
  const shards = job(journeys, 'shards')
  expect(shards).toMatch(
    /- uses: actions\/upload-artifact@[0-9a-f]{40} # v\S+\n {8}if: failure\(\)\n {8}with:\n {10}name: test-results-\$\{\{ matrix\.engine \}\}-\$\{\{ matrix\.shard \}\}\n {10}path: test-results\/\*\*/,
  )
})
