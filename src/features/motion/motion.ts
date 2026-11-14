// Smooth, very subtle page scrolling, from Lenis (the Owner asked for it, 2026-11-14): a wheel or trackpad scroll
// eases to its place a little instead of stepping. Everything else about scrolling stays the browser's: touch is
// native, the keyboard is native, and the game's own frame keeps its wheel to itself.
import Lenis, { type LenisOptions } from 'lenis'

// The feature's entry, so the page imports all of motion from here.
export { landStamps } from './land.ts'

/**
 * How the scrolling is smoothed. `lerp` is how much of the way to its place the page goes each frame: 0.1 is Lenis's own
 * (a slow glide); 0.25, used here, is a quick ease that a person feels only as "not steppy". Touch is left to the
 * browser (`syncTouch` off). `respectReducedMotion` is off because the Owner asked for this smoothing for everyone
 * (2026-11-14: "it shouldn't be that obnoxious"); a long scroll that a press starts still jumps when the device asks for
 * less motion (see `reveal`).
 */
export const SUBTLE: LenisOptions = {
  lerp: 0.25,
  smoothWheel: true,
  wheelMultiplier: 1,
  syncTouch: false,
  respectReducedMotion: false,
  autoRaf: true,
}

/** The id a link to a place on this page names (`#today` gives `today`), or nothing for any other address. */
export function anchorId(href: string | null): string | undefined {
  if (href === null || !href.startsWith('#') || href.length < 2) return undefined
  try {
    return decodeURIComponent(href.slice(1))
  } catch {
    return undefined
  }
}

let running: { readonly lenis: Lenis; readonly reduced: MediaQueryList } | undefined

/**
 * Starts the smoothing on `win`'s page, and takes over the links to places on the page, so a press on one travels there
 * instead of jumping. Returns what stops it again.
 */
export function startSmoothScroll(win: Window): () => void {
  const doc = win.document
  const lenis = new Lenis({ ...SUBTLE, wrapper: win, content: doc.documentElement })
  running = { lenis, reduced: win.matchMedia('(prefers-reduced-motion: reduce)') }

  const onClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey)
      return
    const link = (event.target as Element | null)?.closest('a')
    const id = anchorId(link?.getAttribute('href') ?? null)
    const target = id === undefined ? null : doc.getElementById(id)
    if (target === null) return
    event.preventDefault()
    reveal(target)
    moveFocusTo(target)
    win.history.pushState(null, '', `#${id}`)
  }
  doc.addEventListener('click', onClick)

  return () => {
    doc.removeEventListener('click', onClick)
    lenis.destroy()
    running = undefined
  }
}

/**
 * Puts the keyboard, and a screen reader, where the page has just travelled to. A browser's own jump to `#today` does
 * this; the page answers the press itself, so it has to (audit F3). Without it the next Tab goes to whatever followed
 * the link that was pressed, in the top bar, and a screen reader says nothing has changed. A section is not something
 * a person tabs to, so it can take the focus but is not in the tab order (`tabindex="-1"`), and the stylesheet draws no
 * ring on it. Nothing scrolls: `reveal` already took the page there.
 */
export function moveFocusTo(target: HTMLElement): void {
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}

/**
 * Brings `target` to the top of the window, stopping short of anything its `scroll-margin-top` keeps clear (the top
 * bar). It travels there, unless the device asks for reduced motion: then it jumps, as a press always did. Without the
 * smoothing running (a page that never started it) it is the browser's own jump.
 */
export function reveal(target: HTMLElement): void {
  if (running === undefined) {
    target.scrollIntoView({ block: 'start' })
    return
  }
  const { lenis } = running
  // The page may have been moved by something other than the smoothing (a key, a scrollbar, a browser that scrolled a
  // link into view just before the press) and its scroll event may not have arrived yet. Lenis would then work from the
  // old place, and could take a press for a trip it was already on. So it is told where the page really is first.
  if (lenis.isScrolling !== 'smooth') lenis.animatedScroll = lenis.targetScroll = lenis.actualScroll
  lenis.scrollTo(target, { immediate: running.reduced.matches })
}
