// Reads a PNG's own pixels in Node. A journey that asks "is this picture of something?" used to draw the file on a
// canvas in the browser, and a browser may hand back an empty canvas for a large picture when it is short of memory:
// WebKit did, once, and the journey saw one colour in a picture that was fine (audit F7). The file's bytes do not
// depend on the engine, so the journeys read them here, with the file's own compression undone and nothing drawn.
import { inflateSync } from 'node:zlib'

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/** The channels a pixel has for the colour types this reader knows: 2 is red, green, blue and 6 adds opacity. */
const CHANNELS: Readonly<Record<number, number>> = { 2: 3, 6: 4 }

/** The paeth predictor of the PNG format: whichever of left, up and up-left is nearest to left + up - up-left. */
function paeth(left: number, up: number, upLeft: number): number {
  const guess = left + up - upLeft
  const toLeft = Math.abs(guess - left)
  const toUp = Math.abs(guess - up)
  const toUpLeft = Math.abs(guess - upLeft)
  if (toLeft <= toUp && toLeft <= toUpLeft) return left
  return toUp <= toUpLeft ? up : upLeft
}

/** Every pixel of an 8-bit, unwoven, red-green-blue(-opacity) PNG as one byte run per row, filters undone. */
function unfilter(raw: Buffer, width: number, height: number, bytesPerPixel: number): Buffer {
  const stride = width * bytesPerPixel
  if (raw.length !== height * (stride + 1))
    throw new Error('The PNG holds a different amount of pixels than it says.')
  const out = Buffer.alloc(height * stride)
  for (let row = 0; row < height; row++) {
    const filter = raw[row * (stride + 1)]
    const from = row * (stride + 1) + 1
    const to = row * stride
    for (let at = 0; at < stride; at++) {
      const left = at >= bytesPerPixel ? (out[to + at - bytesPerPixel] ?? 0) : 0
      const up = row > 0 ? (out[to - stride + at] ?? 0) : 0
      const upLeft = row > 0 && at >= bytesPerPixel ? (out[to - stride + at - bytesPerPixel] ?? 0) : 0
      const byte = raw[from + at] ?? 0
      let add: number
      if (filter === 0) add = 0
      else if (filter === 1) add = left
      else if (filter === 2) add = up
      else if (filter === 3) add = (left + up) >> 1
      else if (filter === 4) add = paeth(left, up, upLeft)
      else throw new Error(`The PNG uses a row filter (${filter}) that does not exist.`)
      out[to + at] = (byte + add) & 0xff
    }
  }
  return out
}

/** The size of a PNG and how many different colours (red, green, blue; opacity is ignored) it holds. */
export function readPicture(bytes: Buffer): { width: number; height: number; colours: number } {
  if (!bytes.subarray(0, 8).equals(SIGNATURE)) throw new Error('This is not a PNG file.')
  let width = 0
  let height = 0
  let channels = 0
  const data: Buffer[] = []
  for (let at = 8; at + 8 <= bytes.length; ) {
    const length = bytes.readUInt32BE(at)
    const type = bytes.toString('latin1', at + 4, at + 8)
    const body = bytes.subarray(at + 8, at + 8 + length)
    if (type === 'IHDR') {
      width = body.readUInt32BE(0)
      height = body.readUInt32BE(4)
      const [depth, colourType, , , woven] = [body[8], body[9], body[10], body[11], body[12]]
      channels = CHANNELS[colourType ?? -1] ?? 0
      if (depth !== 8 || channels === 0 || woven !== 0)
        throw new Error(
          'This reader knows 8-bit PNGs of red, green and blue (with or without opacity), not woven.',
        )
    } else if (type === 'IDAT') data.push(body)
    else if (type === 'IEND') break
    at += 12 + length
  }
  const pixels = unfilter(inflateSync(Buffer.concat(data)), width, height, channels)
  const seen = new Set<number>()
  for (let at = 0; at < pixels.length; at += channels)
    seen.add(((pixels[at] ?? 0) << 16) | ((pixels[at + 1] ?? 0) << 8) | (pixels[at + 2] ?? 0))
  return { width, height, colours: seen.size }
}
