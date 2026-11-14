// When the game that plays itself is asked for, and for whom. It is not asked for while the page arrives, so the page
// opens as fast on a slow phone connection as it did before, and the picture is there first. It is asked for once the
// page has loaded, the game's place is within a window's height of the window, and the browser has a moment to spare,
// so the work of reading and compiling the game never lands on a visitor's first scroll. Every visitor gets it, whatever
// their device says about motion (the Owner, 2026-11-14: it plays for everyone, as the game's own page does), except one
// who has asked their device to save data: they keep the picture until they press Play, as before the game could watch
// (the Owner, 2026-11-14, Q-C b), because the game is about 1.5 MB.

/** How far from the window, as a share of the window's height, the game's place may be and still be near. */
export const NEAR = '100%'
/** How long the browser may stay busy before the game is asked for anyway, in milliseconds. */
export const IDLE_WAIT = 2000
/** Where a browser with no idle time (Safari has none to ask for) waits after the page has loaded, in milliseconds. */
export const IDLE_FALLBACK = 250

/** The part of a window `mayWatch` reads, so a test can stand in for one. */
export interface DeviceWindow {
  readonly navigator: object
}

/** Whether this visitor's device has not asked to save data. */
export function mayWatch(win: DeviceWindow): boolean {
  // `navigator.connection` is not in every browser's types (Firefox and Safari have none), so it is read as what it is.
  const { connection } = win.navigator as { connection?: { saveData?: boolean } }
  return connection?.saveData !== true
}

/** The part of a window `whenNear` uses, so a test can stand in for one. */
export interface NearWindow {
  readonly document: { readonly readyState: string }
  readonly IntersectionObserver?: typeof IntersectionObserver
  readonly requestIdleCallback?: (callback: () => void, options: { timeout: number }) => number
  setTimeout(callback: () => void, milliseconds: number): number
  addEventListener(type: 'load', listener: () => void, options: { once: boolean }): void
  removeEventListener(type: 'load', listener: () => void): void
}

/**
 * Calls `go` once, when the page has loaded, `root` is within one window's height of the window and the browser is
 * idle (or has been busy for `IDLE_WAIT`). In a browser that cannot tell what is in view the game's place counts as
 * near. Returns a function that cancels the wait.
 */
export function whenNear(win: NearWindow, root: Element, go: () => void): () => void {
  let observer: IntersectionObserver | undefined
  let cancelled = false
  const idle = (): void => {
    if (cancelled) return
    const done = (): void => {
      if (!cancelled) go()
    }
    if (win.requestIdleCallback !== undefined) win.requestIdleCallback(done, { timeout: IDLE_WAIT })
    else win.setTimeout(done, IDLE_FALLBACK)
  }
  const near = (): void => {
    if (cancelled) return
    const Observer = win.IntersectionObserver
    if (Observer === undefined) {
      idle()
      return
    }
    observer = new Observer(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer?.disconnect()
        idle()
      },
      { rootMargin: `${NEAR} 0px ${NEAR} 0px` },
    )
    observer.observe(root)
  }
  if (win.document.readyState === 'complete') near()
  else win.addEventListener('load', near, { once: true })
  return () => {
    cancelled = true
    win.removeEventListener('load', near)
    observer?.disconnect()
  }
}
