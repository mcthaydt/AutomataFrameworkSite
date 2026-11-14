// Serves one folder on a free port so a browser can open the built site. Node's only, and only for the build: it is how
// `takePictures` looks at the pages it has just built. It serves nothing outside the folder.
import { readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, sep } from 'node:path'

const TYPES: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
  '.toml': 'text/plain; charset=utf-8',
}

/** The file an address names inside `dir`, or undefined when it names nothing there (or reaches outside). */
async function fileFor(dir: string, address: string): Promise<string | undefined> {
  let path: string
  try {
    path = decodeURIComponent(address.split('?')[0] ?? '/')
  } catch {
    return undefined
  }
  const root = normalize(dir + sep)
  let target = normalize(join(dir, path))
  if (!`${target}${sep}`.startsWith(root)) return undefined
  try {
    if ((await stat(target)).isDirectory()) target = join(target, 'index.html')
    return (await stat(target)).isFile() ? target : undefined
  } catch {
    return undefined
  }
}

/** Starts serving `dir` on a free port of this machine. `close` stops it. */
export async function serveFolder(dir: string): Promise<{ url: string; close(): Promise<void> }> {
  const server = createServer((request, response) => {
    void (async () => {
      const file = await fileFor(dir, request.url ?? '/')
      if (file === undefined) {
        response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found')
        return
      }
      response
        .writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
        .end(await readFile(file))
    })()
  })
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done))
  const address = server.address()
  if (address === null || typeof address === 'string') throw new Error('The picture server has no port.')
  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((done) => {
        server.close(() => done())
        server.closeAllConnections()
      }),
  }
}
