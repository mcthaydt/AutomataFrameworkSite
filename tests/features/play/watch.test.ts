import { expect, test } from 'vitest'
import { NEAR, type NearWindow, whenNear } from '#src/features/play/watch.ts'

/** A window that has or has not loaded, whose observer hands its callback and options to the test. */
function windowWith(readyState: string, observing = true) {
  const seen = {
    options: undefined as unknown,
    watched: [] as unknown[],
    disconnected: 0,
    call: (_: { isIntersecting: boolean }[]) => {},
    loaded: undefined as (() => void) | undefined,
    removed: 0,
  }
  class FakeObserver {
    constructor(callback: (entries: { isIntersecting: boolean }[]) => void, options: unknown) {
      seen.options = options
      seen.call = callback
    }
    observe(target: unknown) {
      seen.watched.push(target)
    }
    disconnect() {
      seen.disconnected++
    }
  }
  const win = {
    document: { readyState },
    ...(observing ? { IntersectionObserver: FakeObserver } : {}),
    addEventListener: (_type: string, listener: () => void) => {
      seen.loaded = listener
    },
    removeEventListener: () => {
      seen.removed++
    },
  } as unknown as NearWindow
  return { win, seen }
}

const root = {} as Element

test("it waits for the page to load, then for the game's place to be within a window's height", () => {
  const { win, seen } = windowWith('loading')
  let went = 0
  whenNear(win, root, () => went++)
  expect(seen.watched).toEqual([]) // not watching anything before the load
  seen.loaded?.()
  expect(seen.watched).toEqual([root])
  expect(seen.options).toEqual({ rootMargin: `${NEAR} 0px ${NEAR} 0px` })
  seen.call([{ isIntersecting: false }])
  expect(went).toBe(0)
  seen.call([{ isIntersecting: true }])
  expect(went).toBe(1)
  expect(seen.disconnected).toBe(1)
})

test('a page that has loaded already starts watching at once', () => {
  const { win, seen } = windowWith('complete')
  whenNear(win, root, () => {})
  expect(seen.watched).toEqual([root])
})

test('a browser that cannot tell what is in view goes as soon as the page has loaded', () => {
  const { win, seen } = windowWith('loading', false)
  let went = 0
  whenNear(win, root, () => went++)
  expect(went).toBe(0)
  seen.loaded?.()
  expect(went).toBe(1)
})

test('cancelled, it never goes', () => {
  const { win, seen } = windowWith('loading')
  let went = 0
  const cancel = whenNear(win, root, () => went++)
  cancel()
  seen.loaded?.()
  expect(went).toBe(0)
  expect(seen.removed).toBe(1)
})
