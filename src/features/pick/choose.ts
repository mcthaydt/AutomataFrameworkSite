// Which commit of the game the site may show: the newest one whose required checks all passed.

/** The checks the game's repo runs on `main`, named as the game's workflow names them. `screens` proves nothing about the game. */
export const REQUIRED_CHECKS = [
  'check',
  'engines (chromium)',
  'engines (webkit)',
  'engines (firefox)',
] as const

export interface CheckRun {
  readonly name: string
  readonly status: string
  readonly conclusion: string | null
}

export interface Candidate {
  readonly sha: string
  readonly checks: readonly CheckRun[]
}

const passed = (checks: readonly CheckRun[], name: string): boolean =>
  checks.some((run) => run.name === name && run.status === 'completed' && run.conclusion === 'success')

/** The newest candidate (they come newest first) where every required check is completed with success. */
export function chooseCommit(candidates: readonly Candidate[]): string | undefined {
  return candidates.find((candidate) => REQUIRED_CHECKS.every((name) => passed(candidate.checks, name)))?.sha
}
