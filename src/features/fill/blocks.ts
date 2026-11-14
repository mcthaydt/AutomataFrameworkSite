// The three blocks of the home page that are made of the game's facts rather than written by hand: the level's file as
// rows, the table of places the recorded play runs, and the cards of the five claims. Pure: facts in, markup out. Every
// value that came from a game passes through `escapeHtml`, so a name or a row with markup in it is shown as words.
import type { Claim } from '../claims/claims.ts'
import { STAMP_WORDS } from '../claims/claims.ts'
import type { GameFacts } from '../facts/facts.ts'

/** Words as the page shows them: the four characters that could open or close markup are written out. */
export function escapeHtml(words: string): string {
  return words.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** One row of the file panel, with an optional note on the right (a label, set in capitals by the stylesheet). */
function row(text: string, note?: string): string {
  const leader =
    note === undefined ? '' : `<i class="leader"></i><span class="note">${escapeHtml(note)}</span>`
  return `<div class="row"><code>${escapeHtml(text)}</code>${leader}</div>`
}

/** `word` in quotes the way the file writes it, so a quote or a backslash in a game's own words is shown as it is there. */
const quoted = (word: string): string => JSON.stringify(word)

/**
 * The level's file as rows: its id, its first and last row of tiles with a count of the rows left out between, and its
 * first thing. The three notes describe the file's format, so they are true of any level an editor saves; none names
 * anything of the game's art.
 */
export function levelFile(facts: GameFacts): string {
  const { id, firstRow, lastRow, height, thing } = facts.level
  const rows: string[] = [row(`"id": ${quoted(id)},`), row('"tiles": [', 'The level, row by row')]
  rows.push(row(`  ${quoted(firstRow)}${height > 1 ? ',' : ''}`))
  const between = height - 2
  if (between > 0) rows.push(row(`  … ${between} more ${between === 1 ? 'row' : 'rows'}`))
  if (height > 1) rows.push(row(`  ${quoted(lastRow)}`))
  if (thing === undefined) {
    rows.push(row(']'))
  } else {
    rows.push(
      row('],'),
      row('"things": ['),
      row(`  { "character": ${quoted(thing.character)},`, 'What it is'),
      row(`    "x": ${thing.x}, "y": ${thing.y} }`, 'Where it starts'),
      row(']'),
    )
  }
  return rows.join('')
}

/** One row a place the recorded play runs: its name, and that it ends the same as the others. */
export function engineRows(facts: GameFacts): string {
  return facts.engines
    .map(
      (engine) =>
        `<tr><th scope="row">${escapeHtml(engine)}</th><td class="same"><i data-icon="check-circle"></i><span>Same ending</span></td></tr>`,
    )
    .join('')
}

/** One card a claim, numbered from 01, each with the stamp that says where it stands. */
export function claimCards(claims: readonly Claim[]): string {
  return claims
    .map((claim, at) => {
      const icon = claim.state === 'works' ? '<i data-icon="check"></i>' : ''
      const stamp = `<span class="stamp ${claim.state}">${icon}<span>${STAMP_WORDS[claim.state]}</span></span>`
      const number = String(at + 1).padStart(2, '0')
      return `<li class="claim"><span class="number">${number}</span><h3>${escapeHtml(claim.title)}</h3><p>${escapeHtml(claim.line)}</p>${stamp}</li>`
    })
    .join('')
}
