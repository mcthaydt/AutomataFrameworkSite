import { expect, test } from 'vitest'
import { IconError, inlineIcons } from '#src/features/icons/icons.ts'

const PLAY =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M1,2Z"/></svg>'
const read = (name: string): string | undefined => (name === 'play' ? PLAY : undefined)

test('a placeholder becomes the icon, hidden from screen readers and coloured like the words beside it', () => {
  expect(inlineIcons('<button><i data-icon="play"></i>Play the game</button>', read)).toBe(
    '<button><svg class="icon" aria-hidden="true" focusable="false" viewBox="0 0 256 256" fill="currentColor"><path d="M1,2Z"/></svg>Play the game</button>',
  )
})

test('every placeholder on a page is swapped', () => {
  const out = inlineIcons('<i data-icon="play"></i> and <i data-icon="play"></i>', read)
  expect(out.match(/<svg class="icon"/g)).toHaveLength(2)
  expect(out).not.toContain('data-icon')
})

test('a page with no placeholder comes back as it was', () => {
  expect(inlineIcons('<p>Nothing here</p>', read)).toBe('<p>Nothing here</p>')
})

test('an unknown name stops the build and says which name, which page and where the names are', () => {
  expect(() => inlineIcons('<i data-icon="plya"></i>', read, 'index.html')).toThrow(IconError)
  expect(() => inlineIcons('<i data-icon="plya"></i>', read, 'index.html')).toThrow(
    'index.html asks for the icon "plya", and there is no icon of that name. The names are the file names in @phosphor-icons/core/assets/regular/ (for example "play").',
  )
})

test('without a page name the sentence starts "A page asks for"', () => {
  expect(() => inlineIcons('<i data-icon="plya"></i>', read)).toThrow(/^A page asks for the icon "plya"/)
})

test('a file that is not an icon stops the build too', () => {
  expect(() => inlineIcons('<i data-icon="play"></i>', () => '<html></html>', 'index.html')).toThrow(
    IconError,
  )
})
