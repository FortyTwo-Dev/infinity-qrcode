import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import i18n from '@/i18n'

import ContentPicker from './ContentPicker.vue'

type Wrapper = ReturnType<typeof mount>

const TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'url', label: 'URL' },
  { value: 'wi-fi', label: 'Wi-Fi' },
  { value: 'email', label: 'Email' },
  { value: 'vcard', label: 'vCard' },
  { value: 'sms', label: 'SMS' },
  { value: 'phone', label: 'Phone' },
  { value: 'geo', label: 'Location' },
  { value: 'event', label: 'Event' },
  { value: 'whatsapp', label: 'WhatsApp' },
] as const

type ContentValue = (typeof TYPES)[number]['value']

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function mountPicker(modelValue: ContentValue = 'text') {
  i18n.global.locale.value = 'en'
  return mount(ContentPicker, {
    props: { modelValue },
    global: { plugins: [i18n] },
  })
}

function radioFor(wrapper: Wrapper, labelText: string) {
  const label = wrapper.findAll('label').find((node) => normalize(node.text()) === labelText)
  expect(label, `label "${labelText}"`).toBeDefined()

  const nested = label!.find('input[type="radio"]')
  if (nested.exists()) return nested

  const id = label!.attributes('for')
  expect(id, `for attribute of "${labelText}"`).toBeTruthy()
  return wrapper.get(`[id="${id}"]`)
}

function checked(wrapper: Wrapper, labelText: string): boolean {
  return (radioFor(wrapper, labelText).element as HTMLInputElement).checked
}

describe('ContentPicker', () => {
  test('renders ten radios in the expected order with the group legend', () => {
    const wrapper = mountPicker()

    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(TYPES.length)

    expect(radios.map((radio) => (radio.element as HTMLInputElement).value)).toEqual(
      TYPES.map((type) => type.value),
    )
    expect(wrapper.findAll('legend').map((node) => normalize(node.text()))).toContain(
      'Content type',
    )
  })

  test('labels every radio with the expected content type', () => {
    const wrapper = mountPicker()

    for (const type of TYPES) {
      const radio = radioFor(wrapper, type.label)
      expect(radio.attributes('type'), type.label).toBe('radio')
      expect((radio.element as HTMLInputElement).value, type.label).toBe(type.value)
    }
  })

  test('checks the radio matching modelValue and only that one', () => {
    const wrapper = mountPicker('wi-fi')

    for (const type of TYPES) {
      expect(checked(wrapper, type.label), type.label).toBe(type.value === 'wi-fi')
    }
  })

  test('emits update:modelValue once with the chosen value', async () => {
    const wrapper = mountPicker('text')

    await radioFor(wrapper, 'Email').setValue(true)

    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['email'])
  })

  test.each(['url', 'wi-fi', 'vcard', 'whatsapp'] as const)(
    'checks %s when the prop changes and unchecks the previous one',
    async (next) => {
      const wrapper = mountPicker('text')

      await wrapper.setProps({ modelValue: next })

      for (const type of TYPES) {
        expect(checked(wrapper, type.label), type.label).toBe(type.value === next)
      }
    },
  )
})
