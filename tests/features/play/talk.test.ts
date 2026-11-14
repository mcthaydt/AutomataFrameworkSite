import { expect, test } from 'vitest'
import { listenToGame, type TalkFrame, type TalkWindow, tellGameToPlay } from '#src/features/play/talk.ts'

const ORIGIN = 'https://automataframework.pages.dev'

/** A window that keeps its listeners, and a frame whose own window is `inside`. */
function setup() {
  const inside = { postMessage: (_message: unknown, _origin: string) => {} }
  const listeners = new Set<(event: MessageEvent) => void>()
  const win: TalkWindow = {
    origin: ORIGIN,
    addEventListener: (_type, listener) => void listeners.add(listener),
    removeEventListener: (_type, listener) => void listeners.delete(listener),
  }
  const frame: TalkFrame = { contentWindow: inside }
  const heard: string[] = []
  const stop = listenToGame(win, frame, (state) => heard.push(state))
  const send = (data: unknown, source: unknown = inside, origin = ORIGIN): void => {
    for (const listener of [...listeners]) listener({ data, source, origin } as unknown as MessageEvent)
  }
  return { inside, listeners, frame, heard, stop, send }
}

test("a state from the frame's own window at this origin is heard", () => {
  const { heard, send } = setup()
  for (const state of ['watching', 'playing', 'problem']) send({ automata: 'state', state })
  expect(heard).toEqual(['watching', 'playing', 'problem'])
})

test('a state from another window, another origin, or with other data is ignored', () => {
  const { heard, send } = setup()
  send({ automata: 'state', state: 'playing' }, {}) // another window, such as the page itself
  send({ automata: 'state', state: 'playing' }, null)
  send({ automata: 'state', state: 'playing' }, undefined, 'https://example.com')
  for (const data of [
    {},
    null,
    undefined,
    'x',
    7,
    ['state'],
    { automata: 'play' },
    { automata: 'state' },
    { automata: 'state', state: 4 },
  ])
    send(data)
  expect(heard).toEqual([])
})

test('nothing is heard once it has stopped, or from a frame with no window', () => {
  const { heard, listeners, send, stop, frame } = setup()
  stop()
  expect(listeners.size).toBe(0)
  send({ automata: 'state', state: 'playing' })
  expect(heard).toEqual([])
  const gone = setup()
  ;(gone.frame as { contentWindow: unknown }).contentWindow = null
  gone.send({ automata: 'state', state: 'playing' }, null)
  expect(gone.heard).toEqual([])
  expect(frame.contentWindow).not.toBeNull()
})

test('tellGameToPlay posts exactly { automata: "play" } to this origin', () => {
  const sent: unknown[][] = []
  tellGameToPlay({ contentWindow: { postMessage: (...args: unknown[]) => void sent.push(args) } }, ORIGIN)
  expect(sent).toEqual([[{ automata: 'play' }, ORIGIN]])
  expect(() => tellGameToPlay({ contentWindow: null }, ORIGIN)).not.toThrow()
})
