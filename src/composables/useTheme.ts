import { onMounted, ref, watch } from 'vue'

import { THEME_COLORS, type SiteThemeColor } from '@/types/theme'

const STORAGE_MODE = 'theme'
const STORAGE_COLOR = 'themeColor'

function isThemeColor(value: string | null): value is SiteThemeColor {
  return THEME_COLORS.some((entry) => entry.value === value)
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage is optional; the in-memory theme still applies.
  }
}

/** Theme state, persistence and the data-theme/data-accent contract. */
export function useTheme() {
  const theme = ref<SiteThemeColor>('blue')
  const isDark = ref(false)

  function applyTheme() {
    const root = document.documentElement
    root.dataset.theme = isDark.value ? 'dark' : 'light'
    root.dataset.accent = theme.value
    root.style.colorScheme = isDark.value ? 'dark' : 'light'
  }

  function persist() {
    writeStorage(STORAGE_MODE, isDark.value ? 'dark' : 'light')
    writeStorage(STORAGE_COLOR, theme.value)
  }

  function toggleMode() {
    isDark.value = !isDark.value
  }

  function setThemeColor(color: SiteThemeColor) {
    theme.value = color
  }

  onMounted(() => {
    const storedMode = readStorage(STORAGE_MODE)
    isDark.value = storedMode
      ? storedMode === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches

    const storedColor = readStorage(STORAGE_COLOR)
    if (isThemeColor(storedColor)) theme.value = storedColor

    applyTheme()
  })

  watch([theme, isDark], () => {
    applyTheme()
    persist()
  })

  return { theme, isDark, toggleMode, setThemeColor }
}
