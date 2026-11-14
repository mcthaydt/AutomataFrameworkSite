// The Play buttons and the game's frame. Under the buttons, the game's own picture holds the place until the game is
// there. Once the page has loaded, the game is asked for in its watching form, `?watch`: it plays a recording of itself,
// with no sound and nothing to press, in the picture's own box. A Play button, or a tap on the moving game, tells that
// same game to start for real; the frame is never loaded a second time. Where the game cannot watch (it says so, or says
// nothing) the picture stays, and Play loads the game as it always did.
import { reveal } from '../motion/motion.ts'
import { listenToGame, tellGameToPlay } from './talk.ts'

// The page asks for the watching game through this entry, as it does for everything else of the feature.
export { whenNear } from './watch.ts'

/** Where the built game lives on the site. */
export const GAME_ADDRESS = '/play/'
/** Where it lives in its watching form: the same page, which plays a recording of itself until it is told to play. */
export const WATCH_ADDRESS = `${GAME_ADDRESS}?watch`
/** The frame's title, which a screen reader reads out. */
export const FRAME_TITLE = 'The demo game'

/**
 * `ready`: the picture shows (a frame may be loading behind it). `watching`: the game plays itself in the picture's
 * place. `loading`: Play has been pressed and the game has not said it is playing. `playing`: it has.
 */
export type PlayState = 'ready' | 'watching' | 'loading' | 'playing'

export interface Player {
  readonly state: PlayState
  /** Asks for the game in its watching form, if nothing has been asked for yet. */
  watch(): void
  destroy(): void
}

/**
 * `root` is the page's `#game`, which holds the game's picture and, once there is one, the frame. `buttons` are every
 * Play button on the page; `status` is the sheet's loading note, which lives beside the picture and never over it.
 */
export function createPlayer(
  root: HTMLElement,
  buttons: readonly HTMLButtonElement[],
  status: HTMLElement | null,
): Player {
  const sheet = root.closest<HTMLElement>('.sheet') ?? root
  const win = root.ownerDocument.defaultView
  let state: PlayState = 'ready'
  let frame: HTMLIFrameElement | undefined
  let stopListening = (): void => {}

  const setState = (next: PlayState): void => {
    state = next
    root.dataset.state = next
  }

  /** The frame's page can be seen: the picture gives way to it. Until then the frame is there but hidden. */
  const showFrame = (): void => {
    root.dataset.frame = 'shown'
  }

  const dropFrame = (): void => {
    stopListening()
    stopListening = () => {}
    frame?.remove()
    frame = undefined
    delete root.dataset.frame
  }

  const toPlaying = (): void => {
    setState('playing')
    showFrame()
    if (status) status.hidden = true
    // The keys must reach the game with no second click, so the frame takes the keyboard.
    frame?.focus()
    frame?.contentWindow?.focus()
    // On a phone the game is below the heading; bring it up to fill the window.
    reveal(root)
  }

  /** What the game says it is doing. Only what makes sense in the state the page is in moves the page on. */
  const onSaid = (said: string): void => {
    if (said === 'watching' && state === 'ready') {
      setState('watching')
      showFrame()
    } else if (said === 'playing' || said === 'problem') {
      // After Play, either one means the game's own screen is the thing to show: the level, or its words about what
      // went wrong, as they would be had the game been loaded by the press itself.
      if (state === 'loading') toPlaying()
      // Before Play, the game starting by itself or failing means it cannot watch: nothing of it is left running behind
      // the picture, and Play then loads it as it always did.
      else if (state === 'ready') dropFrame()
    }
  }

  const addFrame = (address: string): HTMLIFrameElement => {
    const made = root.ownerDocument.createElement('iframe')
    made.title = FRAME_TITLE
    made.src = address
    if (win !== null) stopListening = listenToGame(win, made, onSaid)
    root.append(made)
    return made
  }

  /** Loads the game for real into the frame: a new one, or the one that is already there. */
  const loadGame = (): void => {
    // `load` means "playing" only for a frame loading the game itself; a watching frame's `load` means nothing.
    const onLoad = (): void => {
      if (state === 'loading') toPlaying()
    }
    if (frame === undefined) {
      frame = addFrame(GAME_ADDRESS)
      frame.addEventListener('load', onLoad, { once: true })
      return
    }
    // One frame, never two: the one that was loading the watching page is sent to the game instead.
    frame.addEventListener('load', onLoad, { once: true })
    frame.src = GAME_ADDRESS
  }

  const onPress = (): void => {
    // A press while the game loads or plays goes back to the game and starts no second one (a double tap is the same).
    if (state === 'loading' || state === 'playing') {
      reveal(root)
      frame?.focus()
      return
    }
    const watching = state === 'watching'
    setState('loading')
    // The buttons on the sheet have done their job; the ones elsewhere stay, and lead back to the game.
    for (const button of buttons) if (sheet.contains(button)) button.hidden = true
    if (status) status.hidden = false
    if (watching && frame !== undefined && win !== null) tellGameToPlay(frame, win.origin)
    else loadGame()
    // A press far from the game is seen to do something: the sheet, and its loading note, come into the window.
    reveal(sheet)
  }

  // A tap or click on the game that is playing itself starts it. The frame passes pointers through while it watches, so
  // the tap lands here, and a finger that drags scrolls the page, as it does anywhere else on it.
  const onTap = (): void => {
    if (state === 'watching') onPress()
  }

  setState('ready')
  for (const button of buttons) {
    button.hidden = false
    button.addEventListener('click', onPress)
  }
  root.addEventListener('click', onTap)

  return {
    get state() {
      return state
    },
    watch() {
      if (state === 'ready' && frame === undefined) frame = addFrame(WATCH_ADDRESS)
    },
    destroy() {
      for (const button of buttons) button.removeEventListener('click', onPress)
      root.removeEventListener('click', onTap)
      dropFrame()
    },
  }
}
