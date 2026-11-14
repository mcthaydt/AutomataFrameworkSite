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
  /** The claim as the spec words it. A card shows it once the claim works (see `titleShown`). */
  readonly title: string
  /**
   * What a card says instead while the claim is being built. The spec's title for "after the demo" says the work is
   * already done, and it sits above a stamp that says it is not (the Owner, 2026-11-14, answer to Q4), so until the
   * stamp changes the card promises less. The spec's own title comes back with the stamp.
   */
  readonly whileBuilding?: string
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
    const { id, title, line, state, proof, whileBuilding } = entry
    if (typeof id !== 'string' || typeof title !== 'string' || typeof line !== 'string') {
      throw new ClaimError('A claim in claims.json needs an id, a title and a line, each in quotes.')
    }
    if (whileBuilding !== undefined && typeof whileBuilding !== 'string') {
      throw new ClaimError(`The claim "${title}" has a "whileBuilding" that is not words in quotes.`)
    }
    const shown = whileBuilding === undefined ? {} : { whileBuilding }
    if (state !== 'works' && state !== 'building') {
      throw new ClaimError(
        `The claim "${title}" has the state "${String(state)}"; it must be "works" or "building".`,
      )
    }
    if (proof === undefined) return { id, title, ...shown, line, state }
    if (typeof proof !== 'string' || !(proof in PROOFS)) {
      throw new ClaimError(`The claim "${title}" names a proof, "${String(proof)}", that does not exist.`)
    }
    return { id, title, ...shown, line, state, proof: proof as ProofName }
  })
}

/** The title a card shows: the claim's own once it works, and its "while building" words until then, when it has them. */
export function titleShown(claim: Claim): string {
  return claim.state === 'works' ? claim.title : (claim.whileBuilding ?? claim.title)
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
