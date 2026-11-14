import { expect, test } from 'vitest'
import { GitHubError, listCandidates } from '#src/features/pick/pick.ts'

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

/** A fetch that answers from a table and remembers what it was asked. */
function fakeFetch(answers: Record<string, Response>) {
  const asked: { url: string; authorization: string | null }[] = []
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input)
    asked.push({ url, authorization: new Headers(init?.headers).get('authorization') })
    const answer = answers[url]
    if (!answer) throw new Error(`unexpected request: ${url}`)
    return answer
  }
  return { fetcher, asked }
}

const COMMITS = 'https://api.github.com/repos/o/r/commits?sha=main&per_page=2'
const checksOf = (sha: string) => `https://api.github.com/repos/o/r/commits/${sha}/check-runs?per_page=100`

test("listCandidates asks for the commits, then each commit's check runs", async () => {
  const { fetcher, asked } = fakeFetch({
    [COMMITS]: json([{ sha: 'one' }, { sha: 'two' }]),
    [checksOf('one')]: json({
      check_runs: [{ name: 'check', status: 'completed', conclusion: 'success', id: 1 }],
    }),
    [checksOf('two')]: json({ check_runs: [] }),
  })
  const found = await listCandidates({ repo: 'o/r', branch: 'main', limit: 2, fetch: fetcher })
  expect(found).toEqual([
    { sha: 'one', checks: [{ name: 'check', status: 'completed', conclusion: 'success' }] },
    { sha: 'two', checks: [] },
  ])
  expect(asked.map((a) => a.url)).toEqual([COMMITS, checksOf('one'), checksOf('two')])
  expect(asked.every((a) => a.authorization === null)).toBe(true)
})

test('listCandidates sends the token only when it is given', async () => {
  const { fetcher, asked } = fakeFetch({ [COMMITS]: json([]) })
  await listCandidates({ repo: 'o/r', branch: 'main', limit: 2, token: 't', fetch: fetcher })
  expect(asked.map((a) => a.authorization)).toEqual(['Bearer t'])
})

test('listCandidates turns a refusal into a sentence', async () => {
  const { fetcher } = fakeFetch({ [COMMITS]: json({ message: 'rate limited' }, 403) })
  const error = await listCandidates({ repo: 'o/r', branch: 'main', limit: 2, fetch: fetcher }).catch(
    (e: unknown) => e,
  )
  expect(error).toBeInstanceOf(GitHubError)
  expect((error as Error).message).toBe(`GitHub answered 403 for ${COMMITS}. The site keeps the game it has.`)
})

test('listCandidates turns a fetch that rejects into a sentence', async () => {
  const fetcher: typeof fetch = async () => {
    throw new Error('offline')
  }
  const error = await listCandidates({ repo: 'o/r', branch: 'main', limit: 2, fetch: fetcher }).catch(
    (e: unknown) => e,
  )
  expect(error).toBeInstanceOf(GitHubError)
  expect((error as Error).message).toBe('GitHub could not be reached. The site keeps the game it has.')
})

test('listCandidates turns an answer it cannot read into a sentence', async () => {
  const { fetcher } = fakeFetch({ [COMMITS]: json({ not: 'a list' }) })
  const error = await listCandidates({ repo: 'o/r', branch: 'main', limit: 2, fetch: fetcher }).catch(
    (e: unknown) => e,
  )
  expect(error).toBeInstanceOf(GitHubError)
})
