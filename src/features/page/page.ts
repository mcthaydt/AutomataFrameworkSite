// Wires the home page: the player on the game's place, and the line that says which version of the game it holds.
import { createPlayer } from '../play/play.ts'
import { gameCommitUrl, parseVersion, shortCommit, VERSION_FILE } from '../version/version.ts'

/** Starts the player on `#game` and fills the version line from `/version.json`. Never throws. */
export async function startPage(doc: Document): Promise<void> {
  try {
    const game = doc.getElementById('game')
    if (game) createPlayer(game)
    const line = doc.getElementById('game-version')
    if (!line) return
    // Cached copies of an old version.json would name the wrong game.
    const response = await fetch(`/${VERSION_FILE}`, { cache: 'no-store' })
    const version = response.ok ? parseVersion(await response.text()) : undefined
    // No file, or something that is not one (a home page served for a missing file): the line stays hidden.
    if (version === undefined) return
    line.textContent = 'Game version: '
    const url = gameCommitUrl(version)
    if (url === undefined) line.append(shortCommit(version.game))
    else {
      const link = doc.createElement('a')
      link.href = url
      link.textContent = shortCommit(version.game)
      line.append(link)
    }
    line.hidden = false
  } catch {
    // The page works without its version line; nothing here may stop it.
  }
}
