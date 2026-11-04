import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, test } from 'vitest'
import { nextTick } from 'vue'

import type { LearnPhase } from '@/types/learn'

import i18n from '@/i18n'

import PhaseHelp from './PhaseHelp.vue'

type Wrapper = ReturnType<typeof mount>

const TRIGGER_NAME = 'About this step'

let wrapper: Wrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function accessibleName(node: Element): string {
  return normalize(node.getAttribute('aria-label') ?? node.textContent ?? '')
}

function mountHelp(phase: LearnPhase | null): Wrapper {
  i18n.global.locale.value = 'en'
  wrapper = mount(PhaseHelp, {
    props: { phase },
    global: { plugins: [i18n] },
    attachTo: document.body,
  })
  return wrapper
}

function findTrigger(): HTMLButtonElement | undefined {
  return Array.from(document.body.querySelectorAll('button')).find(
    (node) => accessibleName(node) === TRIGGER_NAME,
  )
}

function findDialog(): HTMLDialogElement {
  const dialog = document.body.querySelector('dialog')
  expect(dialog, 'modal dialog element').not.toBeNull()
  return dialog as HTMLDialogElement
}

function dialogText(dialog: HTMLDialogElement): string {
  return normalize(dialog.textContent ?? '')
}

async function openHelp(phase: LearnPhase): Promise<HTMLDialogElement> {
  mountHelp(phase)

  const trigger = findTrigger()
  expect(trigger, `trigger button "${TRIGGER_NAME}"`).toBeDefined()
  await trigger!.click()
  await nextTick()

  const dialog = findDialog()
  expect(dialog.open || dialog.hasAttribute('open'), 'dialog open after the click').toBe(true)
  return dialog
}

describe('PhaseHelp', () => {
  test('renders no trigger without a phase', () => {
    mountHelp(null)

    expect(findTrigger()).toBeUndefined()
  })

  test('renders the trigger for a selected phase', () => {
    mountHelp('finders')

    const trigger = findTrigger()
    expect(trigger).toBeDefined()
    expect(trigger!.getAttribute('aria-haspopup')).toBe('dialog')
  })

  test('opens a dialog with the phase title and an explanation', async () => {
    const dialog = await openHelp('version_info')
    const text = dialogText(dialog)

    expect(text).toContain('Version information')
    expect(text.replace('Version information', '').trim().length).toBeGreaterThan(20)
  })

  test('explains mask evaluation with formulas and the N1 penalty', async () => {
    const text = dialogText(await openHelp('mask_candidate'))

    expect(text).toContain('Mask evaluation')
    expect(text).toContain('0: (x + y) % 2 = 0')
    expect(text).toContain('N1')
  })

  test('explains the format information BCH code', async () => {
    const text = dialogText(await openHelp('format_info'))

    expect(text).toContain('BCH(15,5)')
    expect(text).toContain('0x5412')
  })

  test('explains the version information BCH code', async () => {
    const text = dialogText(await openHelp('version_info'))

    expect(text).toContain('BCH(18,6)')
    expect(text).toContain('0x1F25')
  })
})
