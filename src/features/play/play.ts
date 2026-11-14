// The Play buttons and the game's frame. Nothing of the game loads until a person presses a button, so the page opens
// fast on a slow phone connection and the game's sound and input never start by themselves. Under the buttons, the
// game's own picture holds the place until the game plays.

/** Where the built game lives on the site. */
export const GAME_ADDRESS = '/play/'
/** The frame's title, which a screen reader reads out. */
export const FRAME_TITLE = 'The demo game'

/** `ready`: the picture shows. `loading`: the frame has been added and has not finished loading. `playing`: it has. */
export type PlayState = 'ready' | 'loading' | 'playing'

export interface Player {
  readonly state: PlayState
  destroy(): void
}

/**
 * `root` is the page's `#game`, which holds the game's picture and, once a button is pressed, the frame. `buttons` are
 * every Play button on the page; `status` is the sheet's loading note, which lives beside the picture and never over it.
 */
export function createPlayer(
  root: HTMLElement,
  buttons: readonly HTMLButtonElement[],
  status: HTMLElement | null,
): Player {
  const sheet = root.closest<HTMLElement>('.sheet') ?? root
  let state: PlayState = 'ready'
  let frame: HTMLIFrameElement | undefined

  const setState = (next: PlayState): void => {
    state = next
    root.dataset.state = next
  }

  const onLoad = (): void => {
    setState('playing')
    if (status) status.hidden = true
    // The keys must reach the game with no second click, so the frame takes the keyboard.
    frame?.focus()
    frame?.contentWindow?.focus()
    // On a phone the game is below the heading; bring it up to fill the window.
    root.scrollIntoView({ block: 'start' })
  }

  const onPress = (): void => {
    // A press while the game loads or plays goes back to the game and starts no second one (a double tap is the same).
    if (state !== 'ready') {
      root.scrollIntoView({ block: 'start' })
      frame?.focus()
      return
    }
    setState('loading')
    // The buttons on the sheet have done their job; the ones elsewhere stay, and lead back to the game.
    for (const button of buttons) if (sheet.contains(button)) button.hidden = true
    if (status) status.hidden = false
    frame = root.ownerDocument.createElement('iframe')
    frame.title = FRAME_TITLE
    frame.addEventListener('load', onLoad, { once: true })
    frame.src = GAME_ADDRESS
    root.append(frame)
    // A press far from the game is seen to do something: the sheet, and its loading note, come into the window.
    sheet.scrollIntoView({ block: 'start' })
  }

  setState('ready')
  for (const button of buttons) {
    button.hidden = false
    button.addEventListener('click', onPress)
  }

  return {
    get state() {
      return state
    },
    destroy() {
      for (const button of buttons) button.removeEventListener('click', onPress)
      frame?.remove()
    },
  }
}
