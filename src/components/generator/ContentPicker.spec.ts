import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import { CONTENT_TYPES } from '@/types/qr'

import ContentPicker from './ContentPicker.vue'

describe('ContentPicker', () => {
  test('renders one radio per content type in a labelled group', () => {
    const wrapper = mount(ContentPicker, { props: { modelValue: 'text' } })

    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(CONTENT_TYPES.length)
    expect(wrapper.get('legend').text()).toBe('Content type')
    expect((wrapper.get('#content-text').element as HTMLInputElement).checked).toBe(true)
    expect((wrapper.get('#content-url').element as HTMLInputElement).checked).toBe(false)
  })

  test('emits the chosen type', async () => {
    const wrapper = mount(ContentPicker, { props: { modelValue: 'text' } })

    await wrapper.get('#content-wi-fi').setValue(true)

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['wi-fi'])
  })

  test('reflects an external model update', async () => {
    const wrapper = mount(ContentPicker, { props: { modelValue: 'text' } })

    await wrapper.setProps({ modelValue: 'sms' })

    expect((wrapper.get('#content-sms').element as HTMLInputElement).checked).toBe(true)
    expect((wrapper.get('#content-text').element as HTMLInputElement).checked).toBe(false)
  })
})
