// One function per proof. A claim stamped "Works today" names one, and the build stops when it does not hold, so a page
// can never say "Works today" about something the game's own files do not back up.
import type { GameFacts } from '../facts/facts.ts'

/** The proofs there are. A claim that comes to work brings its own; none is written ahead of the claim that needs it. */
export type ProofName = 'same-in-every-engine'

/** A proof gives a plain sentence when it does not hold, and nothing when it does. */
export type Proof = (facts: GameFacts) => string | undefined

const FOUR = ['Node', 'Chrome', 'Safari', 'Firefox']

export const PROOFS: Readonly<Record<ProofName, Proof>> = {
  // True because `pick` only ever shows a game commit that passed every one of REQUIRED_CHECKS (Node and the three
  // browsers), and the game's own checks run the recorded play in each. So the proof is that the page names exactly
  // those four, and that there is a recorded play with an ending to run.
  'same-in-every-engine': (facts) => {
    if (facts.engines.join(',') !== FOUR.join(',')) {
      return `the play must run in ${FOUR.join(', ')}, and the page found ${facts.engines.join(', ') || 'nothing'}.`
    }
    if (facts.replay.steps < 1) return 'there is no recorded play with any steps to run.'
    if (!/^[0-9a-f]{16}$/.test(facts.replay.ending)) return 'the recorded play has no ending to compare.'
    return undefined
  },
}
