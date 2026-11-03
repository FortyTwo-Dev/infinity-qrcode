/** Supported accent themes. */
export type SiteThemeColor = 'blue' | 'red' | 'pink' | 'yellow'

/** Light or dark mode. */
export type ThemeMode = 'light' | 'dark'

/** Accent choices shown in the theme picker. */
export const THEME_COLORS: ReadonlyArray<{ value: SiteThemeColor; label: string }> = [
  { value: 'blue', label: 'Blue' },
  { value: 'red', label: 'Red' },
  { value: 'pink', label: 'Pink' },
  { value: 'yellow', label: 'Yellow' },
]
