/** The window sizes every journey of the page runs at: phone and tablet upright and sideways, and a desktop. */
export const SIZES = [
  { name: 'phone-390x844', width: 390, height: 844 },
  { name: 'phone-844x390', width: 844, height: 390 },
  { name: 'tablet-820x1180', width: 820, height: 1180 },
  { name: 'tablet-1180x820', width: 1180, height: 820 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
] as const
