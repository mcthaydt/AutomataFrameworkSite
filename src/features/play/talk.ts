// The two messages between the page and the game's frame, the page's side. The game says what it is doing,
// `{ automata: 'state', state }`, and the page says one thing back, `{ automata: 'play' }`: "a person has pressed Play".
// Both travel only between this page and the game at its own address, and each side checks who sent what it hears, so
// no other page or frame can make the game start or the page believe it has. The words of the messages are the game's
// (its `handover.ts`); they are written out here because the site never imports the game.

/** The part of a window this file uses, so a test can stand in for one. */
export interface TalkWindow {
  /** The site's own origin, which is the game's too: the game is served from `/play/`. */
  readonly origin: string
  addEventListener(type: 'message', listener: (event: MessageEvent) => void): void
  removeEventListener(type: 'message', listener: (event: MessageEvent) => void): void
}

/** The part of a frame this file uses. */
export interface TalkFrame {
  readonly contentWindow: { postMessage(message: unknown, targetOrigin: string): void } | null
}

/**
 * Calls `onState` with the state in each message that comes from `frame`'s own window, at this site's origin, and has
 * the shape `{ automata: 'state', state: <text> }`. Anything else is ignored. Returns a function that stops listening.
 */
export function listenToGame(
  win: TalkWindow,
  frame: TalkFrame,
  onState: (state: string) => void,
): () => void {
  const listener = (event: MessageEvent): void => {
    if (frame.contentWindow === null || event.source !== frame.contentWindow) return
    if (event.origin !== win.origin) return
    const data: unknown = event.data
    if (typeof data !== 'object' || data === null) return
    const message = data as { automata?: unknown; state?: unknown }
    if (message.automata !== 'state' || typeof message.state !== 'string') return
    onState(message.state)
  }
  win.addEventListener('message', listener)
  return () => win.removeEventListener('message', listener)
}

/** Tells the game in `frame`, and only at `origin`, that a person has pressed Play. */
export function tellGameToPlay(frame: TalkFrame, origin: string): void {
  frame.contentWindow?.postMessage({ automata: 'play' }, origin)
}
