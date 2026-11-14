import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

// A first-time developer, or an agent, must get from clone to a page on screen by following the README alone.
const readme = readFileSync(new URL('../../README.md', import.meta.url), 'utf8')
const section = readme.slice(readme.indexOf('## Try it on your machine'))

test('the README has a section that takes you from clone to the page', () => {
  expect(readme).toContain('## Try it on your machine')
})

test('it gives the commands, in order: install, build, serve', () => {
  const install = section.indexOf('pnpm install')
  const build = section.indexOf('pnpm build')
  const serve = section.indexOf('wrangler pages dev dist')
  expect(install).toBeGreaterThan(0)
  expect(build).toBeGreaterThan(install)
  expect(serve).toBeGreaterThan(build)
})

test('it says how to put the real game in place of the stand-in, and where the page then is', () => {
  expect(section).toContain('GAME_DIR=')
  expect(section).toContain('AutomataFrameworkExamples')
  expect(section).toContain('http://localhost:8788')
})

test('the commands it names exist in package.json', () => {
  const scripts = (
    JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
      scripts: Record<string, string>
    }
  ).scripts
  expect(scripts.build).toBeDefined()
})
