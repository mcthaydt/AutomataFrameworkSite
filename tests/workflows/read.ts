// Helpers for the checks that read a workflow's text, because a workflow only runs on GitHub.
import { readFileSync } from 'node:fs'

/** The whole text of `.github/workflows/<name>`. */
export function readWorkflow(name: string): string {
  return readFileSync(new URL(`../../.github/workflows/${name}`, import.meta.url), 'utf8')
}

/** Everything before the `jobs:` line: the triggers, the permissions as a whole, the env. */
export function head(workflow: string): string {
  return workflow.slice(0, workflow.indexOf('\njobs:'))
}

/** The text of one job: from its name (two spaces in) to the next job or the end. */
export function job(workflow: string, name: string): string {
  const jobs = workflow.slice(workflow.indexOf('\njobs:'))
  const start = jobs.indexOf(`\n  ${name}:`)
  if (start < 0) throw new Error(`There is no job "${name}" in the workflow.`)
  const rest = jobs.slice(start + 1)
  const next = rest.slice(1).search(/\n {2}[\w-]+:/)
  return next < 0 ? rest : rest.slice(0, next + 1)
}

/** A GitHub expression, written out here so the linter does not mistake it for a template string. */
export const expr = (inside: string): string => `\${{ ${inside} }}`

/** The id of every job in the workflow, in order. */
export function jobIds(workflow: string): string[] {
  const jobs = workflow.slice(workflow.indexOf('\njobs:'))
  return [...jobs.matchAll(/^ {2}([\w-]+):/gm)].map((m) => m[1] ?? '')
}

/**
 * The names GitHub shows for the workflow's checks, which is what a required check matches. A job that calls another
 * workflow shows as `<its id> / <the called job's id>` (the engine suffix aside), as in `journeys / engines`.
 */
export function checkNames(workflow: string): string[] {
  return jobIds(workflow).flatMap((id) => {
    const called = /uses: \.\/\.github\/workflows\/(\S+)/.exec(job(workflow, id))?.[1]
    return called === undefined ? [id] : jobIds(readWorkflow(called)).map((inner) => `${id} / ${inner}`)
  })
}
