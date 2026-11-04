import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import i18n from '@/i18n'

import LearnControls from './LearnControls.vue'

type Wrapper = ReturnType<typeof mount>

const LEVELS = [
  { value: 'L', label: 'Low (L)' },
  { value: 'M', label: 'Medium (M)' },
  { value: 'Q', label: 'Quartile (Q)' },
  { value: 'H', label: 'High (H)' },
] as const

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function mountControls(
  overrides: Partial<{
    level: 'L' | 'M' | 'Q' | 'H'
    version: number | null
    stride: number
    maskCandidates: boolean
  }> = {},
) {
  i18n.global.locale.value = 'en'
  return mount(LearnControls, {
    props: { level: 'L', version: null, stride: 1, maskCandidates: false, ...overrides },
    global: { plugins: [i18n] },
  })
}

function controlByLabel(wrapper: Wrapper, labelText: string) {
  const label = wrapper.findAll('label').find((node) => normalize(node.text()) === labelText)
  expect(label, `label "${labelText}"`).toBeDefined()

  const nested = label!.find('input')
  if (nested.exists()) return nested

  const id = label!.attributes('for')
  expect(id, `for attribute of "${labelText}"`).toBeTruthy()
  return wrapper.get(`#${id}`)
}

function selectWithOption(wrapper: Wrapper, optionText: string) {
  const select = wrapper
    .findAll('select')
    .find((node) =>
      node.findAll('option').some((option) => normalize(option.text()) === optionText),
    )
  expect(select, `select offering "${optionText}"`).toBeDefined()
  return select!
}

function selectedOptionText(select: ReturnType<typeof selectWithOption>): string | undefined {
  const option = select
    .findAll('option')
    .find((node) => (node.element as HTMLOptionElement).selected)
  return option ? normalize(option.text()) : undefined
}

async function chooseOption(select: ReturnType<typeof selectWithOption>, optionText: string) {
  const option = select.findAll('option').find((node) => normalize(node.text()) === optionText)
  expect(option, `option "${optionText}"`).toBeDefined()
  await select.setValue((option!.element as HTMLOptionElement).value)
}

describe('LearnControls', () => {
  test('renders one radio per error correction level and checks the current one', () => {
    const wrapper = mountControls({ level: 'Q' })

    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(4)

    for (const { value, label } of LEVELS) {
      const radio = controlByLabel(wrapper, label)
      expect(radio.attributes('type'), label).toBe('radio')
      expect((radio.element as HTMLInputElement).checked, label).toBe(value === 'Q')
    }
  })

  test('emits update:level once when another level is chosen', async () => {
    const wrapper = mountControls({ level: 'L' })

    await controlByLabel(wrapper, 'High (H)').setValue(true)

    expect(wrapper.emitted('update:level')).toHaveLength(1)
    expect(wrapper.emitted('update:level')?.[0]).toEqual(['H'])
  })

  test('offers Auto then Version 1 to Version 40 and marks Auto when version is null', () => {
    const wrapper = mountControls({ version: null })
    const versionSelect = selectWithOption(wrapper, 'Auto')

    const options = versionSelect.findAll('option').map((option) => normalize(option.text()))
    expect(options).toHaveLength(41)
    expect(options[0]).toBe('Auto')
    expect(options[1]).toBe('Version 1')
    expect(options.at(-1)).toBe('Version 40')
    expect(selectedOptionText(versionSelect)).toBe('Auto')
  })

  test('marks the numbered version matching the prop', () => {
    const wrapper = mountControls({ version: 7 })
    const versionSelect = selectWithOption(wrapper, 'Auto')

    expect(selectedOptionText(versionSelect)).toBe('Version 7')
  })

  test('emits update:version with a number for a numbered version', async () => {
    const wrapper = mountControls({ version: null })

    await chooseOption(selectWithOption(wrapper, 'Auto'), 'Version 12')

    expect(wrapper.emitted('update:version')?.at(-1)).toEqual([12])
  })

  test('emits update:version with null for Auto', async () => {
    const wrapper = mountControls({ version: 5 })

    await chooseOption(selectWithOption(wrapper, 'Auto'), 'Auto')

    expect(wrapper.emitted('update:version')?.at(-1)).toEqual([null])
  })

  test('offers every detail stride and marks the current one', () => {
    const wrapper = mountControls({ stride: 10 })
    const detailSelect = selectWithOption(wrapper, 'Every data module')

    expect(detailSelect.findAll('option').map((option) => normalize(option.text()))).toEqual([
      'Every data module',
      'Every 5 modules',
      'Every 10 modules',
      'Every 20 modules',
      'Every 50 modules',
    ])
    expect(selectedOptionText(detailSelect)).toBe('Every 10 modules')
  })

  test.each([
    ['Every data module', 1],
    ['Every 5 modules', 5],
    ['Every 10 modules', 10],
    ['Every 20 modules', 20],
    ['Every 50 modules', 50],
  ])('emits update:stride for %s (%s)', async (label, stride) => {
    const wrapper = mountControls({ stride: stride === 1 ? 5 : 1 })

    await chooseOption(selectWithOption(wrapper, 'Every data module'), label)

    expect(wrapper.emitted('update:stride')?.at(-1)).toEqual([stride])
  })

  test('checks the mask candidate box from the prop', () => {
    const checked = mountControls({ maskCandidates: true })
    const unchecked = mountControls({ maskCandidates: false })

    const checkedBox = controlByLabel(checked, 'Show the eight mask candidates')
    const uncheckedBox = controlByLabel(unchecked, 'Show the eight mask candidates')

    expect(checkedBox.attributes('type')).toBe('checkbox')
    expect((checkedBox.element as HTMLInputElement).checked).toBe(true)
    expect((uncheckedBox.element as HTMLInputElement).checked).toBe(false)
  })

  test('emits update:mask-candidates when the box is toggled on', async () => {
    const wrapper = mountControls({ maskCandidates: false })

    await controlByLabel(wrapper, 'Show the eight mask candidates').setValue(true)

    expect(wrapper.emitted('update:mask-candidates')?.at(-1)).toEqual([true])
  })

  test('emits update:mask-candidates when the box is toggled off', async () => {
    const wrapper = mountControls({ maskCandidates: true })

    await controlByLabel(wrapper, 'Show the eight mask candidates').setValue(false)

    expect(wrapper.emitted('update:mask-candidates')?.at(-1)).toEqual([false])
  })
})
