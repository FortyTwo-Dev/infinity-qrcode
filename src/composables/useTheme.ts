import { onMounted, ref, watch } from 'vue'

const STORAGE_MODE = 'theme'

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

/** Light/dark mode state, persistence and the data-theme contract. */
export function useTheme() {
  const isDark = ref(false)

  function applyTheme() {
    const root = document.documentElement
    root.dataset.theme = isDark.value ? 'dark' : 'light'
    root.style.colorScheme = isDark.value ? 'dark' : 'light'
  }

  function persist() {
    writeStorage(STORAGE_MODE, isDark.value ? 'dark' : 'light')
  }

  function toggleMode() {
    isDark.value = !isDark.value
  }

  onMounted(() => {
    const storedMode = readStorage(STORAGE_MODE)
    isDark.value = storedMode
      ? storedMode === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches

    applyTheme()
  })

  watch(isDark, () => {
    applyTheme()
    persist()
  })

  return { isDark, toggleMode }
}
