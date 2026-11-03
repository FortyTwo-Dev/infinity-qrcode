import { onMounted, ref, watch } from 'vue'

const STORAGE_KEY = 'readingFont'

function read(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function write(value: string) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Storage is optional; the in-memory preference still applies.
  }
}

/** Reading font preference, persisted and exposed as data-font on <html>. */
export function useDyslexiaFont() {
  const dyslexia = ref(false)

  function apply() {
    if (dyslexia.value) document.documentElement.dataset.font = 'dyslexic'
    else delete document.documentElement.dataset.font
  }

  onMounted(() => {
    dyslexia.value = read() === 'dyslexic'
    apply()
  })

  watch(dyslexia, () => {
    apply()
    write(dyslexia.value ? 'dyslexic' : 'default')
  })

  function toggleDyslexia() {
    dyslexia.value = !dyslexia.value
  }

  return { dyslexia, toggleDyslexia }
}
