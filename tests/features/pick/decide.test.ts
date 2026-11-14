import { expect, test } from 'vitest'
import { type Decision, decide } from '#src/features/pick/pick.ts'

const SITE = 'c'.repeat(40)
const OLD = 'd'.repeat(40)
const A = 'a'.repeat(40)
const B = 'b'.repeat(40)
const base = {
  event: 'push',
  site: SITE,
  ref: 'refs/heads/main',
  picked: A,
  live: undefined,
  hostReady: true,
} as const

test('rule 1: with no game at all there is nothing to build', () =>
  expect(decide({ ...base, picked: undefined })).toEqual({
    game: undefined,
    build: false,
    deploy: false,
    reason: 'No commit of the game has passed its checks yet, so there is nothing to show.',
  } satisfies Decision))

test('rule 2: a pull request is built and never deployed', () =>
  expect(decide({ ...base, event: 'pull_request' })).toEqual({
    game: A,
    build: true,
    deploy: false,
    reason: 'A pull request is built and tested with the real game, and never deployed.',
  } satisfies Decision))

test('rule 3: a scheduled run does nothing until the site can be hosted', () =>
  expect(decide({ ...base, event: 'schedule', hostReady: false })).toEqual({
    game: A,
    build: false,
    deploy: false,
    reason:
      'The site is not live yet: the Owner has not added CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID.',
  } satisfies Decision))

test('rule 4: a scheduled run does nothing when the live site already shows this', () =>
  expect(decide({ ...base, event: 'schedule', live: { site: SITE, game: A } })).toEqual({
    game: A,
    build: false,
    deploy: false,
    reason: 'The live site already shows this site and this game.',
  } satisfies Decision))

test('rule 5: otherwise it builds, and deploys when the site can be hosted', () => {
  expect(decide(base)).toEqual({
    game: A,
    build: true,
    deploy: true,
    reason: 'Building the site at ccccccc with the game at aaaaaaa.',
  } satisfies Decision)
  expect(decide({ ...base, hostReady: false })).toEqual({
    game: A,
    build: true,
    deploy: false,
    reason:
      'Building the site at ccccccc with the game at aaaaaaa. It will not be deployed: the Owner has not added CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID.',
  } satisfies Decision)
})

test('rule 2b: a run on any branch but main is built and never deployed, even when the site can be hosted', () => {
  const reason = 'This run is on "some-branch", not main, so the site is built and tested but never deployed.'
  for (const event of ['workflow_dispatch', 'push', 'repository_dispatch', 'schedule'] as const) {
    expect(decide({ ...base, event, ref: 'refs/heads/some-branch' })).toEqual({
      game: A,
      build: true,
      deploy: false,
      reason,
    } satisfies Decision)
  }
  // A tag, or no ref at all, is not main either.
  expect(decide({ ...base, ref: 'refs/tags/v1' }).deploy).toBe(false)
  expect(decide({ ...base, ref: '' }).deploy).toBe(false)
})

test('when GitHub cannot be asked, the last good game is kept', () =>
  expect(decide({ ...base, picked: undefined, live: { site: OLD, game: B } })).toMatchObject({
    game: B,
    build: true,
    deploy: true,
  }))

test('a new game on a schedule is built and deployed', () =>
  expect(decide({ ...base, event: 'schedule', picked: A, live: { site: SITE, game: B } })).toMatchObject({
    game: A,
    build: true,
    deploy: true,
  }))

test('a live version that is not a commit is never reused', () =>
  expect(decide({ ...base, picked: undefined, live: { site: OLD, game: 'fixture' } })).toMatchObject({
    game: undefined,
    build: false,
    deploy: false,
    reason: 'No commit of the game has passed its checks yet, so there is nothing to show.',
  }))
