// Asking GitHub which commits of the game exist and how their checks went.
import type { Candidate, CheckRun } from './choose.ts'

/** A failure with a plain sentence, ready to print in a run. */
export class GitHubError extends Error {}

const API = 'https://api.github.com'

/** The newest `limit` commits of `branch`, each with its check runs. Throws GitHubError with a plain sentence. */
export async function listCandidates(options: {
  readonly repo: string
  readonly branch: string
  readonly limit: number
  readonly token?: string
  readonly fetch?: typeof fetch
}): Promise<Candidate[]> {
  const { repo, branch, limit, token } = options
  const fetcher = options.fetch ?? fetch
  const headers: Record<string, string> = { accept: 'application/vnd.github+json' }
  if (token !== undefined) headers.authorization = `Bearer ${token}`

  const ask = async (url: string): Promise<unknown> => {
    let response: Response
    try {
      response = await fetcher(url, { headers })
    } catch {
      throw new GitHubError('GitHub could not be reached. The site keeps the game it has.')
    }
    if (!response.ok) {
      throw new GitHubError(`GitHub answered ${response.status} for ${url}. The site keeps the game it has.`)
    }
    try {
      return await response.json()
    } catch {
      throw new GitHubError(
        `GitHub sent an answer for ${url} that could not be read. The site keeps the game it has.`,
      )
    }
  }

  const unreadable = (url: string): GitHubError =>
    new GitHubError(
      `GitHub sent an answer for ${url} that was not what was expected. The site keeps the game it has.`,
    )

  const commitsUrl = `${API}/repos/${repo}/commits?sha=${branch}&per_page=${limit}`
  const commits = await ask(commitsUrl)
  if (!Array.isArray(commits)) throw unreadable(commitsUrl)

  const candidates: Candidate[] = []
  for (const commit of commits) {
    const sha = (commit as { sha?: unknown } | null)?.sha
    if (typeof sha !== 'string') throw unreadable(commitsUrl)
    const checksUrl = `${API}/repos/${repo}/commits/${sha}/check-runs?per_page=100`
    const body = (await ask(checksUrl)) as { check_runs?: unknown } | null
    if (!Array.isArray(body?.check_runs)) throw unreadable(checksUrl)
    const checks: CheckRun[] = body.check_runs.map(
      (run: { name: string; status: string; conclusion: string | null }) => ({
        name: run.name,
        status: run.status,
        conclusion: run.conclusion,
      }),
    )
    candidates.push({ sha, checks })
  }
  return candidates
}
