// When the game that plays itself is asked for. It is not asked for while the page arrives, so the page opens as fast
// on a slow phone connection as it did before, and the picture is there first. It is asked for once the page has
// loaded and the game's place is within a window's height of the window, which on every screen the page opens at is
// at once. Every visitor gets it, whatever their device says about motion or saved data (the Owner, 2026-11-14: it plays
// for everyone, as the game's own page does).

/** How far from the window, as a share of the window's height, the game's place may be and still be near. */
export const NEAR = '100%'

/** The part of a window this file uses, so a test can stand in for one. */
export interface NearWindow {
  readonly document: { readonly readyState: string }
  readonly IntersectionObserver?: typeof IntersectionObserver
  addEventListener(type: 'load', listener: () => void, options: { once: boolean }): void
  removeEventListener(type: 'load', listener: () => void): void
}

/**
 * Calls `go` once, when the page has loaded and `root` is within one window's height of the window. In a browser that
 * cannot tell what is in view it is called as soon as the page has loaded. Returns a function that cancels the wait.
 */
export function whenNear(win: NearWindow, root: Element, go: () => void): () => void {
  let observer: IntersectionObserver | undefined
  let cancelled = false
  const near = (): void => {
    if (cancelled) return
    const Observer = win.IntersectionObserver
    if (Observer === undefined) {
      go()
      return
    }
    observer = new Observer(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer?.disconnect()
        go()
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
