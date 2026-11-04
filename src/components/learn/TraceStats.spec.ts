import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import type { LearnPhase, TraceMetadata } from '@/types/learn'

import i18n from '@/i18n'

import TraceStats from './TraceStats.vue'

type Wrapper = ReturnType<typeof mount>

const METADATA: TraceMetadata = {
  version: 4,
  size: 33,
  mask: 5,
  level: 'Q',
  blocks: 4,
  dataCodewords: 72,
  eccPerBlock: 18,
  totalCodewords: 144,
  dataModules: 656,
  segments: 'byte',
}

const TERMS = [
  'Version',
  'Size',
  'Level',
  'Segments',
  'Blocks',
  'Data codewords',
  'ECC per block',
  'Total codewords',
  'Data modules',
  'Mask',
] as const

type Term = (typeof TERMS)[number]
type State = 'unknown' | 'active' | 'normal'

const CODEWORD_TERMS = [
  'Blocks',
  'Data codewords',
  'ECC per block',
  'Total codewords',
  'Data modules',
] as const

const VALUES: Record<Term, string> = {
  Version: '4',
  Size: '33×33',
  Level: 'Q',
  Segments: 'byte',
  Blocks: '4',
  'Data codewords': '72',
  'ECC per block': '18',
  'Total codewords': '144',
  'Data modules': '656',
  Mask: '5',
}

const STATE_VALUES = ['unknown', 'active', 'normal']

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function mountStats(
  overrides: Partial<{ metadata: TraceMetadata | null; phase: LearnPhase | null }> = {},
) {
  i18n.global.locale.value = 'en'
  return mount(TraceStats, {
    props: { metadata: METADATA, phase: 'final', ...overrides },
    global: { plugins: [i18n] },
  })
}

function cellFor(wrapper: Wrapper, term: string): HTMLElement {
  const terms = wrapper.findAll('dt')
  const index = terms.findIndex((node) => normalize(node.text()) === term)
  expect(index, `definition term "${term}"`).toBeGreaterThanOrEqual(0)

  const next = terms[index]!.element.nextElementSibling
  if (next?.tagName === 'DD') return next as HTMLElement

  const cells = wrapper.findAll('dd')
  const cell = cells[index]
  expect(cell, `definition value for "${term}"`).toBeDefined()
  return cell!.element as HTMLElement
}

function expectValue(wrapper: Wrapper, term: Term, state: State) {
  const cell = cellFor(wrapper, term)
  const expected = state === 'unknown' ? '?' : VALUES[term]
  expect(normalize(cell.textContent ?? ''), `value of "${term}"`).toBe(expected)
  expect(cell.dataset.state, `state of "${term}"`).toBe(state)
}

function expectStates(wrapper: Wrapper, expected: Partial<Record<State, readonly Term[]>>) {
  for (const state of ['active', 'normal', 'unknown'] as const) {
    for (const term of expected[state] ?? []) expectValue(wrapper, term, state)
  }
}

describe('TraceStats', () => {
  test('shows a hint instead of the list when metadata is null', () => {
    const wrapper = mountStats({ metadata: null })

    expect(wrapper.text()).toContain('Build a trace to see its metadata.')
    expect(wrapper.findAll('dt')).toHaveLength(0)
    expect(wrapper.findAll('dd')).toHaveLength(0)
  })

  test('lists the ten metadata terms in order', () => {
    const wrapper = mountStats()

    expect(wrapper.findAll('dt').map((node) => normalize(node.text()))).toEqual([...TERMS])
  })

  test('keeps the codeword and mask values unknown before data placement', () => {
    const wrapper = mountStats({ phase: 'timing' })

    expectStates(wrapper, {
      normal: ['Version', 'Size', 'Level', 'Segments'],
      unknown: [...CODEWORD_TERMS, 'Mask'],
    })
  })

  test('treats a null phase like a phase before data placement', () => {
    const wrapper = mountStats({ phase: null })

    expectStates(wrapper, {
      normal: ['Version'],
      unknown: [...CODEWORD_TERMS, 'Mask'],
    })
  })

  test('reveals the codeword values as active during data placement', () => {
    const wrapper = mountStats({ phase: 'data_placement' })

    expectStates(wrapper, {
      active: CODEWORD_TERMS,
      normal: ['Version', 'Level'],
      unknown: ['Mask'],
    })
  })

  test('activates the mask value once the mask is chosen', () => {
    const wrapper = mountStats({ phase: 'mask_chosen' })

    expectStates(wrapper, {
      active: ['Mask'],
      normal: [...CODEWORD_TERMS, 'Version', 'Level'],
    })
  })

  test('activates the level and the mask during format info', () => {
    const wrapper = mountStats({ phase: 'format_info' })

    expectStates(wrapper, {
      active: ['Level', 'Mask'],
      normal: ['Version', 'Size', 'Segments', ...CODEWORD_TERMS],
    })
  })

  test('shows every value and no active cell at the final phase', () => {
    const wrapper = mountStats({ phase: 'final' })

    expectStates(wrapper, { normal: TERMS })

    const states = wrapper.findAll('dd').map((node) => (node.element as HTMLElement).dataset.state)
    expect(states).not.toContain('active')
    for (const state of states) expect(STATE_VALUES).toContain(state)
  })
})
