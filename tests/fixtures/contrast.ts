// The WCAG contrast ratio of two colours, shared by a Node test (on the stylesheet's own colours) and the journeys (on
// the colours a browser really drew). Pure: no imports.

/** Red, green and blue (0 to 255) of `#rrggbb`, or of the `rgb(r, g, b)` / `rgba(r, g, b, a)` text a browser gives. */
function channels(colour: string): [number, number, number] {
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(colour.trim())
  if (hex) return [parseInt(hex[1] ?? '0', 16), parseInt(hex[2] ?? '0', 16), parseInt(hex[3] ?? '0', 16)]
  const parts = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i.exec(colour.trim())
  if (parts) return [Number(parts[1]), Number(parts[2]), Number(parts[3])]
  throw new Error(`Not a colour this can read: ${colour}`)
}

/** How bright a colour is to the eye, 0 (black) to 1 (white). */
function brightness(colour: string): number {
  const [r, g, b] = channels(colour).map((value) => {
    const channel = value / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** The contrast ratio of two colours, 1 (the same) to 21 (black on white). Alpha is ignored. */
export function contrast(a: string, b: string): number {
  const [light, dark] = [brightness(a), brightness(b)].sort((x, y) => y - x) as [number, number]
  return (light + 0.05) / (dark + 0.05)
}
