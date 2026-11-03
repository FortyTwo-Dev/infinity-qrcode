import { mount } from '@vue/test-utils'
import type { DOMWrapper } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import type { QrcodeType } from '@/types/qr'

import PayloadForm from './PayloadForm.vue'

type Wrapper = ReturnType<typeof mount>

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function mountForm(type: QrcodeType, initialText?: string) {
  return mount(PayloadForm, { props: { type, initialText } })
}

function findControl(wrapper: Wrapper, name: string): DOMWrapper<Element> | undefined {
  const label = wrapper.findAll('label').find((node) => normalize(node.text()) === name)
  if (label) {
    const nested = label.find('input, select, textarea')
    if (nested.exists()) return nested

    const id = label.attributes('for')
    if (id) {
      const byId = wrapper.find(`[id="${id}"]`)
      if (byId.exists()) return byId
    }
  }

  const ariaLabel = wrapper.find(`[aria-label="${name}"]`)
  if (ariaLabel.exists()) return ariaLabel

  return undefined
}

function control(wrapper: Wrapper, name: string): DOMWrapper<Element> {
  const found = findControl(wrapper, name)
  expect(found, `control "${name}"`).toBeDefined()
  return found!
}

function selectByName(wrapper: Wrapper, name: string): DOMWrapper<Element> {
  const found = control(wrapper, name)
  expect(found.element.tagName, `"${name}" is a select`).toBe('SELECT')
  return found
}

function optionByText(select: DOMWrapper<Element>, text: string) {
  const option = select.findAll('option').find((node) => normalize(node.text()) === text)
  expect(option, `option "${text}"`).toBeDefined()
  return option!
}

async function chooseOption(select: DOMWrapper<Element>, text: string) {
  await select.setValue((optionByText(select, text).element as HTMLOptionElement).value)
}

function isInvalid(found: DOMWrapper<Element>): boolean {
  return (
    found.element.getAttribute('aria-invalid') === 'true' ||
    found.element.closest('[aria-invalid="true"]') !== null
  )
}

function lastPayload(wrapper: Wrapper): string | undefined {
  const emitted = wrapper.emitted('update:payload')
  if (!emitted || emitted.length === 0) return undefined
  return emitted.at(-1)?.[0] as string
}

describe('PayloadForm', () => {
  test('shows no validation message and marks no field invalid before any input', () => {
    for (const type of ['text', 'url', 'wi-fi', 'email'] as const) {
      const wrapper = mountForm(type)

      expect(wrapper.text(), type).not.toContain('Enter a valid URL.')
      expect(wrapper.text(), type).not.toContain('Enter some text.')
      expect(wrapper.text(), type).not.toContain('Enter the network password.')
      expect(wrapper.findAll('[aria-invalid="true"]'), type).toHaveLength(0)
    }
  })

  test('renders the controls named by the specification for each type', () => {
    const text = mountForm('text')
    expect(findControl(text, 'Text'), 'Text for text').toBeDefined()

    const url = mountForm('url')
    expect(findControl(url, 'URL'), 'URL for url').toBeDefined()
    expect(findControl(url, 'Protocol'), 'Protocol for url').toBeDefined()

    const email = mountForm('email')
    expect(findControl(email, 'Email address'), 'Email address for email').toBeDefined()

    const wifi = mountForm('wi-fi')
    for (const name of ['Network name (SSID)', 'Encryption', 'Password']) {
      expect(findControl(wifi, name), `${name} for wi-fi`).toBeDefined()
    }
  })

  test('reports an invalid URL, then clears the error and emits an https payload', async () => {
    const wrapper = mountForm('url')

    await control(wrapper, 'URL').setValue('not a url')

    expect(wrapper.text()).toContain('Enter a valid URL.')
    expect(isInvalid(control(wrapper, 'URL'))).toBe(true)

    await control(wrapper, 'URL').setValue('example.com')

    expect(wrapper.text()).not.toContain('Enter a valid URL.')
    expect(isInvalid(control(wrapper, 'URL'))).toBe(false)
    expect(wrapper.findAll('[aria-invalid="true"]')).toHaveLength(0)

    const payload = lastPayload(wrapper)
    expect(payload).toBeDefined()
    expect(payload!.startsWith('https://')).toBe(true)
  })

  test('clears the displayed validation message when the type prop changes', async () => {
    const wrapper = mountForm('url')

    await control(wrapper, 'URL').setValue('not a url')
    expect(wrapper.text()).toContain('Enter a valid URL.')

    await wrapper.setProps({ type: 'text' })

    expect(wrapper.text()).not.toContain('Enter a valid URL.')
    expect(wrapper.findAll('[aria-invalid="true"]')).toHaveLength(0)
  })

  test('emits the typed text as the payload', async () => {
    const wrapper = mountForm('text')

    await control(wrapper, 'Text').setValue('Hello')

    expect(lastPayload(wrapper)).toBe('Hello')
  })

  test('reports an empty text field', async () => {
    const wrapper = mountForm('text')

    await control(wrapper, 'Text').setValue('Hello')
    await control(wrapper, 'Text').setValue('')

    expect(wrapper.text()).toContain('Enter some text.')
    expect(isInvalid(control(wrapper, 'Text'))).toBe(true)
  })

  test('hides the password field and builds a nopass payload for "No password"', async () => {
    const wrapper = mountForm('wi-fi')

    await chooseOption(selectByName(wrapper, 'Encryption'), 'No password')

    expect(findControl(wrapper, 'Password')).toBeUndefined()

    await control(wrapper, 'Network name (SSID)').setValue('MyNet')

    expect(lastPayload(wrapper)).toBe('WIFI:S:MyNet;T:nopass;P:;;')
  })

  test('requires a password when the encryption is WPA', async () => {
    const wrapper = mountForm('wi-fi')

    await control(wrapper, 'Network name (SSID)').setValue('HomeNet')

    expect(wrapper.text()).toContain('Enter the network password.')
    expect(isInvalid(control(wrapper, 'Password'))).toBe(true)
  })

  test('prefills the text input from initialText on the text type', () => {
    const wrapper = mountForm('text', 'Prefilled text')

    expect((control(wrapper, 'Text').element as HTMLInputElement).value).toBe('Prefilled text')
  })

  test('does not prefill the text of another type from initialText', async () => {
    const wrapper = mountForm('url', 'Prefilled text')

    expect(findControl(wrapper, 'Text')).toBeUndefined()
    expect((control(wrapper, 'URL').element as HTMLInputElement).value).toBe('')
  })
})
