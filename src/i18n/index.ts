import { createI18n } from 'vue-i18n'

import en from '@/locales/en'
import fr from '@/locales/fr'

export type Locale = 'en' | 'fr'

const LOCALE_STORAGE_KEY = 'locale'

/** Languages the application ships. The first entry is the fallback. */
export const LOCALES: ReadonlyArray<{ code: Locale; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
]

export function isLocale(value: string | null): value is Locale {
  return LOCALES.some((entry) => entry.code === value)
}

export function readStoredLocale(): Locale | null {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    return isLocale(stored) ? stored : null
  } catch {
    return null
  }
}

export function writeStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Storage is optional; the in-memory locale still applies.
  }
}

/** First locale matching the browser languages, else the fallback. */
export function detectLocale(): Locale {
  for (const language of navigator.languages) {
    const prefix = language.split('-')[0]?.toLowerCase()
    if (isLocale(prefix)) return prefix
  }
  return LOCALES[0].code
}

/** Initial locale: the stored choice wins, else the browser language. */
export function initialLocale(): Locale {
  return readStoredLocale() ?? detectLocale()
}

const i18n = createI18n({
  legacy: false,
  locale: initialLocale(),
  fallbackLocale: LOCALES[0].code,
  messages: { en, fr },
})

export default i18n
