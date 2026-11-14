// The five claims the home page makes, as data, each with an honest stamp. A claim stamped "Works today" names a proof
// and the build stops when that proof does not hold, so a stamp is never a thing somebody typed and hoped.
import type { GameFacts } from '../facts/facts.ts'
import claimsJson from './library/claims.json' with { type: 'json' }
import { PROOFS, type ProofName } from './proofs.ts'

export type { ProofName } from './proofs.ts'
export { PROOFS } from './proofs.ts'

/** Where a claim stands today. */
export type ClaimState = 'works' | 'building'

/** The words each stamp says. */
export const STAMP_WORDS: Readonly<Record<ClaimState, string>> = {
  works: 'Works today',
  building: 'Being built',
}

export interface Claim {
  readonly id: string
  readonly title: string
  readonly line: string
  readonly state: ClaimState
  /** Required for a claim that works; a claim being built has none. */
  readonly proof?: ProofName
}

/** A failure with a plain sentence, ready to print in a build. */
export class ClaimError extends Error {}

/** Reads the claims file, so a hand edit with a state or proof nobody knows stops the build with a sentence. */
function load(raw: readonly Record<string, unknown>[]): Claim[] {
  return raw.map((entry) => {
    const { id, title, line, state, proof } = entry
    if (typeof id !== 'string' || typeof title !== 'string' || typeof line !== 'string') {
      throw new ClaimError('A claim in claims.json needs an id, a title and a line, each in quotes.')
    }
    if (state !== 'works' && state !== 'building') {
      throw new ClaimError(
        `The claim "${title}" has the state "${String(state)}"; it must be "works" or "building".`,
      )
    }
    if (proof === undefined) return { id, title, line, state }
    if (typeof proof !== 'string' || !(proof in PROOFS)) {
      throw new ClaimError(`The claim "${title}" names a proof, "${String(proof)}", that does not exist.`)
    }
    return { id, title, line, state, proof: proof as ProofName }
  })
}

/** The five claims, in the order the page shows them. */
export const CLAIMS: readonly Claim[] = load(claimsJson)

/** Stops the build, naming the claim, when a claim says "Works today" and its proof is missing or does not hold. */
export function checkClaims(claims: readonly Claim[], facts: GameFacts): void {
  for (const claim of claims) {
    if (claim.state !== 'works') continue
    if (claim.proof === undefined) {
      throw new ClaimError(
        `The claim "${claim.title}" is stamped "${STAMP_WORDS.works}" and names no proof. Name one, or stamp it "${STAMP_WORDS.building}".`,
      )
    }
    const failed = PROOFS[claim.proof](facts)
    if (failed !== undefined) {
      throw new ClaimError(
        `The claim "${claim.title}" is stamped "${STAMP_WORDS.works}", but its proof (${claim.proof}) does not hold: ${failed}`,
      )
    }
  }
}
