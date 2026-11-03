import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import type { LearnPhase, TraceMetadata } from '@/types/learn'

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

const CODEWORD_TERMS = [
  'Blocks',
  'Data codewords',
  'ECC per block',
  'Total codewords',
  'Data modules',
] as const

const STATE_VALUES = ['unknown', 'active', 'normal']

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function mountStats(
  overrides: Partial<{ metadata: TraceMetadata | null; phase: LearnPhase | null }> = {},
) {
  return mount(TraceStats, {
    props: { metadata: METADATA, phase: 'final', ...overrides },
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

function expectValue(wrapper: Wrapper, term: string, value: string, state: string) {
  const cell = cellFor(wrapper, term)
  expect(normalize(cell.textContent ?? ''), `value of "${term}"`).toBe(value)
  expect(cell.dataset.state, `state of "${term}"`).toBe(state)
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

    expectValue(wrapper, 'Version', '4', 'normal')
    expectValue(wrapper, 'Size', '33×33', 'normal')
    expectValue(wrapper, 'Level', 'Q', 'normal')
    expectValue(wrapper, 'Segments', 'byte', 'normal')

    for (const term of CODEWORD_TERMS) expectValue(wrapper, term, '?', 'unknown')
    expectValue(wrapper, 'Mask', '?', 'unknown')
  })

  test('treats a null phase like a phase before data placement', () => {
    const wrapper = mountStats({ phase: null })

    for (const term of CODEWORD_TERMS) expectValue(wrapper, term, '?', 'unknown')
    expectValue(wrapper, 'Mask', '?', 'unknown')
    expectValue(wrapper, 'Version', '4', 'normal')
  })

  test('reveals the codeword values as active during data placement', () => {
    const wrapper = mountStats({ phase: 'data_placement' })

    expectValue(wrapper, 'Blocks', '4', 'active')
    expectValue(wrapper, 'Data codewords', '72', 'active')
    expectValue(wrapper, 'ECC per block', '18', 'active')
    expectValue(wrapper, 'Total codewords', '144', 'active')
    expectValue(wrapper, 'Data modules', '656', 'active')

    expectValue(wrapper, 'Mask', '?', 'unknown')
    expectValue(wrapper, 'Version', '4', 'normal')
    expectValue(wrapper, 'Level', 'Q', 'normal')
  })

  test('activates the mask value once the mask is chosen', () => {
    const wrapper = mountStats({ phase: 'mask_chosen' })

    expectValue(wrapper, 'Mask', '5', 'active')

    expectValue(wrapper, 'Blocks', '4', 'normal')
    expectValue(wrapper, 'Data codewords', '72', 'normal')
    expectValue(wrapper, 'ECC per block', '18', 'normal')
    expectValue(wrapper, 'Total codewords', '144', 'normal')
    expectValue(wrapper, 'Data modules', '656', 'normal')
    expectValue(wrapper, 'Version', '4', 'normal')
    expectValue(wrapper, 'Level', 'Q', 'normal')
  })

  test('activates the level and the mask during format info', () => {
    const wrapper = mountStats({ phase: 'format_info' })

    expectValue(wrapper, 'Level', 'Q', 'active')
    expectValue(wrapper, 'Mask', '5', 'active')

    expectValue(wrapper, 'Version', '4', 'normal')
    expectValue(wrapper, 'Size', '33×33', 'normal')
    expectValue(wrapper, 'Segments', 'byte', 'normal')
    expectValue(wrapper, 'Blocks', '4', 'normal')
    expectValue(wrapper, 'Data codewords', '72', 'normal')
    expectValue(wrapper, 'ECC per block', '18', 'normal')
    expectValue(wrapper, 'Total codewords', '144', 'normal')
    expectValue(wrapper, 'Data modules', '656', 'normal')
  })

  test('shows every value and no active cell at the final phase', () => {
    const wrapper = mountStats({ phase: 'final' })

    expectValue(wrapper, 'Version', '4', 'normal')
    expectValue(wrapper, 'Size', '33×33', 'normal')
    expectValue(wrapper, 'Level', 'Q', 'normal')
    expectValue(wrapper, 'Segments', 'byte', 'normal')
    expectValue(wrapper, 'Blocks', '4', 'normal')
    expectValue(wrapper, 'Data codewords', '72', 'normal')
    expectValue(wrapper, 'ECC per block', '18', 'normal')
    expectValue(wrapper, 'Total codewords', '144', 'normal')
    expectValue(wrapper, 'Data modules', '656', 'normal')
    expectValue(wrapper, 'Mask', '5', 'normal')

    const states = wrapper.findAll('dd').map((node) => (node.element as HTMLElement).dataset.state)
    expect(states).not.toContain('active')
    for (const state of states) expect(STATE_VALUES).toContain(state)
  })
})
