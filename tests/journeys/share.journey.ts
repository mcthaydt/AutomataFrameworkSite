// The card a shared link shows (audit S10, F1; the Owner's answer to Q2). The build takes it from this very page with
// `data-picture="share"` set, so the journey sets the same attribute and looks at what the page then draws: nothing in
// a picture can be pressed, and a third of the card is the game.
import { expect, test } from '@playwright/test'
import { arrive, colours, READABLE, TOKENS } from './look.ts'

test.use({ viewport: { width: 1200, height: 630 } })

test('the share card draws nothing to press, and about a third of it is the game', async ({ page }) => {
  await arrive(page)
  await page.evaluate(() => {
    document.documentElement.dataset.picture = 'share'
  })
  // No button in the picture, and no line of words in the touch colour: a picture of a button cannot be pressed. Only
  // the 1200 by 630 the picture takes counts, so the closing button far below it is not in the card.
  const inTheCard = await page.evaluate(() =>
    [...document.querySelectorAll('.btn, button')]
      .filter((element) => {
        const box = element.getBoundingClientRect()
        return box.width > 0 && box.height > 0 && box.top < 630 && box.bottom > 0
      })
      .map((element) => element.textContent?.trim() ?? ''),
  )
  expect(inTheCard, 'what could be pressed in the card').toEqual([])
  expect((await colours(page, READABLE)).filter((one) => one.words === TOKENS.touch)).toEqual([])
  // No keys line, no loading note and no lede (the preview prints the description under the picture).
  for (const selector of ['.lede', '.sheet-head .how', '.sheet-head .status', '.actions'])
    await expect(page.locator(selector), selector).toBeHidden()
  // The claim and the game's own picture are there; the game starts well inside the card and fills about a third.
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport({ ratio: 1 })
  const game = await page.locator('#game').boundingBox()
  const shown = 630 - (game?.y ?? 630)
  expect(shown).toBeGreaterThanOrEqual(630 * 0.25)
  expect(shown).toBeLessThanOrEqual(630 * 0.4)
})
