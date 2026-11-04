import { computed, onMounted, watch } from 'vue'

import i18n, { LOCALES, type Locale, readStoredLocale, writeStoredLocale } from '@/i18n'

/** Locale state, persistence and the html lang contract. */
export function useLocale() {
  const locale = computed<Locale>({
    get: () => i18n.global.locale.value as Locale,
    set: (value: Locale) => {
      i18n.global.locale.value = value
    },
  })

  function applyLocale(value: Locale) {
    document.documentElement.lang = value === 'fr' ? 'fr' : 'en'
  }

  function setLocale(value: Locale) {
    locale.value = value
  }

  function toggleLocale() {
    const index = LOCALES.findIndex((entry) => entry.code === locale.value)
    const next = index === 0 ? LOCALES[1].code : LOCALES[0].code
    locale.value = next
  }

  onMounted(() => {
    applyLocale(locale.value)
  })

  watch(locale, (value) => {
    applyLocale(value)
    writeStoredLocale(value)
  })

  return { locale, locales: LOCALES, setLocale, toggleLocale, readStoredLocale }
}
