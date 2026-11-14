// The journeys' PNG reader, held to pictures made here with every one of the format's row filters.
import { crc32, deflateSync } from 'node:zlib'
import { expect, test } from 'vitest'
import { readPicture } from './png.ts'

const chunk = (type: string, body: Buffer): Buffer => {
  const head = Buffer.alloc(8)
  head.writeUInt32BE(body.length, 0)
  head.write(type, 4, 'latin1')
  const tail = Buffer.alloc(4)
  tail.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), body])), 0)
  return Buffer.concat([head, body, tail])
}

/** Applies the row filter `kind` (0 to 4) to one row, the way an encoder does, given the row above. */
function filtered(kind: number, row: Buffer, above: Buffer, bytesPerPixel: number): Buffer {
  const out = Buffer.alloc(row.length + 1)
  out[0] = kind
  for (let at = 0; at < row.length; at++) {
    const left = at >= bytesPerPixel ? (row[at - bytesPerPixel] ?? 0) : 0
    const up = above[at] ?? 0
    const upLeft = at >= bytesPerPixel ? (above[at - bytesPerPixel] ?? 0) : 0
    const guess = left + up - upLeft
    const [toLeft, toUp, toUpLeft] = [Math.abs(guess - left), Math.abs(guess - up), Math.abs(guess - upLeft)]
    const paeth = toLeft <= toUp && toLeft <= toUpLeft ? left : toUp <= toUpLeft ? up : upLeft
    const sub = [0, left, up, (left + up) >> 1, paeth][kind] ?? 0
    out[at + 1] = ((row[at] ?? 0) - sub) & 0xff
  }
  return out
}

/** A PNG of `rows` (each a run of bytes), every row filtered with the next kind in turn. */
function png(colourType: 2 | 6, width: number, rows: Buffer[]): Buffer {
  const channels = colourType === 2 ? 3 : 4
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(rows.length, 4)
  header.set([8, colourType, 0, 0, 0], 8)
  const empty = Buffer.alloc(width * channels)
  const raw = Buffer.concat(rows.map((row, at) => filtered(at % 5, row, rows[at - 1] ?? empty, channels)))
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

test('it counts the colours of a picture and reads its size, whichever filter each row used', () => {
  // Five rows, so each of the filters 0 to 4 is used once; each row holds three colours between them.
  const rows = [0, 1, 2, 3, 4].map((at) =>
    Buffer.from([10 * at, 20, 30, 200, 100 + at, 0, 255, 255, 255, 10 * at, 20, 30]),
  )
  expect(readPicture(png(2, 4, rows))).toEqual({ width: 4, height: 5, colours: 5 + 5 + 1 })
})

test('opacity is not a colour', () => {
  const rows = [Buffer.from([1, 2, 3, 255, 1, 2, 3, 0, 1, 2, 3, 128])]
  expect(readPicture(png(6, 3, rows))).toEqual({ width: 3, height: 1, colours: 1 })
})

test('a flat picture is one colour', () => {
  const row = Buffer.from(new Array(30).fill(7))
  expect(readPicture(png(2, 10, [row, row, row])).colours).toBe(1)
})

test('what is not a PNG is refused in words', () => {
  expect(() => readPicture(Buffer.from('not a picture'))).toThrow('not a PNG')
})
