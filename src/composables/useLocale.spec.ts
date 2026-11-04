import { mount } from '@vue/test-utils'
import { defineComponent, isRef, nextTick } from 'vue'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import i18n from '@/i18n'
import { useLocale } from '@/composables/useLocale'

type LocaleApi = ReturnType<typeof useLocale>

const SUPPORTED_CODES = ['en', 'fr'] as const

/** Forces the browser languages happy-dom reports. */
function setNavigatorLanguages(languages: string[]) {
  Object.defineProperty(window.navigator, 'languages', {
    configurable: true,
    get: () => [...languages],
  })
  Object.defineProperty(window.navigator, 'language', {
    configurable: true,
    get: () => languages[0] ?? SUPPORTED_CODES[0],
  })
}

function storedLocale(): string | null {
  return window.localStorage.getItem('locale')
}

interface Scenario {
  /** Value stored under "locale" before the detection runs, if any. */
  storage?: string
  /** window.navigator.languages reported during the detection, if forced. */
  languages?: string[]
}

interface Mount {
  api: LocaleApi
  /** The global i18n singleton the mounted composable is wired to. */
  globalI18n: typeof i18n
  wrapper: ReturnType<typeof mount>
}

/**
 * Mounts a minimal dummy component, runs the composable in its setup with the
 * i18n plugin installed globally and returns the captured composable result.
 *
 * The locale detection runs when the i18n singleton is created at import time,
 * so the module registry is reset and the modules are re-imported to re-run
 * the detection against the storage and navigator state prepared above.
 */
async function setupLocale(scenario: Scenario = {}): Promise<Mount> {
  window.localStorage.clear()
  if (scenario.storage !== undefined) {
    window.localStorage.setItem('locale', scenario.storage)
  }
  setNavigatorLanguages(scenario.languages ?? ['en-US', 'en'])

  vi.resetModules()
  const { useLocale: freshUseLocale } = await import('@/composables/useLocale')
  const { default: freshI18n } = await import('@/i18n')

  let captured: LocaleApi | undefined
  const host = defineComponent({
    setup() {
      captured = freshUseLocale()
      return () => null
    },
  })

  const wrapper = mount(host, { global: { plugins: [freshI18n] } })

  expect(captured, 'useLocale returned a value from setup').toBeDefined()
  return { api: captured!, globalI18n: freshI18n, wrapper }
}

beforeEach(() => {
  // i18n is a singleton created at import time: pin the statically imported
  // instance and clean the storage so each test re-detects from a known state.
  window.localStorage.clear()
  i18n.global.locale.value = 'en'
  document.documentElement.lang = ''
  setNavigatorLanguages(['en-US', 'en'])
})

describe('useLocale', () => {
  test('exposes the composable contract', async () => {
    const { api } = await setupLocale()

    for (const key of ['locale', 'locales', 'setLocale', 'toggleLocale', 'readStoredLocale']) {
      expect(api, `member "${key}"`).toHaveProperty(key)
    }
    expect(typeof api.setLocale).toBe('function')
    expect(typeof api.toggleLocale).toBe('function')
    expect(typeof api.readStoredLocale).toBe('function')
  })

  test('lists English first and French second, the French label spelled with a cedilla', async () => {
    const { api } = await setupLocale()

    expect(api.locales).toHaveLength(2)
    expect(api.locales[0]).toMatchObject({ code: 'en', label: 'English' })
    expect(api.locales[1]).toMatchObject({ code: 'fr', label: 'Français' })
    expect(api.locales.map((entry) => entry.code)).toEqual([...SUPPORTED_CODES])
  })

  test('exposes locale as a computed of the global i18n instance', async () => {
    const { api, globalI18n } = await setupLocale()

    expect(isRef(api.locale)).toBe(true)
    expect(api.locale.value).toBe(globalI18n.global.locale.value)

    globalI18n.global.locale.value = 'fr'
    expect(api.locale.value).toBe('fr')

    globalI18n.global.locale.value = 'en'
    expect(api.locale.value).toBe('en')
  })

  test('a valid locale stored in localStorage wins over browser detection', async () => {
    const { api } = await setupLocale({ storage: 'fr', languages: ['en-US', 'en'] })

    expect(api.locale.value).toBe('fr')
  })

  test('ignores an invalid stored locale and falls back to browser detection', async () => {
    const { api } = await setupLocale({ storage: 'de', languages: ['fr-FR'] })

    expect(api.locale.value).toBe('fr')
  })

  test('falls back to English when the stored locale is invalid and no French browser language matches', async () => {
    const { api } = await setupLocale({ storage: 'de', languages: ['en-US', 'en-GB'] })

    expect(api.locale.value).toBe('en')
  })

  test('detects French from the browser languages when nothing is stored', async () => {
    const { api } = await setupLocale({ languages: ['fr-FR'] })

    expect(api.locale.value).toBe('fr')
  })

  test('defaults to English when nothing is stored and no browser language matches', async () => {
    const { api } = await setupLocale({ languages: ['de-DE', 'es-ES'] })

    expect(api.locale.value).toBe('en')
  })

  test('readStoredLocale returns the stored value when it is a supported locale', async () => {
    const { api } = await setupLocale({ storage: 'fr', languages: ['en-US', 'en'] })

    expect(api.readStoredLocale()).toBe('fr')
  })

  test('readStoredLocale never reports an unsupported stored value', async () => {
    const { api } = await setupLocale({ storage: 'de', languages: ['en-US'] })

    const read = api.readStoredLocale()
    expect(
      read === null || read === undefined || SUPPORTED_CODES.includes(read),
      `unsupported "de" leaked as ${JSON.stringify(read)}`,
    ).toBe(true)
  })

  test('setLocale switches the locale, persists it and updates the html lang', async () => {
    const { api } = await setupLocale()

    api.setLocale('fr')

    expect(api.locale.value).toBe('fr')

    // The persistence and html lang effects are applied on the next flush.
    await nextTick()

    expect(storedLocale()).toBe('fr')
    expect(document.documentElement.lang).toBe('fr')

    api.setLocale('en')
    await nextTick()

    expect(api.locale.value).toBe('en')
    expect(storedLocale()).toBe('en')
    expect(document.documentElement.lang).toBe('en')
  })

  test('toggleLocale flips both ways with the same persistence and html lang effects', async () => {
    const { api } = await setupLocale()

    expect(api.locale.value).toBe('en')

    api.toggleLocale()
    expect(api.locale.value).toBe('fr')

    await nextTick()
    expect(storedLocale()).toBe('fr')
    expect(document.documentElement.lang).toBe('fr')

    api.toggleLocale()
    expect(api.locale.value).toBe('en')

    await nextTick()
    expect(storedLocale()).toBe('en')
    expect(document.documentElement.lang).toBe('en')
  })

  test('toggleLocale also flips from a French starting point', async () => {
    const { api } = await setupLocale({ storage: 'fr', languages: ['en-US', 'en'] })

    expect(api.locale.value).toBe('fr')

    api.toggleLocale()
    expect(api.locale.value).toBe('en')

    await nextTick()
    expect(storedLocale()).toBe('en')
    expect(document.documentElement.lang).toBe('en')
  })
})
