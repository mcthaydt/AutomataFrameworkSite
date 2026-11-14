// Run only against the live address, once a deploy has uploaded: it waits for Cloudflare to serve exactly the build that
// was just uploaded, so the journeys that follow judge this build and not the one before it.
import { expect, test } from '@playwright/test'
import { parseVersion } from '../../src/features/version/version.ts'

test.skip(
  !process.env.EXPECT_GAME,
  'Only for the live address: EXPECT_SITE and EXPECT_GAME name the build to wait for.',
)

test('the live address serves this build', async ({ request }) => {
  await expect
    .poll(async () => parseVersion(await (await request.get('/version.json')).text()), { timeout: 120_000 })
    .toEqual({ site: process.env.EXPECT_SITE, game: process.env.EXPECT_GAME })
})
