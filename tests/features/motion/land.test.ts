import { expect, test } from 'vitest'
import { LANDING, type LandingWindow, landStamps, WHOLLY_IN } from '#src/features/motion/land.ts'

/** A stamp that remembers the attributes set on it. */
const stamp = (): Element & { got: Record<string, string> } => {
  const got: Record<string, string> = {}
  return {
    got,
    setAttribute: (name: string, value: string) => {
      got[name] = value
    },
  } as never
}

/** A window whose observer hands its callback and options to the test, and records what it was asked to watch. */
function windowWith(stamps: Element[], reduced = false) {
  const seen = {
    watched: [] as Element[],
    stopped: [] as Element[],
    options: undefined as unknown,
    call: (_: unknown[]) => {},
  }
  class FakeObserver {
    constructor(callback: (entries: unknown[]) => void, options: unknown) {
      seen.options = options
      seen.call = callback
    }
    observe(target: Element) {
      seen.watched.push(target)
    }
    unobserve(target: Element) {
      seen.stopped.push(target)
    }
  }
  const win = {
    document: { querySelectorAll: (selector: string) => (selector === '.stamp.works' ? stamps : []) },
    IntersectionObserver: FakeObserver,
    matchMedia: () => ({ matches: reduced }),
  } as unknown as LandingWindow
  return { win, seen }
}

test('a stamp waits out of sight until the whole of it is in the window, then lands, once', () => {
  const one = stamp()
  const { win, seen } = windowWith([one])
  expect(landStamps(win)).toBe(1)
  expect(one.got[LANDING]).toBe('waiting')
  expect(seen.options).toEqual({ threshold: WHOLLY_IN })
  expect(WHOLLY_IN).toBeGreaterThanOrEqual(0.9)
  // Partly in view is not in view: nothing lands for an entry that is not intersecting.
  seen.call([{ isIntersecting: false, target: one }])
  expect(one.got[LANDING]).toBe('waiting')
  seen.call([{ isIntersecting: true, target: one }])
  expect(one.got[LANDING]).toBe('landed')
  expect(seen.stopped).toEqual([one])
})

test('where a device asks for less motion nothing waits: the stamp is simply there', () => {
  const one = stamp()
  const { win, seen } = windowWith([one], true)
  expect(landStamps(win)).toBe(0)
  expect(one.got[LANDING]).toBeUndefined()
  expect(seen.watched).toEqual([])
})

test('a browser that cannot say what is in view hides nothing', () => {
  const one = stamp()
  const { win } = windowWith([one])
  expect(landStamps({ document: win.document, matchMedia: win.matchMedia })).toBe(0)
  expect(one.got[LANDING]).toBeUndefined()
})
