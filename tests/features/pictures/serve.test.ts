import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vitest'
import { PICTURES, serveFolder } from '#src/features/pictures/pictures.ts'

// The folder holds the site; the file beside it (one level up) is what a climbing address would reach.
let outer: string
let site: string
let server: Awaited<ReturnType<typeof serveFolder>>

beforeEach(async () => {
  outer = mkdtempSync(join(tmpdir(), 'serve-'))
  site = join(outer, 'site')
  mkdirSync(join(site, 'play'), { recursive: true })
  writeFileSync(join(outer, 'secret.txt'), 'not for the site')
  writeFileSync(join(site, 'index.html'), '<h1>home</h1>')
  writeFileSync(join(site, 'play', 'index.html'), '<h1>play</h1>')
  writeFileSync(join(site, 'page.css'), 'a{}')
  writeFileSync(join(site, 'icon.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>')
  server = await serveFolder(site)
})

afterEach(async () => {
  await server.close()
  rmSync(outer, { recursive: true, force: true })
})

test('serves a file of the folder with its type', async () => {
  const response = await fetch(`${server.url}/page.css`)
  expect(response.status).toBe(200)
  expect(response.headers.get('content-type')).toContain('text/css')
  expect(await response.text()).toBe('a{}')
  expect((await fetch(`${server.url}/icon.svg`)).headers.get('content-type')).toBe('image/svg+xml')
})

test("a folder's address gives its index.html", async () => {
  expect(await (await fetch(`${server.url}/`)).text()).toBe('<h1>home</h1>')
  expect(await (await fetch(`${server.url}/play/`)).text()).toBe('<h1>play</h1>')
  expect(await (await fetch(`${server.url}/play`)).text()).toBe('<h1>play</h1>')
})

test('an address that climbs out of the folder answers 404 and serves nothing', async () => {
  // Raw requests: `fetch` would tidy a `..` away before it was ever sent.
  for (const address of ['/../secret.txt', '/%2e%2e/secret.txt', '/play/../../secret.txt']) {
    const net = await import('node:net')
    const port = Number(new URL(server.url).port)
    const reply = await new Promise<string>((done) => {
      const socket = net.connect(port, '127.0.0.1', () =>
        socket.write(`GET ${address} HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n`),
      )
      let text = ''
      socket.on('data', (chunk) => {
        text += chunk.toString()
      })
      socket.on('close', () => done(text))
    })
    expect(reply, address).toMatch(/^HTTP\/1\.1 404/)
    expect(reply, address).not.toContain('not for the site')
  }
})

test('a missing file answers 404', async () => {
  expect((await fetch(`${server.url}/nothing.png`)).status).toBe(404)
})

test("the game's picture is first, and the names are the three the pages point at", () => {
  expect(PICTURES.map((picture) => picture.file)).toEqual(['game.png', 'share.png', 'apple-touch-icon.png'])
  expect(PICTURES.find((picture) => picture.file === 'share.png')?.as).toBe('share')
  expect(PICTURES.find((picture) => picture.file === 'game.png')).toMatchObject({
    width: 1280,
    height: 720,
    scale: 2,
  })
})
