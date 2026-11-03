import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import PayloadForm from './PayloadForm.vue'

describe('PayloadForm validation display', () => {
  test('shows no error before the first input', () => {
    const wrapper = mount(PayloadForm, { props: { type: 'url' } })

    expect(wrapper.findAll('.it-field-error')).toHaveLength(0)
    expect(wrapper.get('#url').attributes('aria-invalid')).toBeUndefined()
  })

  test('shows an error for an invalid URL and clears it for a valid one', async () => {
    const wrapper = mount(PayloadForm, { props: { type: 'url' } })

    await wrapper.get('#url').setValue('not a url')
    expect(wrapper.get('.it-field-error').text()).toBe('Enter a valid URL.')
    expect(wrapper.get('#url').attributes('aria-invalid')).toBe('true')

    await wrapper.get('#url').setValue('example.com')
    expect(wrapper.find('.it-field-error').exists()).toBe(false)
    expect(wrapper.get('#url').attributes('aria-invalid')).toBeUndefined()
  })

  test('hides the error again when the type changes', async () => {
    const wrapper = mount(PayloadForm, { props: { type: 'url' } })

    await wrapper.get('#url').setValue('not a url')
    expect(wrapper.find('.it-field-error').exists()).toBe(true)

    await wrapper.setProps({ type: 'text' })
    expect(wrapper.find('.it-field-error').exists()).toBe(false)
  })

  test('does not require a Wi-Fi password when the network is open', async () => {
    const wrapper = mount(PayloadForm, { props: { type: 'wi-fi' } })

    await wrapper.get('#wifi-ssid').setValue('Open network')
    await wrapper.get('#wifi-encryption').setValue('nopass')

    expect(wrapper.find('#wifi-password').exists()).toBe(false)
    expect(wrapper.emitted('update:payload')?.at(-1)).toEqual(['WIFI:S:Open network;T:nopass;P:;;'])
  })

  test('emits the built payload', async () => {
    const wrapper = mount(PayloadForm, { props: { type: 'text' } })

    await wrapper.get('#text').setValue('Hello')

    expect(wrapper.emitted('update:payload')?.at(-1)).toEqual(['Hello'])
  })
})
