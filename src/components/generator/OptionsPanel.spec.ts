import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, test } from 'vitest'

import type { QrOptions } from '@/types/qr'

import i18n from '@/i18n'

import OptionsPanel from './OptionsPanel.vue'

type Wrapper = ReturnType<typeof mount>

const OPTIONS: QrOptions = {
  level: 'M',
  format: 'png',
  moduleSize: 8,
  quietZone: 4,
  dark: '#000000',
  light: '#ffffff',
}

const QUIET_ZONE_WARNING =
  'No quiet zone. Many scanners need some margin: add at least 1 module or leave room in the layout.'

const INVERTED_WARNING =
  'The dark colour is lighter than the light one. Most scanners expect a dark code on a light background.'

const wrappers: Wrapper[] = []

afterEach(() => {
  for (const wrapper of wrappers) wrapper.unmount()
  wrappers.length = 0
  document.body.innerHTML = ''
})

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function mountOptions(
  overrides: Partial<QrOptions> = {},
  moduleCount: number | null = 33,
): Wrapper {
  i18n.global.locale.value = 'en'
  const wrapper = mount(OptionsPanel, {
    props: { modelValue: { ...OPTIONS, ...overrides }, moduleCount },
    global: { plugins: [i18n] },
  })
  wrappers.push(wrapper)
  return wrapper
}

function textOf(wrapper: Wrapper): string {
  return normalize(wrapper.text())
}

function controlByLabel(wrapper: Wrapper, pattern: RegExp): ReturnType<Wrapper['get']> {
  const label = wrapper.findAll('label').find((node) => pattern.test(normalize(node.text())))
  expect(label, `label matching ${pattern}`).toBeDefined()

  const nested = label!.find('input')
  if (nested.exists()) return nested

  const id = label!.attributes('for')
  expect(id, `for attribute of ${pattern}`).toBeTruthy()
  return wrapper.get(`#${id}`)
}

function isDisabled(control: ReturnType<Wrapper['get']>): boolean {
  return (
    control.attributes('disabled') !== undefined || control.attributes('aria-disabled') === 'true'
  )
}

describe('OptionsPanel', () => {
  test('renders the error correction and format choices', () => {
    const text = textOf(mountOptions())

    for (const label of ['Low (L)', 'Medium (M)', 'Quartile (Q)', 'High (H)']) {
      expect(text).toContain(label)
    }
    for (const format of [/svg/i, /png/i, /webp/i, /jpeg/i]) {
      expect(text).toMatch(format)
    }
  })

  test('renders the module size, quiet zone and colour controls', () => {
    const wrapper = mountOptions()

    expect(controlByLabel(wrapper, /module size/i)).toBeDefined()
    expect(controlByLabel(wrapper, /quiet zone/i)).toBeDefined()

    const colours = wrapper.findAll('input[type="color"]')
    expect(colours).toHaveLength(2)
    expect(colours.map((input) => (input.element as HTMLInputElement).value)).toEqual([
      '#000000',
      '#ffffff',
    ])
  })

  test('warns without a quiet zone and stays silent at one', () => {
    const none = mountOptions({ quietZone: 0 })
    expect(textOf(none)).toContain(QUIET_ZONE_WARNING)

    const margin = mountOptions({ quietZone: 1 })
    expect(textOf(margin)).not.toContain(QUIET_ZONE_WARNING)
  })

  test('warns when the dark colour is lighter than the light one', () => {
    const text = textOf(mountOptions({ dark: '#cccccc', light: '#222222' }))

    expect(text).toContain(INVERTED_WARNING)
  })

  test('warns about low contrast with a ratio below 4.5', () => {
    const text = textOf(mountOptions({ dark: '#777777', light: '#888888' }))

    expect(text).toContain('Low contrast')
    expect(text).toMatch(/\d+(?:\.\d+)?\s*:\s*1/)
  })

  test('stays silent on a high-contrast pair', () => {
    const text = textOf(mountOptions({ dark: '#000000', light: '#ffffff' }))

    expect(text).not.toContain('Low contrast')
    expect(text).not.toContain(INVERTED_WARNING)
  })

  test('derives the export size from the module count, margin and module size', () => {
    const text = textOf(mountOptions({ moduleSize: 8, quietZone: 4 }, 33))

    expect(text).toContain('328 × 328 px')
  })

  test('shows no pixel size without a module count', () => {
    const text = textOf(mountOptions({}, null))

    expect(text).not.toContain('px')
  })

  test('never disables the module size and quiet zone inputs when warning', () => {
    const wrapper = mountOptions({
      quietZone: 0,
      dark: '#777777',
      light: '#888888',
    })
    const text = textOf(wrapper)
    expect(text).toContain(QUIET_ZONE_WARNING)
    expect(text).toContain('Low contrast')

    expect(isDisabled(controlByLabel(wrapper, /module size/i))).toBe(false)
    expect(isDisabled(controlByLabel(wrapper, /quiet zone/i))).toBe(false)
  })
})
