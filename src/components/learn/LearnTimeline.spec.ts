import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import type { LearnPhase } from '@/types/learn'

import LearnTimeline from './LearnTimeline.vue'

type Wrapper = ReturnType<typeof mount>

const PHASES: LearnPhase[] = ['empty', 'finders', 'data_placement', 'data_placement', 'final']

const RUNS = [
  { frameIndex: 0, title: 'Empty grid' },
  { frameIndex: 1, title: 'Finder patterns' },
  { frameIndex: 2, title: 'Data placement' },
  { frameIndex: 4, title: 'Finished QR code' },
] as const

const TRANSPORT = ['First frame', 'Previous frame', 'Play', 'Next frame', 'Last frame'] as const

const SHARE_URL = 'https://example.test/learn?level=H'

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

function mountTimeline(overrides: Partial<Record<string, unknown>> = {}): Wrapper {
  wrapper = mount(LearnTimeline, {
    props: {
      frameCount: 5,
      frameIndex: 0,
      phases: PHASES,
      playing: false,
      speed: 1,
      shareUrl: SHARE_URL,
      ...overrides,
    },
    attachTo: document.body,
  })
  return wrapper
}

function buttonByName(name: string): HTMLButtonElement {
  const button = Array.from(document.body.querySelectorAll('button')).find(
    (node) => accessibleName(node) === name,
  )
  expect(button, `button "${name}"`).toBeDefined()
  return button as HTMLButtonElement
}

function phaseButton(title: string): HTMLButtonElement {
  return buttonByName(`Jump to ${title}`)
}

function phaseButtons(): HTMLButtonElement[] {
  return Array.from(document.body.querySelectorAll('button')).filter((node) =>
    accessibleName(node).startsWith('Jump to '),
  ) as HTMLButtonElement[]
}

function isDisabled(button: HTMLButtonElement): boolean {
  return button.disabled || button.getAttribute('aria-disabled') === 'true'
}

function speedSelect(): ReturnType<Wrapper['find']> {
  const select = wrapper!
    .findAll('select')
    .find((node) => node.findAll('option').some((option) => normalize(option.text()).includes('×')))
  expect(select, 'speed select').toBeDefined()
  return select!
}

function selectByText(select: ReturnType<Wrapper['find']>, text: string) {
  const option = select.findAll('option').find((node) => normalize(node.text()) === text)
  expect(option, `option "${text}"`).toBeDefined()
  return option!
}

function text(): string {
  return normalize(wrapper!.text())
}

describe('LearnTimeline', () => {
  test('shows the one-based counter for the current frame', () => {
    mountTimeline({ frameIndex: 2 })

    expect(text()).toContain('Frame 3 / 5')
  })

  test('shows an empty counter when there is no frame', () => {
    mountTimeline({ frameCount: 0, frameIndex: 0, phases: [] })

    expect(text()).toContain('Frame 0 / 0')
  })

  test('renders one jump button per run of identical phases', () => {
    mountTimeline()

    expect(phaseButtons()).toHaveLength(RUNS.length)
    for (const run of RUNS) expect(phaseButton(run.title)).toBeDefined()
  })

  test('jumps to the first frame of the selected run', async () => {
    mountTimeline({ frameIndex: 0 })

    phaseButton('Data placement').click()
    await wrapper!.vm.$nextTick()

    expect(wrapper!.emitted('update:frame-index')?.at(-1)).toEqual([2])
  })

  test('marks only the run containing the current frame as current', () => {
    mountTimeline({ frameIndex: 3 })

    const current = phaseButtons().filter(
      (button) => button.getAttribute('aria-current') === 'step',
    )
    expect(current).toHaveLength(1)
    expect(accessibleName(current[0]!)).toBe('Jump to Data placement')
  })

  test('lists the five legend categories', () => {
    mountTimeline()

    const legend = text()
    for (const label of ['Structure', 'Data', 'Masks', 'Format', 'Final']) {
      expect(legend).toContain(label)
    }
  })

  test('exposes the five transport buttons', () => {
    mountTimeline()

    for (const name of TRANSPORT) expect(buttonByName(name)).toBeDefined()
  })

  test('emits the boundary frame from First and Last', async () => {
    mountTimeline({ frameIndex: 2 })

    buttonByName('First frame').click()
    expect(wrapper!.emitted('update:frame-index')?.at(-1)).toEqual([0])

    buttonByName('Last frame').click()
    expect(wrapper!.emitted('update:frame-index')?.at(-1)).toEqual([4])
  })

  test('emits the neighbouring frame from Previous and Next', async () => {
    mountTimeline({ frameIndex: 2 })

    buttonByName('Previous frame').click()
    expect(wrapper!.emitted('update:frame-index')?.at(-1)).toEqual([1])

    buttonByName('Next frame').click()
    expect(wrapper!.emitted('update:frame-index')?.at(-1)).toEqual([3])
  })

  test('disables the backward transport on the first frame', () => {
    mountTimeline({ frameIndex: 0 })

    expect(isDisabled(buttonByName('First frame'))).toBe(true)
    expect(isDisabled(buttonByName('Previous frame'))).toBe(true)
    expect(isDisabled(buttonByName('Next frame'))).toBe(false)
    expect(isDisabled(buttonByName('Last frame'))).toBe(false)
  })

  test('disables the forward transport on the last frame', () => {
    mountTimeline({ frameIndex: 4 })

    expect(isDisabled(buttonByName('Next frame'))).toBe(true)
    expect(isDisabled(buttonByName('Last frame'))).toBe(true)
    expect(isDisabled(buttonByName('First frame'))).toBe(false)
    expect(isDisabled(buttonByName('Previous frame'))).toBe(false)
  })

  test('toggles playback and switches between Play and Pause', () => {
    mountTimeline({ playing: false })
    expect(buttonByName('Play')).toBeDefined()

    buttonByName('Play').click()
    expect(wrapper!.emitted('toggle')).toHaveLength(1)
    expect(wrapper!.emitted('toggle')?.[0]).toEqual([])

    wrapper!.unmount()
    document.body.innerHTML = ''

    mountTimeline({ playing: true })
    expect(buttonByName('Pause')).toBeDefined()
    expect(
      Array.from(document.body.querySelectorAll('button')).some(
        (node) => accessibleName(node) === 'Play',
      ),
    ).toBe(false)
  })

  test('offers four speeds and emits the chosen one as a number', async () => {
    mountTimeline({ speed: 1 })
    const select = speedSelect()

    expect(select.findAll('option').map((option) => normalize(option.text()))).toEqual([
      '0.5×',
      '1×',
      '2×',
      '4×',
    ])

    const option = selectByText(select, '2×')
    await select.setValue((option.element as HTMLOptionElement).value)

    const emitted = wrapper!.emitted('update:speed')?.at(-1)
    expect(emitted).toHaveLength(1)
    expect(typeof emitted?.[0]).toBe('number')
    expect(emitted).toEqual([2])
  })

  test('disables autoplay when reduced motion is requested', () => {
    const note =
      'Autoplay is off because your system asks for reduced motion. Use the arrows to step through.'

    mountTimeline({ reducedMotion: true })
    expect(isDisabled(buttonByName('Play'))).toBe(true)
    expect(text()).toContain(note)

    wrapper!.unmount()
    wrapper = undefined
    document.body.innerHTML = ''

    mountTimeline({ reducedMotion: false })
    expect(isDisabled(buttonByName('Play'))).toBe(false)
  })

  describe('share button', () => {
    const writeText = vi.fn<(text: string) => Promise<void>>()

    beforeEach(() => {
      writeText.mockReset()
      writeText.mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText },
      })
    })

    afterEach(() => {
      Reflect.deleteProperty(navigator, 'clipboard')
    })

    test('copies the share URL and confirms it', async () => {
      mountTimeline({ frameCount: 5 })

      buttonByName('Copy link to this frame').click()
      await flushPromises()

      expect(writeText).toHaveBeenCalledTimes(1)
      expect(writeText).toHaveBeenCalledWith(SHARE_URL)
      expect(buttonByName('Link copied')).toBeDefined()
    })

    test('disables the share button without frames', () => {
      mountTimeline({ frameCount: 0, frameIndex: 0, phases: [] })

      expect(isDisabled(buttonByName('Copy link to this frame'))).toBe(true)
    })
  })
})
