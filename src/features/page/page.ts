// Wires the home page: the player on the game's place, and every Play button that starts it. Everything else the page
// says (the game's version, its numbers, the claims) was written into it when the site was built.
import { createPlayer } from '../play/play.ts'

/** Starts the player on `#game`, with every Play button on the page and the sheet's loading note. */
export function startPage(doc: Document): void {
  const game = doc.getElementById('game')
  if (game === null) return
  const buttons = [...doc.querySelectorAll<HTMLButtonElement>('button[data-play]')]
  createPlayer(game, buttons, doc.querySelector<HTMLElement>('[role="status"]'))
}
