// Reads one of Phosphor's regular icons from the installed package. Node only: it reads a file, which a page cannot.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * The text of `@phosphor-icons/core/assets/regular/<name>.svg`, or undefined when there is no such icon. The package
 * exports that folder as a pattern, so resolving a name that is no icon still gives an address and does not throw:
 * a missing icon is only found on reading the file, and that read is what is caught here.
 */
export function readIcon(name: string): string | undefined {
  if (!/^[a-z0-9-]+$/.test(name)) return undefined
  try {
    return readFileSync(
      fileURLToPath(import.meta.resolve(`@phosphor-icons/core/assets/regular/${name}.svg`)),
      'utf8',
    )
  } catch {
    return undefined
  }
}
