import { RouterLinkStub, mount } from '@vue/test-utils'
import type { DOMWrapper } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import type { SiteThemeColor } from '@/types/theme'

import AppHeader from './AppHeader.vue'

type Wrapper = ReturnType<typeof mount>

const THEMES = [
  { value: 'blue', label: 'Blue' },
  { value: 'red', label: 'Red' },
  { value: 'pink', label: 'Pink' },
  { value: 'yellow', label: 'Yellow' },
] as const

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/** Text a screen reader exposes: nodes marked aria-hidden are removed. */
function accessibleText(node: { element: Element }): string {
  const clone = node.element.cloneNode(true) as Element
  clone.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove())
  return normalize(clone.textContent ?? '')
}

function mountHeader(
  overrides: Partial<{ theme: SiteThemeColor; isDark: boolean; dyslexia: boolean }> = {},
) {
  return mount(AppHeader, {
    props: { theme: 'blue', isDark: false, ...overrides },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

function buttonNamed(wrapper: Wrapper, name: string): DOMWrapper<Element> {
  const button = wrapper.findAll('button').find((node) => {
    const label = node.attributes('aria-label')
    return (label ? normalize(label) : accessibleText(node)) === name
  })
  expect(button, `button named "${name}"`).toBeDefined()
  return button!
}

function themeDetails(wrapper: Wrapper): DOMWrapper<Element> {
  const details = wrapper.find('details')
  expect(details.exists(), 'theme menu').toBe(true)
  return details
}

function isThemeMenuOpen(wrapper: Wrapper): boolean {
  return (themeDetails(wrapper).element as HTMLDetailsElement).open
}

function themeItems(wrapper: Wrapper): DOMWrapper<Element>[] {
  const labels: string[] = THEMES.map((theme) => theme.label)
  return wrapper.findAll('button').filter((node) => labels.includes(accessibleText(node)))
}

function themeItem(wrapper: Wrapper, label: string): DOMWrapper<Element> {
  const item = themeItems(wrapper).find((node) => accessibleText(node) === label)
  expect(item, `theme item "${label}"`).toBeDefined()
  return item!
}

async function openThemeMenu(wrapper: Wrapper) {
  // The browser opens a details through its summary; happy-dom does not, so set
  // the open state the same way the user action would.
  ;(themeDetails(wrapper).element as HTMLDetailsElement).open = true
  await wrapper.vm.$nextTick()
  expect(isThemeMenuOpen(wrapper)).toBe(true)
}

describe('AppHeader', () => {
  test('renders the brand and the Generate and Learn links', () => {
    const wrapper = mountHeader()

    expect(wrapper.text()).toMatch(/infinity/i)

    const links = wrapper.findAllComponents(RouterLinkStub)
    const destinations = links.map((link) => link.props('to'))
    expect(destinations).toContain('/')
    expect(destinations).toContain('/learn')

    expect(links.some((link) => normalize(link.text()) === 'Generate')).toBe(true)
    expect(links.some((link) => normalize(link.text()) === 'Learn')).toBe(true)
  })

  test('offers the four theme choices in the Theme menu', async () => {
    const wrapper = mountHeader()

    expect(isThemeMenuOpen(wrapper)).toBe(false)
    expect(accessibleText(wrapper.get('summary'))).toBe('Theme')

    await openThemeMenu(wrapper)

    expect(themeItems(wrapper).map((node) => accessibleText(node))).toEqual([
      'Blue',
      'Red',
      'Pink',
      'Yellow',
    ])
  })

  test('names the mode button after the mode it switches to', () => {
    const light = mountHeader({ isDark: false })
    const dark = mountHeader({ isDark: true })

    expect(buttonNamed(light, 'Switch to dark mode')).toBeDefined()
    expect(buttonNamed(dark, 'Switch to light mode')).toBeDefined()
  })

  test('emits toggle-mode when the mode button is clicked', async () => {
    const wrapper = mountHeader({ isDark: false })

    await buttonNamed(wrapper, 'Switch to dark mode').trigger('click')

    expect(wrapper.emitted('toggle-mode')).toHaveLength(1)
  })

  test('emits update:theme with the chosen colour and closes the menu', async () => {
    const wrapper = mountHeader()

    await openThemeMenu(wrapper)
    await themeItem(wrapper, 'Red').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:theme')?.at(-1)).toEqual(['red'])
    expect(isThemeMenuOpen(wrapper)).toBe(false)
  })

  test('closes the theme menu on an outside pointer down', async () => {
    const wrapper = mountHeader()

    await openThemeMenu(wrapper)

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(isThemeMenuOpen(wrapper)).toBe(false)
  })

  test('keeps the theme menu open on a pointer down inside it', async () => {
    const wrapper = mountHeader()

    await openThemeMenu(wrapper)

    themeItem(wrapper, 'Pink').element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(isThemeMenuOpen(wrapper)).toBe(true)
  })

  test('closes the theme menu on Escape', async () => {
    const wrapper = mountHeader()

    await openThemeMenu(wrapper)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(isThemeMenuOpen(wrapper)).toBe(false)
  })

  test('offers to enable the dyslexia-friendly font when it is off', async () => {
    const wrapper = mountHeader({ dyslexia: false })

    const button = buttonNamed(wrapper, 'Enable dyslexia-friendly font')
    expect(button.attributes('aria-pressed')).toBe('false')

    await button.trigger('click')

    expect(wrapper.emitted('toggle-dyslexia')).toHaveLength(1)
  })

  test('offers to disable the dyslexia-friendly font when it is on', () => {
    const wrapper = mountHeader({ dyslexia: true })

    const button = buttonNamed(wrapper, 'Disable dyslexia-friendly font')
    expect(button.attributes('aria-pressed')).toBe('true')
  })
})
