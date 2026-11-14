import type { Page } from '@playwright/test'

/**
 * Starts collecting everything that goes wrong in a page and its frames, as sentences: console errors, errors thrown
 * by a script, requests that failed and responses of 400 or above. Call the returned function at the end of a
 * journey: `expect(trouble()).toEqual([])`.
 */
export function watchForTrouble(page: Page): () => string[] {
  const found: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') found.push(`Console error: ${message.text()}`)
  })
  page.on('pageerror', (error) => found.push(`Script error: ${error.message}`))
  page.on('requestfailed', (request) => {
    found.push(`Request failed: ${request.url()} (${request.failure()?.errorText ?? 'no reason given'})`)
  })
  page.on('response', (response) => {
    if (response.status() >= 400) found.push(`Answer ${response.status()} for ${response.url()}`)
  })
  return () => [...found]
}
