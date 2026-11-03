import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, test } from 'vitest'

import type { QrMatrixData, QrOptions } from '@/types/qr'

import QrPreview from './QrPreview.vue'

const options: QrOptions = {
  level: 'H',
  format: 'svg',
  moduleSize: 8,
  quietZone: 4,
  dark: '#000000',
  light: '#ffffff',
}

function matrixData(size = 33): QrMatrixData {
  return { matrix: new Uint8Array(size * size), size, version: 4, mask: 1 }
}

describe('QrPreview', () => {
  test('shows the empty state and disables the download', () => {
    const wrapper = mount(QrPreview, { props: { data: null, options } })

    expect(wrapper.text()).toContain('Enter valid content to see the QR code.')
    expect(wrapper.find('canvas').exists()).toBe(false)
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  test('keeps the preview size independent from the export module size', async () => {
    const wrapper = mount(QrPreview, {
      props: { data: matrixData(), options: { ...options, moduleSize: 24 } },
    })
    await nextTick()

    const canvas = wrapper.get('canvas').element as HTMLCanvasElement

    // (33 modules + 2 * 4 quiet zone) * 8 preview pixels, not * 24 export pixels.
    expect(canvas.width).toBe(328)
    expect(canvas.height).toBe(328)
  })

  test('shrinks the preview for a larger version', async () => {
    const wrapper = mount(QrPreview, {
      props: { data: matrixData(177), options },
    })
    await nextTick()

    const canvas = wrapper.get('canvas').element as HTMLCanvasElement

    expect(canvas.width).toBeLessThanOrEqual(360)
    expect(canvas.width).toBeGreaterThan(0)
  })

  test('emits download when the code is available', async () => {
    const wrapper = mount(QrPreview, { props: { data: matrixData(), options } })

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('download')).toHaveLength(1)
  })

  test('renders the error state as an alert', () => {
    const wrapper = mount(QrPreview, {
      props: { data: null, options, error: 'Content is too long.' },
    })

    expect(wrapper.get('[role="alert"]').text()).toBe('Content is too long.')
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  test('reports the loading state', () => {
    const wrapper = mount(QrPreview, { props: { data: null, options, loading: true } })

    expect(wrapper.get('output').text()).toContain('Loading QR engine')
  })
})
