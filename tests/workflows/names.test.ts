import { expect, test } from 'vitest'
import { checkNames, readWorkflow } from './read.ts'

// GitHub matches a required check by its name alone, and `main`'s required checks are `ci`'s. If `site` had a job of the
// same name, which one counted would be up to chance, and `site` skips its jobs when no game has passed yet (a skipped
// job reports success).
const ci = checkNames(readWorkflow('ci.yml'))
const site = checkNames(readWorkflow('site.yml'))

test('`ci` keeps the names `main` requires', () => {
  expect(ci).toEqual(expect.arrayContaining(['check', 'build', 'journeys / engines']))
})

test('no check of `site` has the name of a check of `ci`', () => {
  expect(site.filter((name) => ci.includes(name))).toEqual([])
})

test('`site` names its real-game jobs for what they are', () => {
  expect(site).toEqual(expect.arrayContaining(['build-real', 'journeys-real / engines']))
})
