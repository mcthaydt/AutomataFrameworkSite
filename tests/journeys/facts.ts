// What the journeys know about the game the page shows: its facts, read from the `facts.json` the build wrote, and the
// words and addresses the page must make of them. This is written out separately from the `fill` feature on purpose: a
// journey that borrowed the page's own code to say what the page should say would agree with it whatever it said.
import type { APIRequestContext } from '@playwright/test'

export interface SiteFacts {
  readonly name: string
  readonly commit: string
  readonly files: readonly string[]
  readonly licence: string
  readonly engines: readonly string[]
  readonly level: {
    readonly path: string
    readonly width: number
    readonly height: number
    readonly firstRow: string
    readonly lastRow: string
    readonly thing?: { readonly character: string; readonly x: number; readonly y: number }
  }
  readonly replay: { readonly path: string; readonly steps: number; readonly ending: string }
}

/** The game's repo on GitHub, where every address on the page points. */
export const GAME_REPO = 'https://github.com/mcthaydt/AutomataFrameworkExamples'

/** Reads `/facts.json` from the site under test. */
export async function siteFacts(request: APIRequestContext): Promise<SiteFacts> {
  const response = await request.get('/facts.json')
  if (!response.ok()) throw new Error(`/facts.json answered ${response.status()}.`)
  return (await response.json()) as SiteFacts
}

const isCommit = (text: string): boolean => /^[0-9a-f]{40}$/.test(text)
const plural = (count: number, one: string, many: string): string => `${count} ${count === 1 ? one : many}`

/** The words the page must show for each fact. */
export function words(facts: SiteFacts): Record<string, string> {
  const list =
    facts.engines.length < 2
      ? facts.engines.join('')
      : `${facts.engines.slice(0, -1).join(', ')} and ${facts.engines[facts.engines.length - 1]}`
  return {
    name: facts.name,
    version: isCommit(facts.commit) ? facts.commit.slice(0, 7) : facts.commit,
    levelSize: `${facts.level.width} × ${facts.level.height} tiles`,
    enginesCount: plural(facts.engines.length, 'place', 'places'),
    enginesList: list,
    steps: plural(facts.replay.steps, 'step', 'steps'),
    filesCount: plural(facts.files.length, 'small file', 'small files'),
    licence: facts.licence,
  }
}

/** The addresses the page must link to. A plain word for a commit gives the repo's own pages. */
export function addresses(facts: SiteFacts): Record<'version' | 'files' | 'level' | 'checks', string> {
  const real = isCommit(facts.commit)
  return {
    version: real ? `${GAME_REPO}/commit/${facts.commit}` : GAME_REPO,
    files: real ? `${GAME_REPO}/tree/${facts.commit}` : GAME_REPO,
    level: `${GAME_REPO}/blob/${real ? facts.commit : 'main'}/${facts.level.path}`,
    checks: real ? `${GAME_REPO}/commit/${facts.commit}/checks` : `${GAME_REPO}/actions`,
  }
}
