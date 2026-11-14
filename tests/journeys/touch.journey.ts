// What a thumb and an eye meet, at every size, in every engine: the game's own picture left alone, targets big enough to
// press, links that stay in their sentences, and an icon with words beside it for every one. The colours, the type and the
// spacing are in `look.journey.ts`.
import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { contrast } from '../fixtures/contrast.ts'
import { siteFacts } from './facts.ts'
import { arrive } from './look.ts'
import { SIZES } from './sizes.ts'

for (const size of SIZES) {
  test.describe(size.name, () => {
    test.use({ viewport: { width: size.width, height: size.height } })

    test("the game's own picture is left alone", async ({ page }) => {
      await arrive(page)
      const poster = await page.locator('img.poster').evaluate((node) => {
        const s = getComputedStyle(node)
        return {
          filter: s.filter,
          opacity: s.opacity,
          blend: s.mixBlendMode,
          corner: s.borderTopLeftRadius,
          border: s.borderTopWidth,
          fit: s.objectFit,
        }
      })
      expect(poster).toMatchObject({
        filter: 'none',
        opacity: '1',
        blend: 'normal',
        corner: '0px',
        border: '0px',
      })
      // Nothing is cropped: the picture is shown whole.
      expect(['fill', 'contain']).toContain(poster.fit)
      expect(await page.locator('#game').evaluate((node) => getComputedStyle(node).outlineStyle)).toBe(
        'solid',
      )

      await page.getByRole('button', { name: 'Play it' }).click()
      const frame = page.locator('iframe[title="The demo game"]')
      await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing')
      // The Owner's answer: once the game plays, nothing of the site's is drawn round it, so the line is gone.
      expect(await page.locator('#game').evaluate((node) => getComputedStyle(node).outlineStyle)).toBe('none')
      for (const element of [frame, page.locator('#game')]) {
        const style = await element.evaluate((node) => {
          const s = getComputedStyle(node)
          return {
            filter: s.filter,
            opacity: s.opacity,
            blend: s.mixBlendMode,
            corner: s.borderTopLeftRadius,
            border: s.borderTopWidth,
          }
        })
        expect(style).toEqual({ filter: 'none', opacity: '1', blend: 'normal', corner: '0px', border: '0px' })
      }
      // The frame fills its place edge to edge. Rounded: an engine may report the same edge a hair apart for two boxes
      // (Firefox gave 55.99997 for 56 in Cycle 1).
      const edges = async (selector: string): Promise<number[]> => {
        const box = await page.locator(selector).boundingBox()
        return [box?.x, box?.y, box?.width, box?.height].map((edge) => Math.round(edge ?? -1))
      }
      expect(await edges('iframe[title="The demo game"]')).toEqual(await edges('#game'))
    })

    test('everything that can be pressed is big enough for a thumb', async ({ page }) => {
      await arrive(page)
      const pressable = page.locator('a[href], button').filter({ visible: true })
      expect(await pressable.count()).toBeGreaterThanOrEqual(10)
      for (const element of await pressable.all()) {
        const box = await element.boundingBox()
        const name = (await element.textContent())?.trim() ?? ''
        const classes = (await element.getAttribute('class')) ?? ''
        // The main buttons are 52 px, the two small ones 48 and everything else 44. Rounded: Firefox reports a 56 px
        // button as 55.99997.
        const wanted = classes.includes('btn') ? (classes.includes('small') ? 48 : 52) : 44
        expect(Math.round(box?.height ?? 0), name).toBeGreaterThanOrEqual(wanted)
      }
    })

    // A link inside a sentence must stay in its line (it once dropped to a line of its own on a phone and left a gap) and
    // still be 44 px tall for a thumb.
    test('a link in a sentence stays in its line and is still big enough', async ({ page }) => {
      await arrive(page)
      const lines = await page.evaluate(() => {
        const link = document.querySelector('.panel-foot a') as Element
        const rect = link.getClientRects()[0] as DOMRect
        const range = document.createRange()
        range.selectNodeContents(link.previousSibling as ChildNode)
        const words = range.getClientRects()[range.getClientRects().length - 1] as DOMRect
        return {
          apart: Math.abs((rect.top + rect.bottom) / 2 - (words.top + words.bottom) / 2),
          tall: rect.height,
        }
      })
      // Same line: the middles are within a pixel or two, far less than a line apart (27 px).
      expect(lines.apart, 'Read the whole file').toBeLessThanOrEqual(2)
      expect(Math.round(lines.tall), 'Read the whole file').toBeGreaterThanOrEqual(44)
    })

    test('every icon has its words beside it, is hidden from screen readers and is seen against the ground', async ({
      page,
      request,
    }) => {
      await arrive(page)
      // The icons the page asks for: those in index.html, one a place the game runs, one a claim that works today.
      const asked =
        (readFileSync(new URL('../../index.html', import.meta.url), 'utf8').match(/data-icon=/g) ?? [])
          .length +
        (await siteFacts(request)).engines.length +
        (await page.locator('.stamp.works').count())
      await expect(page.locator('svg.icon')).toHaveCount(asked)
      await expect(page.locator('[data-icon]')).toHaveCount(0)
      const shown = await page.locator('svg.icon').filter({ visible: true }).all()
      expect(shown.length).toBeGreaterThanOrEqual(10)
      for (const icon of shown) {
        await expect(icon).toHaveAttribute('aria-hidden', 'true')
        // The words are the icon's neighbours: its parent says something without it.
        expect(
          (await icon.evaluate((svg) => svg.parentElement?.textContent ?? '')).trim().length,
        ).toBeGreaterThan(3)
        const box = await icon.boundingBox()
        expect(Math.round(box?.width ?? 0)).toBeGreaterThanOrEqual(16)
        expect(Math.round(box?.height ?? 0)).toBeGreaterThanOrEqual(16)
        // An icon is an edge, so it needs 3 to 1 against what is behind it.
        const seen = await icon.evaluate((svg) => {
          const clear = (colour: string): boolean => colour === 'transparent' || /,\s*0\)$/.test(colour)
          let ground = 'rgb(255, 255, 255)'
          for (let node = svg.parentElement; node !== null; node = node.parentElement) {
            const colour = getComputedStyle(node).backgroundColor
            if (!clear(colour)) {
              ground = colour
              break
            }
          }
          return { colour: getComputedStyle(svg).color, ground }
        })
        expect(contrast(seen.colour, seen.ground)).toBeGreaterThanOrEqual(3)
      }
      // The buttons' names are still their words alone.
      for (const name of ['Play the first game', 'Play it'])
        await expect(page.getByRole('button', { name, exact: true })).toBeVisible()
    })
  })
}
