import { expect, test } from 'vitest'
import { chooseCommit, REQUIRED_CHECKS } from '#src/features/pick/pick.ts'

const run = (name: string, conclusion: string | null = 'success', status = 'completed') => ({
  name,
  status,
  conclusion,
})
const green = REQUIRED_CHECKS.map((name) => run(name))
const A = 'a'.repeat(40)
const B = 'b'.repeat(40)

test('the required checks are the four the game names', () =>
  expect(REQUIRED_CHECKS).toEqual(['check', 'engines (chromium)', 'engines (webkit)', 'engines (firefox)']))

test('the newest commit whose required checks all passed is chosen', () =>
  expect(
    chooseCommit([
      { sha: A, checks: green },
      { sha: B, checks: green },
    ]),
  ).toBe(A))

test('a commit still being checked is passed over', () =>
  expect(
    chooseCommit([
      {
        sha: A,
        checks: green.map((c) => (c.name === 'engines (webkit)' ? run(c.name, null, 'in_progress') : c)),
      },
      { sha: B, checks: green },
    ]),
  ).toBe(B))

test('a commit with a failed check is passed over', () =>
  expect(
    chooseCommit([
      { sha: A, checks: green.map((c) => (c.name === 'check' ? run(c.name, 'failure') : c)) },
      { sha: B, checks: green },
    ]),
  ).toBe(B))

test('a commit missing one required check is passed over', () =>
  expect(
    chooseCommit([
      { sha: A, checks: green.slice(0, 3) },
      { sha: B, checks: green },
    ]),
  ).toBe(B))

test('checks that are not required do not count either way', () =>
  expect(chooseCommit([{ sha: A, checks: [...green, run('screens', 'failure')] }])).toBe(A))

test('no candidate that passed gives undefined; so does an empty list', () => {
  expect(chooseCommit([{ sha: A, checks: green.slice(0, 2) }])).toBeUndefined()
  expect(chooseCommit([])).toBeUndefined()
})
