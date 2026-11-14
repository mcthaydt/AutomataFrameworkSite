// Wires the home page: the smooth scrolling, the stamp that lands, the player on the game's place, the game that plays
// itself once the page has loaded, and every Play button that starts it. Everything else the page
// says (the game's version, its numbers, the claims) was written into it when the site was built.
import { landStamps, startSmoothScroll } from '../motion/motion.ts'
import { createPlayer, whenNear } from '../play/play.ts'

/** Starts the player on `#game`, with every Play button on the page and the sheet's loading note. */
export function startPage(doc: Document): void {
  if (doc.defaultView !== null) {
    startSmoothScroll(doc.defaultView)
    landStamps(doc.defaultView)
  }
  const game = doc.getElementById('game')
  if (game === null) return
  const buttons = [...doc.querySelectorAll<HTMLButtonElement>('button[data-play]')]
  const player = createPlayer(game, buttons, doc.querySelector<HTMLElement>('[role="status"]'))
  // The picture comes first; the game that plays itself is asked for once the page has loaded and the game is near.
  if (doc.defaultView !== null) whenNear(doc.defaultView, game, () => player.watch())
}
