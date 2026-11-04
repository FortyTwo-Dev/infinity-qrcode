import { RouterLinkStub, mount } from '@vue/test-utils'
import type { DOMWrapper } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import i18n from '@/i18n'

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

type HeaderProps = { isDark: boolean; dyslexia: boolean; locale: 'en' | 'fr' }

function mountHeader(overrides: Partial<HeaderProps> = {}) {
  const props: HeaderProps = {
    isDark: false,
    dyslexia: false,
    locale: 'en',
    ...overrides,
  }

  // Labels come from the global i18n instance: pin it to English so the
  // assertions below stay deterministic regardless of the locale prop.
  i18n.global.locale.value = 'en'

  return mount(AppHeader, {
    props,
    global: {
      plugins: [i18n],
      stubs: { RouterLink: RouterLinkStub },
    },
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

function languageButton(wrapper: Wrapper): DOMWrapper<Element> {
  return buttonNamed(wrapper, 'Switch language')
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

    // The decorative logo must never leak into the accessible text.
    expect(accessibleText(brand)).toBe('Infinity QRCode')
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

  test('does not render a theme menu, only the three control buttons', () => {
    const wrapper = mountHeader({ isDark: true, dyslexia: true })

    expect(wrapper.find('details').exists()).toBe(false)
    expect(wrapper.find('summary').exists()).toBe(false)
    expect(wrapper.find('menu').exists()).toBe(false)

    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)

    for (const button of buttons) {
      expect(button.attributes('type'), 'button type').toBe('button')
      const label = normalize(button.attributes('aria-label') ?? accessibleText(button))
      const known = [
        'Switch language',
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
    expect(toDark.attributes('aria-pressed')).toBe('false')
    expect(light.find('button[aria-label="Switch to light mode"]').exists()).toBe(false)

    const dark = mountHeader({ isDark: true })
    const toLight = buttonNamed(dark, 'Switch to light mode')
    expect(toLight.attributes('aria-pressed')).toBe('true')
    expect(dark.find('button[aria-label="Switch to dark mode"]').exists()).toBe(false)
  })

  test('emits toggle-mode with no payload when the mode button is clicked', async () => {
    const light = mountHeader({ isDark: false })
    await buttonNamed(light, 'Switch to dark mode').trigger('click')
    expect(light.emitted('toggle-mode')).toEqual([[]])

    const dark = mountHeader({ isDark: true })
    await buttonNamed(dark, 'Switch to light mode').trigger('click')
    expect(dark.emitted('toggle-mode')).toEqual([[]])
  })

  test('offers to enable the dyslexia-friendly font when it is off', () => {
    const explicit = mountHeader({ dyslexia: false })
    const button = buttonNamed(explicit, 'Enable dyslexia-friendly font')
    expect(button.attributes('aria-pressed')).toBe('false')
    expect(button.attributes('class') ?? '').not.toContain('primary')
    expect(
      explicit.find('button[aria-label="Disable dyslexia-friendly font"]').exists(),
    ).toBe(false)

    // The dyslexia prop is optional and defaults to off.
    const defaulted = mountHeader()
    expect(buttonNamed(defaulted, 'Enable dyslexia-friendly font')).toBeDefined()
  })

  test('offers to disable the dyslexia-friendly font when it is on', () => {
    const wrapper = mountHeader({ dyslexia: true })

    const button = buttonNamed(wrapper, 'Disable dyslexia-friendly font')
    expect(button.attributes('aria-pressed')).toBe('true')
    expect(button.attributes('class') ?? '').toContain('primary')
    expect(
      wrapper.find('button[aria-label="Enable dyslexia-friendly font"]').exists(),
    ).toBe(false)
  })

  test('emits toggle-dyslexia with no payload when the dyslexia button is clicked', async () => {
    const off = mountHeader({ dyslexia: false })
    await buttonNamed(off, 'Enable dyslexia-friendly font').trigger('click')
    expect(off.emitted('toggle-dyslexia')).toEqual([[]])

    const on = mountHeader({ dyslexia: true })
    await buttonNamed(on, 'Disable dyslexia-friendly font').trigger('click')
    expect(on.emitted('toggle-dyslexia')).toEqual([[]])
  })

  test('labels the language button and shows the other locale as visible text', () => {
    const english = mountHeader({ locale: 'en' })

    const enButton = languageButton(english)
    expect(enButton.attributes('type')).toBe('button')

    const enSpan = enButton.find('span')
    expect(enSpan.exists(), 'a span inside the language button').toBe(true)
    expect(enSpan.attributes('aria-hidden')).toBe('true')
    expect(normalize(enSpan.text())).toBe('FR')

    // The locale prop is optional and defaults to "en".
    const defaulted = mountHeader()
    expect(normalize(languageButton(defaulted).find('span').text())).toBe('FR')

    // The visible text tracks the locale prop, not the i18n plugin.
    const french = mountHeader({ locale: 'fr' })
    const frButton = languageButton(french)
    expect(normalize(frButton.find('span').text())).toBe('EN')
  })

  test('emits toggle-locale with no payload when the language button is clicked', async () => {
    const wrapper = mountHeader()

    await languageButton(wrapper).trigger('click')

    expect(wrapper.emitted('toggle-locale')).toEqual([[]])
    expect(wrapper.emitted('toggle-locale')).toHaveLength(1)
  })

  test('emits only toggle-mode, toggle-dyslexia and toggle-locale, all without payload', async () => {
    const wrapper = mountHeader()

    await buttonNamed(wrapper, 'Switch to dark mode').trigger('click')
    await buttonNamed(wrapper, 'Enable dyslexia-friendly font').trigger('click')
    await languageButton(wrapper).trigger('click')

    const emitted = wrapper.emitted()

    // No other toggle event exists besides the agreed three.
    expect(Object.keys(emitted).filter((name) => name.startsWith('toggle')).sort()).toEqual([
      'toggle-dyslexia',
      'toggle-locale',
      'toggle-mode',
    ])

    // Each of the three fires exactly once, without payload.
    for (const event of ['toggle-mode', 'toggle-dyslexia', 'toggle-locale'] as const) {
      expect(emitted[event], `payload of "${event}"`).toEqual([[]])
    }

    // No model updates leak out of the header either.
    expect(Object.keys(emitted).filter((name) => name.startsWith('update:'))).toEqual([])
  })

  test('emits nothing before any interaction, in any state', () => {
    const wrapper = mountHeader({ isDark: true, dyslexia: true, locale: 'fr' })
    expect(Object.keys(wrapper.emitted())).toEqual([])
  })
})
