import { RouterLinkStub, mount } from '@vue/test-utils'
import type { DOMWrapper } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import AppHeader from './AppHeader.vue'

type Wrapper = ReturnType<typeof mount>

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/** Text a screen reader exposes: nodes marked aria-hidden are removed. */
function accessibleText(node: { element: Element }): string {
  const clone = node.element.cloneNode(true) as Element
  clone.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove())
  return normalize(clone.textContent ?? '')
}

function mountHeader(overrides: Partial<{ isDark: boolean; dyslexia: boolean }> = {}) {
  return mount(AppHeader, {
    props: { isDark: false, ...overrides },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

/** Finds a link by its router destination and its accessible text. */
function linkNamed(wrapper: Wrapper, to: string, name: string) {
  const link = wrapper
    .findAllComponents(RouterLinkStub)
    .filter((node) => node.props('to') === to)
    .find((node) => accessibleText(node) === name)
  expect(link, `link "${to}" named "${name}"`).toBeDefined()
  return link!
}

function buttonNamed(wrapper: Wrapper, name: string): DOMWrapper<Element> {
  const button = wrapper.findAll('button').find((node) => {
    const label = node.attributes('aria-label')
    return (label ? normalize(label) : accessibleText(node)) === name
  })
  expect(button, `button named "${name}"`).toBeDefined()
  return button!
}

describe('AppHeader', () => {
  test('renders exactly one brand link to the home page', () => {
    const wrapper = mountHeader()

    const brands = wrapper.findAllComponents(RouterLinkStub).filter((node) => {
      return node.props('to') === '/' && accessibleText(node) === 'Infinity QRCode'
    })
    expect(brands).toHaveLength(1)
  })

  test('renders the brand logo as a decorative image', () => {
    const wrapper = mountHeader()

    const brand = linkNamed(wrapper, '/', 'Infinity QRCode')
    const images = brand.findAll('img')
    expect(images).toHaveLength(1)

    const logo = images[0]
    expect(logo.attributes('src')).toBe('/img/logo.png')
    expect(logo.attributes('alt')).toBe('')
    expect(logo.attributes('aria-hidden')).toBe('true')

    // The decorative logo must not leak into the accessible text.
    expect(accessibleText(brand)).toBe('Infinity QRCode')
    expect(normalize(brand.element.textContent ?? '')).not.toContain('logo')
  })

  test('renders the Main navigation with the Generate and Learn links', () => {
    const wrapper = mountHeader()

    const nav = wrapper.find('nav[aria-label="Main"]')
    expect(nav.exists(), 'nav labelled "Main"').toBe(true)

    const generate = linkNamed(wrapper, '/', 'Generate')
    const learn = linkNamed(wrapper, '/learn', 'Learn')
    expect(nav.element.contains(generate.element)).toBe(true)
    expect(nav.element.contains(learn.element)).toBe(true)

    const navLinks = nav.findAllComponents(RouterLinkStub)
    expect(navLinks).toHaveLength(2)
  })

  test('does not render a theme menu', () => {
    const wrapper = mountHeader({ isDark: true, dyslexia: true })

    expect(wrapper.find('details').exists()).toBe(false)
    expect(wrapper.find('summary').exists()).toBe(false)
    expect(wrapper.find('menu').exists()).toBe(false)

    // The only buttons are the mode and dyslexia buttons: nothing for accent colours.
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)
    for (const button of buttons) {
      const label = normalize(button.attributes('aria-label') ?? accessibleText(button))
      const known = [
        'Switch to dark mode',
        'Switch to light mode',
        'Enable dyslexia-friendly font',
        'Disable dyslexia-friendly font',
      ]
      expect(known, `unexpected button "${label}"`).toContain(label)
    }
  })

  test('names and marks the mode button after the mode it switches to', () => {
    const light = mountHeader({ isDark: false })
    const toDark = buttonNamed(light, 'Switch to dark mode')
    expect(toDark.attributes('type')).toBe('button')
    expect(toDark.attributes('aria-pressed')).toBe('false')

    const dark = mountHeader({ isDark: true })
    const toLight = buttonNamed(dark, 'Switch to light mode')
    expect(toLight.attributes('type')).toBe('button')
    expect(toLight.attributes('aria-pressed')).toBe('true')
  })

  test('emits toggle-mode with no payload when the mode button is clicked', async () => {
    const wrapper = mountHeader({ isDark: false })

    await buttonNamed(wrapper, 'Switch to dark mode').trigger('click')

    expect(wrapper.emitted('toggle-mode')).toEqual([[]])
    expect(wrapper.emitted('toggle-mode')).toHaveLength(1)
  })

  test('offers to enable the dyslexia-friendly font when it is off', () => {
    const explicit = mountHeader({ dyslexia: false })
    const button = buttonNamed(explicit, 'Enable dyslexia-friendly font')
    expect(button.attributes('aria-pressed')).toBe('false')
    expect(button.attributes('class') ?? '').not.toContain('primary')

    // The dyslexia prop is optional and defaults to off.
    const defaulted = mountHeader()
    expect(buttonNamed(defaulted, 'Enable dyslexia-friendly font')).toBeDefined()
  })

  test('offers to disable the dyslexia-friendly font when it is on', () => {
    const wrapper = mountHeader({ dyslexia: true })

    const button = buttonNamed(wrapper, 'Disable dyslexia-friendly font')
    expect(button.attributes('aria-pressed')).toBe('true')
    expect(button.attributes('class') ?? '').toContain('primary')
  })

  test('emits toggle-dyslexia with no payload when the dyslexia button is clicked', async () => {
    const off = mountHeader({ dyslexia: false })
    await buttonNamed(off, 'Enable dyslexia-friendly font').trigger('click')
    expect(off.emitted('toggle-dyslexia')).toEqual([[]])

    const on = mountHeader({ dyslexia: true })
    await buttonNamed(on, 'Disable dyslexia-friendly font').trigger('click')
    expect(on.emitted('toggle-dyslexia')).toEqual([[]])
  })

  test('emits only toggle-mode and toggle-dyslexia', async () => {
    const wrapper = mountHeader()

    await buttonNamed(wrapper, 'Switch to dark mode').trigger('click')
    await buttonNamed(wrapper, 'Enable dyslexia-friendly font').trigger('click')

    const emitted = Object.keys(wrapper.emitted())
    expect(emitted).toContain('toggle-mode')
    expect(emitted).toContain('toggle-dyslexia')
    expect(emitted.filter((name) => name.startsWith('toggle'))).toEqual([
      'toggle-mode',
      'toggle-dyslexia',
    ])
    expect(emitted.filter((name) => name.startsWith('update:'))).toEqual([])
  })
})
