import { RouterLinkStub, mount } from '@vue/test-utils'
import { afterEach, describe, expect, test } from 'vitest'

import AppHeader from './AppHeader.vue'

const mounted: Array<ReturnType<typeof mount>> = []

function mountHeader() {
  const wrapper = mount(AppHeader, {
    props: { theme: 'blue', isDark: false },
    global: { stubs: { RouterLink: RouterLinkStub } },
    attachTo: document.body,
  })
  mounted.push(wrapper)
  return wrapper
}

function openMenu(wrapper: ReturnType<typeof mount>) {
  const details = wrapper.get('details').element as HTMLDetailsElement
  details.open = true
  return details
}

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount()
})

describe('AppHeader theme menu', () => {
  test('closes on an outside pointer down', () => {
    const wrapper = mountHeader()
    const details = openMenu(wrapper)

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(details.open).toBe(false)
  })

  test('stays open on a pointer down inside the menu', () => {
    const wrapper = mountHeader()
    const details = openMenu(wrapper)

    details.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(details.open).toBe(true)
  })

  test('closes on Escape', () => {
    const wrapper = mountHeader()
    const details = openMenu(wrapper)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(details.open).toBe(false)
  })

  test('emits the chosen accent and closes the menu', async () => {
    const wrapper = mountHeader()
    const details = openMenu(wrapper)

    const red = wrapper.findAll('button').find((button) => button.text() === 'Red')
    await red?.trigger('click')

    expect(wrapper.emitted('update:theme')?.at(-1)).toEqual(['red'])
    expect(details.open).toBe(false)
  })
})
