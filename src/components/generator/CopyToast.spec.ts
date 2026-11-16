import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import i18n from '@/i18n'

import CopyToast from './CopyToast.vue'

function mountToast(message: string | null) {
  i18n.global.locale.value = 'en'
  return mount(CopyToast, {
    props: { message },
    global: { plugins: [i18n] },
  })
}

describe('CopyToast', () => {
  test('renders nothing without a message', () => {
    const wrapper = mountToast(null)

    expect(wrapper.find('output').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })

  test('shows the confirmation in a polite live region', () => {
    const message = mountToast('QR code copied to the clipboard.').get('output')

    expect(message.text()).toContain('QR code copied to the clipboard.')
    expect(message.attributes('aria-live')).toBe('polite')
    expect(message.attributes('aria-label')).toBe('Copy status')
  })

  test('closes once when the close action is clicked', async () => {
    const wrapper = mountToast('QR code copied to the clipboard.')

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
