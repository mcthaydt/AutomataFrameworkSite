import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { readIcon } from '#src/features/icons/icons.ts'

/** Every icon the pages use; the last test holds the pages to this list. */
const USED = ['play', 'keyboard', 'device-mobile', 'cursor-click', 'github-logo', 'house']

test.each(USED)('the icon "%s" is in the package, in the shape inlineIcons expects', (name) => {
  const svg = readIcon(name)
  expect(svg).toMatch(
    /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 256 256" fill="currentColor">/,
  )
  expect(svg).not.toContain('<script')
})

test('a name that is not an icon reads as nothing', () => {
  expect(readIcon('no-such-icon')).toBeUndefined()
  expect(readIcon('../package')).toBeUndefined()
})

test('every icon the pages ask for is one of the names above', () => {
  for (const file of ['index.html', '404.html']) {
    const html = readFileSync(new URL(`../../../${file}`, import.meta.url), 'utf8')
    for (const [, name] of html.matchAll(/data-icon="([^"]+)"/g)) expect(USED, file).toContain(name)
  }
})
