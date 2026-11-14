import { expect, test } from 'vitest'
import {
  CLAIMS,
  type Claim,
  ClaimError,
  checkClaims,
  PROOFS,
  STAMP_WORDS,
} from '#src/features/claims/claims.ts'
import { readFacts } from '#src/features/facts/facts.ts'

const fixtureFacts = readFacts({ sourceDir: 'tests/fixtures/game-source', commit: 'fixture' })
const NODE_ONLY = { ...fixtureFacts, engines: ['Node'] }

test("there are five claims, with the spec's five titles", () =>
  expect(CLAIMS.map((claim) => claim.title)).toEqual([
    "Your agent can't quietly break your game",
    'Built for agents',
    'The part after the demo is already done',
    'Change it yourself, without another prompt',
    'Get it in front of players',
  ]))

test('a claim that works names a proof, and a claim being built names none', () => {
  for (const claim of CLAIMS) {
    if (claim.state === 'works') expect(claim.proof, claim.title).toBeDefined()
    else expect('proof' in claim, claim.title).toBe(false)
  }
})

// The Owner's answer to Q1 (2026-11-14): one claim works today and four are being built.
test('one claim works today, and the other four are being built', () => {
  expect(CLAIMS.map((claim) => [claim.id, claim.state])).toEqual([
    ['checks', 'works'],
    ['agents', 'building'],
    ['after-demo', 'building'],
    ['editors', 'building'],
    ['publish', 'building'],
  ])
})

test('every claim stamped as working holds for the stand-in game', () =>
  expect(() => checkClaims(CLAIMS, fixtureFacts)).not.toThrow())

test('same-in-every-engine holds for the stand-in game', () =>
  expect(PROOFS['same-in-every-engine'](fixtureFacts)).toBeUndefined())

test('same-in-every-engine fails when an engine is missing', () =>
  expect(PROOFS['same-in-every-engine'](NODE_ONLY)).toMatch(/Node, Chrome, Safari, Firefox/))

test('same-in-every-engine fails when there is no recorded play to run', () => {
  const none = { ...fixtureFacts, replay: { ...fixtureFacts.replay, steps: 0 } }
  expect(PROOFS['same-in-every-engine'](none)).toMatch(/recorded play/)
})

test('same-in-every-engine fails when the recorded play has no ending', () => {
  const none = { ...fixtureFacts, replay: { ...fixtureFacts.replay, ending: '' } }
  expect(PROOFS['same-in-every-engine'](none)).toMatch(/ending/)
})

test('a working claim whose proof fails stops the build, naming the claim', () => {
  expect(() => checkClaims(CLAIMS, NODE_ONLY)).toThrow(ClaimError)
  expect(() => checkClaims(CLAIMS, NODE_ONLY)).toThrow(/can't quietly break/)
})

test('a working claim with no proof stops the build', () => {
  const claim: Claim = { id: 'x', title: 'It all works', line: 'Yes.', state: 'works' }
  expect(() => checkClaims([claim], fixtureFacts)).toThrow(/It all works.*no proof/)
})

test('a claim being built is never held to a proof', () => {
  const claim: Claim = { id: 'x', title: 'Soon', line: 'Not yet.', state: 'building' }
  expect(() => checkClaims([claim], NODE_ONLY)).not.toThrow()
})

test('the stamps say exactly these words', () =>
  expect(STAMP_WORDS).toEqual({ works: 'Works today', building: 'Being built' }))
