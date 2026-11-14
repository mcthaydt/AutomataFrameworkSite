// What the host does around the page, in every engine: a real 404 for a missing address, a 404 (not the home page) for a
// missing file of the game, the safety headers on every page, and the game still playing under those headers.
// `wrangler pages dev` serves dist/ the way Cloudflare Pages does, so these see what a visitor will.
import { expect, test } from '@playwright/test'
import { watchForTrouble } from './watch.ts'

test.use({ viewport: { width: 1440, height: 900 } })

test('a missing address answers 404, says so, and offers the way home', async ({ page }) => {
  const response = await page.goto('/no-such-page')
  expect(response?.status()).toBe(404)
  await expect(page).toHaveTitle('Page not found: Automata Framework')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page does not exist.')
  await expect(page.getByText('The address may be mistyped, or the page may have moved.')).toBeVisible()
  await page.getByRole('link', { name: 'Go to the home page' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('AutomataFramework')
})

test('a missing file of the game answers 404, not the home page', async ({ request }) => {
  const response = await request.get('/play/content/no-such-file.json')
  expect(response.status()).toBe(404)
})

// The fonts' and icons' licences ask that their notice travel with every copy; the site serves it as a plain file.
test('the licence notices of the fonts and icons are served as plain text', async ({ request }) => {
  const response = await request.get('/licences.txt')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type'] ?? '').toContain('text/plain')
  const text = await response.text()
  for (const notice of [
    'Fraunces',
    'Copyright 2020 The Fraunces Project Authors',
    'Onest',
    'Copyright 2021 The Onest Project Authors',
    'JetBrains Mono',
    'Copyright 2020 The JetBrains Mono Project Authors',
    'SIL OPEN FONT LICENSE Version 1.1',
    'Phosphor Icons',
    'Copyright (c) 2023 Phosphor Icons',
    'MIT License',
  ]) {
    expect(text, notice).toContain(notice)
  }
})

test('every page is sent with its safety headers', async ({ request }) => {
  for (const address of ['/', '/play/', '/no-such-page']) {
    const response = await request.get(address)
    const headers = response.headers()
    expect(headers['x-content-type-options'], address).toBe('nosniff')
    expect(headers['referrer-policy'], address).toBe('strict-origin-when-cross-origin')
    const policy = headers['content-security-policy'] ?? ''
    expect(policy, address).toBe(
      "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' data: blob:; worker-src 'self' blob:; frame-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'",
    )
    expect(policy, address).toContain("frame-ancestors 'self'")
    expect(policy, address).toContain("script-src 'self' 'wasm-unsafe-eval'")
    // The framework promises games need no eval; only WebAssembly is allowed to compile.
    expect(policy, address).not.toMatch(/(?<!wasm-)unsafe-eval/)
  }
})

test('the game still plays under those headers', async ({ page }) => {
  const trouble = watchForTrouble(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Play the game' }).click()
  await expect(
    page.frameLocator('iframe[title="The demo game"]').locator('#game[data-state="playing"]'),
  ).toBeAttached()
  expect(trouble()).toEqual([])
})
