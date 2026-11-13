import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

// These checks read the workflow's text because the workflow only runs on GitHub.
const ci = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8')

test('the workflow as a whole can only read the repository', () => {
  expect(ci.slice(0, ci.indexOf('\njobs:'))).toMatch(/^permissions:\n {2}contents: read$/m)
})

test('every action is pinned to a commit', () => {
  const uses = ci.match(/^\s+- uses: \S+/gm) ?? []
  expect(uses.length).toBeGreaterThan(0)
  expect(ci.match(/^\s+- uses: \S+@[0-9a-f]{40} # v\S+$/gm) ?? []).toHaveLength(uses.length)
})
