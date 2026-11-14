// A stand-in for the demo game, so the site can be built and tested before the real game passes its checks.
// It draws a sky and one red box; the box moves right while ArrowRight or D is held, or while the on-screen Right
// button is held. It is a file (not inline) because the site's headers allow no inline script.
const root = document.getElementById('game')
const button = document.getElementById('right')
const canvas = document.createElement('canvas')
root.prepend(canvas)
const context = canvas.getContext('2d')
const held = new Set()
let x = 40

const resize = () => {
  canvas.width = Math.max(1, Math.floor(root.clientWidth))
  canvas.height = Math.max(1, Math.floor(root.clientHeight))
}
window.addEventListener('resize', resize)
resize()

window.addEventListener('keydown', (event) => held.add(event.code))
window.addEventListener('keyup', (event) => held.delete(event.code))

// The Right button shows after the first touch, as the framework's buttons do.
window.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'touch') button.dataset.shown = ''
})
button.addEventListener('pointerdown', () => held.add('Button'))
for (const name of ['pointerup', 'pointercancel', 'pointerleave']) {
  button.addEventListener(name, () => held.delete('Button'))
}

const frame = () => {
  if (held.has('ArrowRight') || held.has('KeyD') || held.has('Button'))
    x = (x + 4) % Math.max(1, canvas.width)
  context.fillStyle = '#9fd3f0'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#d63031'
  context.fillRect(x, canvas.height / 2, 48, 48)
  requestAnimationFrame(frame)
}
frame()
root.dataset.state = 'playing'
