import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, test } from 'vitest'

import type { LearnPhase } from '@/types/learn'

import i18n from '@/i18n'

import PhasePanel from './PhasePanel.vue'

type Wrapper = ReturnType<typeof mount>

const EMPTY_MESSAGE = 'No frame selected.'

let wrapper: Wrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function mountPanel(phase: LearnPhase | null, extra: Record<string, unknown> = {}): Wrapper {
  i18n.global.locale.value = 'en'
  wrapper = mount(PhasePanel, {
    props: { phase, ...extra },
    global: { plugins: [i18n] },
    attachTo: document.body,
  })
  return wrapper
}

function textOf(wrapper: Wrapper): string {
  return normalize(wrapper.text())
}

describe('PhasePanel', () => {
  test('names the version information phase and describes it', () => {
    const text = textOf(mountPanel('version_info'))

    expect(text).toContain('Version information')
    expect(text).not.toContain(EMPTY_MESSAGE)

    const description = text.replace('Version information', '').trim()
    expect(description.length, `description after "Version information"`).toBeGreaterThan(0)
  })

  test('names the finder patterns phase', () => {
    const text = textOf(mountPanel('finders'))

    expect(text).toContain('Finder patterns')
    expect(text).not.toContain(EMPTY_MESSAGE)
  })

  test('shows the empty message when no phase is selected', () => {
    const text = textOf(mountPanel(null))

    expect(text).toContain(EMPTY_MESSAGE)
    expect(text).not.toContain('Version information')
    expect(text).not.toContain('Finder patterns')
  })
})
