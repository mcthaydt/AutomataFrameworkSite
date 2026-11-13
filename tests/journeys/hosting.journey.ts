// What the host does around the page, in every engine: a real 404 for a missing address, a 404 (not the home page) for a
// missing file of the game, the safety headers on every page, and the game still playing under those headers.
// `wrangler pages dev` serves dist/ the way Cloudflare Pages does, so these see what a visitor will.
import { expect, test } from '@playwright/test'
import { watchForTrouble } from './watch.ts'

test.use({ viewport: { width: 1440, height: 900 } })

test('a missing address answers 404, says so, and offers the way home', async ({ page }) => {
  const response = await page.goto('/no-such-page')
  expect(response?.status()).toBe(404)
  await expect(page).toHaveTitle('Page not found: AutomataFramework')
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

test('every page is sent with its safety headers', async ({ request }) => {
  for (const address of ['/', '/play/', '/no-such-page']) {
    const response = await request.get(address)
    const headers = response.headers()
    expect(headers['x-content-type-options'], address).toBe('nosniff')
    expect(headers['referrer-policy'], address).toBe('strict-origin-when-cross-origin')
    const policy = headers['content-security-policy'] ?? ''
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
