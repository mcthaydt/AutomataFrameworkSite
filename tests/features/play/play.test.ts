import { expect, test } from 'vitest'
import { GAME_ADDRESS, WATCH_ADDRESS } from '#src/features/play/play.ts'

test('WATCH_ADDRESS is GAME_ADDRESS with ?watch', () => {
  expect(WATCH_ADDRESS).toBe(`${GAME_ADDRESS}?watch`)
})
