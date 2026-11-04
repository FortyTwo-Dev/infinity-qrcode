import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, test } from 'vitest'
import { nextTick } from 'vue'

import i18n from '@/i18n'

import SectionHelp from './SectionHelp.vue'

type Wrapper = ReturnType<typeof mount>

const LABEL = 'About error correction'
const TITLE = 'Error correction'
const SLOT_TEXT = 'Some explanation'

let wrapper: Wrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function mountSectionHelp(): Wrapper {
  i18n.global.locale.value = 'en'
  wrapper = mount(SectionHelp, {
    props: { label: LABEL, title: TITLE },
    slots: { default: `<p>${SLOT_TEXT}</p>` },
    global: { plugins: [i18n] },
    attachTo: document.body,
  })
  return wrapper
}

function accessibleName(node: Element): string {
  return normalize(node.getAttribute('aria-label') ?? node.textContent ?? '')
}

function findTrigger(): HTMLButtonElement {
  const button = Array.from(document.body.querySelectorAll('button')).find(
    (node) => accessibleName(node) === LABEL,
  )
  expect(button, `trigger button "${LABEL}"`).toBeDefined()
  return button as HTMLButtonElement
}

function findDialog(): HTMLDialogElement {
  const dialog = document.body.querySelector('dialog')
  expect(dialog, 'modal dialog element').not.toBeNull()
  return dialog as HTMLDialogElement
}

function isOpen(dialog: HTMLDialogElement): boolean {
  return dialog.open === true || dialog.hasAttribute('open')
}

function findCloseButton(dialog: HTMLDialogElement): HTMLButtonElement {
  const button = Array.from(dialog.querySelectorAll('button')).find(
    (node) => accessibleName(node) === 'Close',
  )
  expect(button, 'close button "Close"').toBeDefined()
  return button as HTMLButtonElement
}

async function openDialog() {
  mountSectionHelp()
  await findTrigger().click()
  const dialog = findDialog()
  expect(isOpen(dialog), 'dialog open after clicking the trigger').toBe(true)
  return dialog
}

describe('SectionHelp', () => {
  test('starts collapsed and exposes a dialog trigger', () => {
    mountSectionHelp()

    const trigger = findTrigger()
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    const dialog = document.body.querySelector('dialog')
    if (dialog) expect(isOpen(dialog as HTMLDialogElement)).toBe(false)
    expect(wrapper?.emitted('open')).toBeUndefined()
  })

  test('opens the dialog on click and emits open without a payload', async () => {
    mountSectionHelp()

    await findTrigger().click()

    const dialog = findDialog()
    expect(isOpen(dialog)).toBe(true)
    expect(findTrigger().getAttribute('aria-expanded')).toBe('true')
    expect(wrapper?.emitted('open')).toHaveLength(1)
    expect(wrapper?.emitted('open')?.[0]).toEqual([])
  })

  test('shows the title as a heading and renders the default slot', async () => {
    const dialog = await openDialog()

    const heading = Array.from(dialog.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(
      (node) => normalize(node.textContent ?? '') === TITLE,
    )
    expect(heading, `heading "${TITLE}"`).toBeDefined()
    expect(normalize(dialog.textContent ?? '')).toContain(SLOT_TEXT)
  })

  test('closes the dialog when the close button is clicked', async () => {
    const dialog = await openDialog()

    findCloseButton(dialog).click()
    await nextTick()

    expect(isOpen(dialog)).toBe(false)
    expect(findTrigger().getAttribute('aria-expanded')).toBe('false')
  })
})
