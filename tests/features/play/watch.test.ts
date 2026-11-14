import { expect, test } from 'vitest'
import {
  type DeviceWindow,
  IDLE_FALLBACK,
  IDLE_WAIT,
  mayWatch,
  NEAR,
  type NearWindow,
  whenNear,
} from '#src/features/play/watch.ts'

/** A window that has or has not loaded, whose observer and idle time hand their callbacks to the test. */
function windowWith(readyState: string, options: { observing?: boolean; idling?: boolean } = {}) {
  const { observing = true, idling = true } = options
  const seen = {
    options: undefined as unknown,
    watched: [] as unknown[],
    disconnected: 0,
    call: (_: { isIntersecting: boolean }[]) => {},
    loaded: undefined as (() => void) | undefined,
    removed: 0,
    idle: undefined as (() => void) | undefined,
    idleOptions: undefined as unknown,
    timer: undefined as (() => void) | undefined,
    timerWait: undefined as number | undefined,
  }
  class FakeObserver {
    constructor(callback: (entries: { isIntersecting: boolean }[]) => void, observerOptions: unknown) {
      seen.options = observerOptions
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
    ...(idling
      ? {
          requestIdleCallback: (callback: () => void, idleOptions: unknown) => {
            seen.idle = callback
            seen.idleOptions = idleOptions
            return 1
          },
        }
      : {}),
    setTimeout: (callback: () => void, wait: number) => {
      seen.timer = callback
      seen.timerWait = wait
      return 1
    },
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

test("it waits for the page to load, then for the game's place to be within a window's height, then for idle time", () => {
  const { win, seen } = windowWith('loading')
  let went = 0
  whenNear(win, root, () => went++)
  expect(seen.watched).toEqual([]) // not watching anything before the load
  seen.loaded?.()
  expect(seen.watched).toEqual([root])
  expect(seen.options).toEqual({ rootMargin: `${NEAR} 0px ${NEAR} 0px` })
  seen.call([{ isIntersecting: false }])
  expect(seen.idle).toBeUndefined()
  seen.call([{ isIntersecting: true }])
  expect(seen.disconnected).toBe(1)
  // Near is not enough: the browser must have a moment to spare, or have been busy for IDLE_WAIT.
  expect(went).toBe(0)
  expect(seen.idleOptions).toEqual({ timeout: IDLE_WAIT })
  seen.idle?.()
  expect(went).toBe(1)
})

test('a page that has loaded already starts watching at once', () => {
  const { win, seen } = windowWith('complete')
  whenNear(win, root, () => {})
  expect(seen.watched).toEqual([root])
})

test('a browser that cannot tell what is in view counts the place as near, and still waits for idle time', () => {
  const { win, seen } = windowWith('loading', { observing: false })
  let went = 0
  whenNear(win, root, () => went++)
  seen.loaded?.()
  expect(went).toBe(0)
  seen.idle?.()
  expect(went).toBe(1)
})

test('a browser with no idle time waits a short while instead', () => {
  const { win, seen } = windowWith('complete', { idling: false })
  let went = 0
  whenNear(win, root, () => went++)
  seen.call([{ isIntersecting: true }])
  expect(went).toBe(0)
  expect(seen.timerWait).toBe(IDLE_FALLBACK)
  seen.timer?.()
  expect(went).toBe(1)
})

test('cancelled, it never goes: not before the page loads, not while near, not in idle time', () => {
  const before = windowWith('loading')
  let went = 0
  whenNear(before.win, root, () => went++)()
  before.seen.loaded?.()
  expect(went).toBe(0)
  expect(before.seen.removed).toBe(1)
  expect(before.seen.watched).toEqual([])

  const waiting = windowWith('complete')
  const cancel = whenNear(waiting.win, root, () => went++)
  waiting.seen.call([{ isIntersecting: true }])
  cancel()
  waiting.seen.idle?.()
  expect(went).toBe(0)
})

test('mayWatch follows the device: only a device that asked to save data keeps the picture', () => {
  const device = (connection?: { saveData?: boolean }): DeviceWindow => ({
    navigator: connection === undefined ? {} : { connection },
  })
  expect(mayWatch(device())).toBe(true) // a browser with no such setting (Firefox, Safari)
  expect(mayWatch(device({}))).toBe(true)
  expect(mayWatch(device({ saveData: false }))).toBe(true)
  expect(mayWatch(device({ saveData: true }))).toBe(false)
})
