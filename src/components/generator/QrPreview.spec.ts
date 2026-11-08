import { mount } from '@vue/test-utils'
import type { DOMWrapper } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import type { QrMatrixData, QrOptions } from '@/types/qr'

import i18n from '@/i18n'

import QrPreview from './QrPreview.vue'

type Wrapper = ReturnType<typeof mount>

const DATA: QrMatrixData = {
  matrix: new Uint8Array([1, 0, 0, 1]),
  size: 2,
  version: 1,
  mask: 0,
}

const OPTIONS: QrOptions = {
  level: 'M',
  format: 'png',
  moduleSize: 8,
  quietZone: 4,
  dark: '#000000',
  light: '#ffffff',
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function mountPreview(
  overrides: Partial<{
    data: QrMatrixData | null
    options: QrOptions
    loading: boolean
    error: string | null
  }> = {},
) {
  i18n.global.locale.value = 'en'
  return mount(QrPreview, {
    props: { data: DATA, options: OPTIONS, loading: false, error: null, ...overrides },
    global: { plugins: [i18n] },
  })
}

function downloadButton(wrapper: Wrapper): DOMWrapper<Element> {
  const button = wrapper.findAll('button').find((node) => {
    const accessible = node.attributes('aria-label') ?? node.attributes('title') ?? node.text()
    return /download/i.test(accessible)
  })
  expect(button, 'download button').toBeDefined()
  return button!
}

function retryButton(wrapper: Wrapper): DOMWrapper<Element> | undefined {
  return wrapper.findAll('button').find((node) => {
    const accessible = node.attributes('aria-label') ?? node.attributes('title') ?? node.text()
    return /retry/i.test(accessible)
  })
}

function isDisabled(wrapper: Wrapper): boolean {
  return downloadButton(wrapper).attributes('disabled') !== undefined
}

function px(value: string | null | undefined): number | null {
  if (!value) return null
  const match = /^\s*([\d.]+)px\s*$/.exec(value)
  return match ? Number(match[1]) : null
}

function cssWidth(element: Element): number | null {
  const html = element as HTMLElement
  const computed = element.ownerDocument.defaultView?.getComputedStyle(html)
  return (
    px(html.style.width) ?? px(html.style.maxWidth) ?? px(computed?.width) ?? px(computed?.maxWidth)
  )
}

function canvasWidth(wrapper: Wrapper): number {
  const canvas = wrapper.get('canvas')
  const fromCss = cssWidth(canvas.element)
  if (fromCss !== null) return fromCss

  const attribute = canvas.attributes('width')
  return attribute ? Number(attribute) : Number.NaN
}

describe('QrPreview', () => {
  test('invites valid content and disables the download without data', () => {
    const wrapper = mountPreview({ data: null })

    expect(wrapper.text()).toContain('Enter valid content to see the QR code.')
    expect(wrapper.find('canvas').exists()).toBe(false)
    expect(isDisabled(wrapper)).toBe(true)
  })

  test('shows the loading status without canvas or download while loading', () => {
    const wrapper = mountPreview({ data: null, loading: true })

    expect(wrapper.text()).toContain('Loading QR engine')
    expect(wrapper.find('canvas').exists()).toBe(false)
    expect(isDisabled(wrapper)).toBe(true)
  })

  test('announces an error inside a role alert and disables the download', () => {
    const wrapper = mountPreview({ data: null, error: 'The engine failed to start.' })

    const alerts = wrapper.findAll('[role="alert"]')
    expect(alerts.length).toBeGreaterThan(0)
    expect(
      alerts.some((alert) => normalize(alert.text()).includes('The engine failed to start.')),
    ).toBe(true)
    expect(wrapper.find('canvas').exists()).toBe(false)
    expect(isDisabled(wrapper)).toBe(true)
  })

  test('renders the canvas and emits download once when clicked with data', async () => {
    const wrapper = mountPreview()

    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(isDisabled(wrapper)).toBe(false)

    await downloadButton(wrapper).trigger('click')

    expect(wrapper.emitted('download')).toHaveLength(1)
  })

  test('caps the on-screen width independently from the export module size', async () => {
    const small = mountPreview({ options: { ...OPTIONS, moduleSize: 8 } })
    const large = mountPreview({ options: { ...OPTIONS, moduleSize: 24 } })

    await small.vm.$nextTick()
    await large.vm.$nextTick()

    const smallWidth = canvasWidth(small)
    const largeWidth = canvasWidth(large)

    expect(Number.isFinite(smallWidth)).toBe(true)
    expect(Number.isFinite(largeWidth)).toBe(true)
    expect(smallWidth).toBe(largeWidth)
    expect(smallWidth).toBeLessThanOrEqual(360)
    expect(largeWidth).toBeLessThanOrEqual(360)
  })

  test('keeps a large matrix at or below the 360 px display cap', async () => {
    const size = 57
    const matrix = new Uint8Array(size * size).fill(1)
    const wrapper = mountPreview({
      data: { matrix, size, version: 10, mask: 2 },
      options: { ...OPTIONS, moduleSize: 24 },
    })

    await wrapper.vm.$nextTick()

    expect(canvasWidth(wrapper)).toBeLessThanOrEqual(360)
  })

  test('keeps the retry action limited to the error state', () => {
    expect(retryButton(mountPreview()), 'idle state').toBeUndefined()
    expect(retryButton(mountPreview({ data: null, loading: true })), 'loading state').toBeUndefined()
    expect(retryButton(mountPreview()), 'state with data').toBeUndefined()

    const failed = mountPreview({ data: null, error: 'The engine failed to start.' })
    expect(retryButton(failed), 'error state').toBeDefined()
  })

  test('emits retry once when the retry action is clicked', async () => {
    const wrapper = mountPreview({ data: null, error: 'The engine failed to start.' })

    const button = retryButton(wrapper)
    expect(button, 'retry action in the error state').toBeDefined()

    await button!.trigger('click')

    expect(wrapper.emitted('retry')).toHaveLength(1)
  })
})
