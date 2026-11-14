// The Play button and the game's frame. Nothing of the game loads until a person presses the button, so the page opens
// fast on a slow phone connection and the game's sound and input never start by themselves.

/** Where the built game lives on the site. */
export const GAME_ADDRESS = '/play/'
/** The frame's title, which a screen reader reads out. */
export const FRAME_TITLE = 'The demo game'

/** `ready`: the button shows. `loading`: the frame has been added and has not finished loading. `playing`: it has. */
export type PlayState = 'ready' | 'loading' | 'playing'

export interface Player {
  readonly state: PlayState
  destroy(): void
}

/** `root` is the page's `#game` section. Shows the Play button; a press swaps it for the game's frame. */
export function createPlayer(root: HTMLElement): Player {
  const button = root.querySelector<HTMLButtonElement>('button')
  const status = root.querySelector<HTMLElement>('[role="status"]')
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
    // A double tap, or a press while the game is loading, must not start a second game.
    if (state !== 'ready') return
    setState('loading')
    if (button) button.hidden = true
    if (status) status.hidden = false
    frame = root.ownerDocument.createElement('iframe')
    frame.title = FRAME_TITLE
    frame.addEventListener('load', onLoad, { once: true })
    frame.src = GAME_ADDRESS
    root.append(frame)
  }

  setState('ready')
  if (button) {
    button.hidden = false
    button.addEventListener('click', onPress)
  }

  return {
    get state() {
      return state
    },
    destroy() {
      button?.removeEventListener('click', onPress)
      frame?.remove()
    },
  }
}
