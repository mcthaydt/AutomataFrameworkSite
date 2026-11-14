// A stand-in for the demo game, so the site can be built and tested before the real game passes its checks.
// It draws a sky and one red box; the box moves right while ArrowRight or D is held, or while the on-screen Right
// button is held. It is a file (not inline) because the site's headers allow no inline script.
//
// It follows the real game's watch mode as far as the site relies on it. With `?watch` in its address it plays by
// itself: the box moves right, keys and the Right button do nothing, and it tells its parent page it is `watching`.
// When that page says `{ automata: 'play' }` the box goes back to the start and the game is `playing`, as it is
// from the first moment without `?watch`. The messages are only ever sent to, and heard from, the parent at this
// game's own origin.
const root = document.getElementById('game')
const button = document.getElementById('right')
const canvas = document.createElement('canvas')
root.prepend(canvas)
const context = canvas.getContext('2d')
const held = new Set()
const START = 40
let x = START
let watching = new URLSearchParams(location.search).has('watch')

/** Tells the page that frames this one what the game is doing; nobody is told when it is not framed. */
const tell = (state) => {
  if (window.parent !== window) window.parent.postMessage({ automata: 'state', state }, location.origin)
}
window.addEventListener('message', (event) => {
  if (event.source !== window.parent || event.origin !== location.origin) return
  if (event.data === null || typeof event.data !== 'object' || event.data.automata !== 'play') return
  if (!watching) return
  watching = false
  x = START
  root.dataset.state = 'playing'
  tell('playing')
})

const resize = () => {
  canvas.width = Math.max(1, Math.floor(root.clientWidth))
  canvas.height = Math.max(1, Math.floor(root.clientHeight))
}
window.addEventListener('resize', resize)
resize()

window.addEventListener('keydown', (event) => {
  if (!watching) held.add(event.code)
})
window.addEventListener('keyup', (event) => held.delete(event.code))

// The Right button shows after the first touch, as the framework's buttons do.
window.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'touch') button.dataset.shown = ''
})
button.addEventListener('pointerdown', () => {
  if (!watching) held.add('Button')
})
for (const name of ['pointerup', 'pointercancel', 'pointerleave']) {
  button.addEventListener(name, () => held.delete('Button'))
}

const frame = () => {
  if (watching || held.has('ArrowRight') || held.has('KeyD') || held.has('Button'))
    x = (x + 4) % Math.max(1, canvas.width)
  context.fillStyle = '#9fd3f0'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#d63031'
  context.fillRect(x, canvas.height / 2, 48, 48)
  requestAnimationFrame(frame)
}
frame()
root.dataset.state = watching ? 'watching' : 'playing'
tell(root.dataset.state)
