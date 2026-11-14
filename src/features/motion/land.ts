// The "Works today" stamp lands once, when it is wholly in the window (the Owner, 2026-11-14, answer to Q1). It used to
// follow the scroll and finished in the last 32 px at the window's bottom edge, where nobody looks (audit F2); now it
// waits, out of sight, until the whole stamp can be seen, and then settles on a clock, so it is always seen and never
// rests half faded. The page's own script is what hides it, so without the script, or where the device asks for less
// motion, or in a browser with no way to know what is in view, the stamp is simply there.
//
// The words that name the state live here and in `src/styles/parts.css` (`[data-landing]`).

/** The attribute that says where a stamp stands: it is `waiting` until it has landed. */
export const LANDING = 'data-landing'

/** How much of a stamp must be in the window before it lands: all of it, give or take what a tilt rounds off. */
export const WHOLLY_IN = 0.9

/** The part of a window that this file uses, so a test can stand in for one. */
export interface LandingWindow {
  readonly document: { querySelectorAll(selector: string): Iterable<Element> }
  readonly IntersectionObserver?: typeof IntersectionObserver
  matchMedia(query: string): { readonly matches: boolean }
}

/** Makes every "Works today" stamp wait until it is in view and then land. Returns how many are waiting. */
export function landStamps(win: LandingWindow): number {
  const Observer = win.IntersectionObserver
  if (Observer === undefined || win.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0
  const stamps = [...win.document.querySelectorAll('.stamp.works')]
  const observer = new Observer(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.setAttribute(LANDING, 'landed')
        // Once: a stamp that has landed is never made to wait again, however the page is scrolled.
        observer.unobserve(entry.target)
      }
    },
    { threshold: WHOLLY_IN },
  )
  for (const stamp of stamps) {
    stamp.setAttribute(LANDING, 'waiting')
    observer.observe(stamp)
  }
  return stamps.length
}
