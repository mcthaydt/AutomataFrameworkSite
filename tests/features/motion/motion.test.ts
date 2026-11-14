import { expect, test } from 'vitest'
import { anchorId, SUBTLE } from '#src/features/motion/motion.ts'

test('the smoothing is a quick ease, left off touch, and on for everyone', () => {
  // Lenis's own is 0.1 (a slow glide). Subtle is quicker than that, and still a real ease.
  expect(SUBTLE.lerp).toBeGreaterThan(0.1)
  expect(SUBTLE.lerp).toBeLessThanOrEqual(0.3)
  expect(SUBTLE.syncTouch).toBe(false)
  expect(SUBTLE.wheelMultiplier).toBe(1)
  // The Owner (2026-11-14): "No need for a motion off".
  expect(SUBTLE.respectReducedMotion).toBe(false)
})

test('a link to a place on the page names its id', () => {
  expect(anchorId('#today')).toBe('today')
  expect(anchorId('#a%20b')).toBe('a b')
})

test('any other address is not a place on this page', () => {
  expect(anchorId(null)).toBeUndefined()
  expect(anchorId('#')).toBeUndefined()
  expect(anchorId('/licences.txt')).toBeUndefined()
  expect(anchorId('https://example.com/#today')).toBeUndefined()
  expect(anchorId('#%E0%A4%A')).toBeUndefined()
})
