// Swaps each icon placeholder in a page for the icon's SVG. It is done when the site is built, not by a script on the
// page, so an icon takes the colour of the words beside it (the SVG fills with `currentColor`), needs no code to run,
// and is there with JavaScript off. This file is pure: it reads no file (the caller passes the reader), so the page
// can be a string in a test.

/** A failure with a plain sentence, ready to print when a build stops. */
export class IconError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IconError'
  }
}

/** What a page author writes: `<i data-icon="play"></i>`. */
const PLACEHOLDER = /<i data-icon="([^"]*)"><\/i>/g
/** The opening of every Phosphor icon file. */
const OPENING = '<svg xmlns="http://www.w3.org/2000/svg"'
/** What takes its place in the opening tag: the icon is decoration, so screen readers skip it. */
const DECORATION = '<svg class="icon" aria-hidden="true" focusable="false"'

/**
 * Writes the icon in place of every placeholder in `html`. `read` gives the text of one icon file, or undefined when
 * there is none. An unknown name, or a file that is not an icon, stops the build with a sentence that names the icon
 * and the page (`page` is the page's file name; without it the sentence says "A page").
 */
export function inlineIcons(html: string, read: (name: string) => string | undefined, page?: string): string {
  const who = page ?? 'A page'
  return html.replace(PLACEHOLDER, (_placeholder, name: string) => {
    const svg = read(name)
    if (svg === undefined) {
      throw new IconError(
        `${who} asks for the icon "${name}", and there is no icon of that name. The names are the file names in @phosphor-icons/core/assets/regular/ (for example "play").`,
      )
    }
    if (!svg.startsWith(OPENING)) {
      throw new IconError(
        `${who} asks for the icon "${name}", and its file in @phosphor-icons/core/assets/regular/ is not an icon: it does not start with ${OPENING}.`,
      )
    }
    return DECORATION + svg.slice(OPENING.length).trimEnd()
  })
}
