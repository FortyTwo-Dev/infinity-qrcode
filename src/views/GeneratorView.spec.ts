import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { alertText, retryButton } from './viewTestUtils'

// The generator view owns QrCodeWasm instances from the external qr package.
// These tests observe the WASM boundary only: every engine the view builds is
// recorded here, in place of the real bindings.
const qrWasm = vi.hoisted(() => {
  const SIZE = 21

  const init = vi.fn<(_input?: unknown) => Promise<unknown>>(async () => {
    const thrown = initThrows.shift()
    if (thrown !== undefined) {
      throw thrown
    }
    return {}
  })
  const initThrows: unknown[] = []
  const constructorSpy = vi.fn<(data: string, level: string) => void>()
  // Values thrown by the next construction attempts, in order. The view builds
  // a fresh engine for every generation, so the queue drives one-shot failures
  // while the spy keeps recording every attempt.
  const constructorThrows: unknown[] = []

  class MockQrCodeWasm {
    readonly free = vi.fn()

    constructor(data: string, level: string) {
      const thrown = constructorThrows.shift()
      constructorSpy(data, level)
      if (thrown !== undefined) {
        throw thrown
      }
    }

    matrix(): Uint8Array {
      const matrix = new Uint8Array(SIZE * SIZE)
      matrix[0] = 1
      matrix[SIZE * SIZE - 1] = 1
      return matrix
    }

    size(): number {
      return SIZE
    }

    version(): number {
      return 1
    }

    mask(): number {
      return 0
    }
  }

  function reset(): void {
    initThrows.length = 0
    init.mockClear()
    constructorSpy.mockClear()
    constructorThrows.length = 0
  }

  return { MockQrCodeWasm, constructorSpy, constructorThrows, init, initThrows, reset }
})

vi.mock('iqrcode-wasm', () => ({
  default: qrWasm.init,
  initSync: vi.fn(() => {
    throw new Error('GeneratorView must initialize the module through the async init')
  }),
  QrCodeWasm: qrWasm.MockQrCodeWasm,
}))

// The shared matrix renderer is presentational only and happy-dom cannot draw
// canvas content. A neutral stub keeps the rest of the view mounted.
vi.mock('@components/qr/QrCanvas.vue', async () => {
  const { h: createElement } = await import('vue')
  return {
    default: {
      name: 'QrCanvasStub',
      inheritAttrs: false,
      render: () => createElement('canvas', { hidden: true }),
    },
  }
})

const CORRECTION_LEVELS: readonly string[] = ['L', 'M', 'Q', 'H']

// Any duration safely above the short content debounce of the view.
const DEBOUNCE_GRACE_MS = 1000

// Localized runtime failures the view must show instead of raw engine output.
const INITIALIZE_FAILURE_MESSAGE = 'The QR engine could not be loaded. Try again.'
const GENERATION_FAILURE_MESSAGE =
  'The QR code could not be generated. Check the content and try again.'
const CAPACITY_FAILURE_MESSAGE = 'The content is too large for a QR code. Shorten it and try again.'

// Thrown values only the engine would produce: the view must never surface
// them, whether they arrive as an Error instance or as a bare string.
const RAW_INIT_ERROR_FIRST = 'engine offline'
const RAW_INIT_ERROR_SECOND = 'engine still offline'
const RAW_GENERATION_ERROR = 'low-level generator detail'
const RAW_CAPACITY_ERROR = 'data too long for the selected version'

type Wrapper = ReturnType<typeof mount>

let wrapper: Wrapper | undefined

// Each test receives a fresh application module graph: vi.resetModules()
// clears the loader singleton together with the view module, while the
// external package mocks above stay registered and controllable.
beforeEach(() => {
  vi.resetModules()
  qrWasm.reset()
  vi.useFakeTimers()
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  vi.useRealTimers()
})

// Drains pending microtasks, one round per awaited link of the loader chain,
// then lets Vue flush its render queue.
async function settle(rounds = 12): Promise<void> {
  for (let i = 0; i < rounds; i += 1) {
    await Promise.resolve()
  }
  await nextTick()
}

// Mounts through the public UI: the view is imported after vi.resetModules()
// so the view and the loader singleton are fresh for this test. The i18n
// instance is imported in the same fresh graph and pinned to English so the
// plugin and any module level consumer resolve the same messages.
async function mountGeneratorView(): Promise<void> {
  const i18nModule = await import('@/i18n')
  const { default: view } = await import('./GeneratorView.vue')
  i18nModule.default.global.locale.value = 'en'

  wrapper = mount(view, {
    global: { plugins: [i18nModule.default] },
  })
  await settle()
}

async function typeText(text: string): Promise<void> {
  const input = wrapper!.find('input#text')
  expect(input.exists(), 'the default text input of the generator').toBe(true)
  await input.setValue(text)
}

describe('GeneratorView', () => {
  test('generates a QR code through the normal flow when the engine is ready', async () => {
    await mountGeneratorView()
    await typeText('Normal flow probe')

    await vi.advanceTimersByTimeAsync(DEBOUNCE_GRACE_MS)
    await settle()

    expect(wrapper!.find('canvas').exists()).toBe(true)
    const calls = qrWasm.constructorSpy.mock.calls
    expect(calls).toHaveLength(1)
    expect(calls[0]![0]).toBe('Normal flow probe')
    expect(CORRECTION_LEVELS).toContain(calls[0]![1])
    expect(qrWasm.init).toHaveBeenCalledTimes(1)
  })

  test('keeps the engine initialization cached across an unmount and a new mount', async () => {
    await mountGeneratorView()
    expect(qrWasm.init, 'first mount initializes the engine').toHaveBeenCalledTimes(1)

    wrapper?.unmount()
    wrapper = undefined
    document.body.innerHTML = ''

    await mountGeneratorView()

    expect(qrWasm.init, 'the cached engine must survive the unmount').toHaveBeenCalledTimes(1)
  })

  test('retries initialization from the error state and recovers the normal flow', async () => {
    qrWasm.initThrows.push(new Error(RAW_INIT_ERROR_FIRST))
    qrWasm.initThrows.push(RAW_INIT_ERROR_SECOND)

    await mountGeneratorView()

    expect(qrWasm.init).toHaveBeenCalledTimes(1)
    expect(alertText(wrapper!), 'the first failure shows the localized message').toBe(
      INITIALIZE_FAILURE_MESSAGE,
    )
    expect(wrapper!.text(), 'the raw engine output must never be shown').not.toContain(
      RAW_INIT_ERROR_FIRST,
    )

    const retry = retryButton(wrapper!)
    expect(retry, 'retry action after a failed initialization').toBeDefined()

    await retry!.trigger('click')
    await settle()

    expect(qrWasm.init).toHaveBeenCalledTimes(2)
    expect(alertText(wrapper!), 'a thrown string maps to the same localized message').toBe(
      INITIALIZE_FAILURE_MESSAGE,
    )
    expect(wrapper!.text(), 'the raw thrown string must never be shown').not.toContain(
      RAW_INIT_ERROR_SECOND,
    )
    const retryAgain = retryButton(wrapper!)
    expect(retryAgain, 'retry action still available after a repeated failure').toBeDefined()

    await retryAgain!.trigger('click')
    await settle()

    expect(qrWasm.init).toHaveBeenCalledTimes(3)
    expect(retryButton(wrapper!), 'retry action cleared after a successful retry').toBeUndefined()
    expect(wrapper!.text()).not.toContain('Loading QR engine')
    expect(wrapper!.find('[role="alert"]').exists(), 'no failure alert remains').toBe(false)

    await typeText('Retry recovery probe')
    await vi.advanceTimersByTimeAsync(DEBOUNCE_GRACE_MS)
    await settle()

    expect(wrapper!.find('canvas').exists()).toBe(true)
    const calls = qrWasm.constructorSpy.mock.calls
    expect(calls).toHaveLength(1)
    expect(calls[0]![0]).toBe('Retry recovery probe')
    expect(CORRECTION_LEVELS).toContain(calls[0]![1])
  })

  describe('localized runtime errors', () => {
    test('reports an unknown generation failure with the localized message and no stale preview', async () => {
      await mountGeneratorView()
      await typeText('First successful generation probe')
      await vi.advanceTimersByTimeAsync(DEBOUNCE_GRACE_MS)
      await settle()

      expect(wrapper!.find('canvas').exists(), 'the prior generation rendered a preview').toBe(true)

      qrWasm.constructorThrows.push(new Error(RAW_GENERATION_ERROR))
      await typeText('Second generation probe that fails')
      await vi.advanceTimersByTimeAsync(DEBOUNCE_GRACE_MS)
      await settle()

      expect(alertText(wrapper!), 'a failed generation shows the localized message').toBe(
        GENERATION_FAILURE_MESSAGE,
      )
      expect(wrapper!.text(), 'the raw engine output must never be shown').not.toContain(
        RAW_GENERATION_ERROR,
      )
      expect(wrapper!.find('canvas').exists(), 'no stale preview remains after a failure').toBe(
        false,
      )

      const retry = retryButton(wrapper!)
      expect(retry, 'retry action after a failed generation').toBeDefined()

      await retry!.trigger('click')
      await settle()
      await vi.advanceTimersByTimeAsync(DEBOUNCE_GRACE_MS)
      await settle()

      expect(
        wrapper!.find('[role="alert"]').exists(),
        'the failure alert is cleared after a retry',
      ).toBe(false)
      expect(wrapper!.find('canvas').exists(), 'the retry recovered the preview').toBe(true)
    })

    test('reports a capacity failure with the localized message and no stale preview', async () => {
      await mountGeneratorView()
      await typeText('First successful generation probe')
      await vi.advanceTimersByTimeAsync(DEBOUNCE_GRACE_MS)
      await settle()

      expect(wrapper!.find('canvas').exists(), 'the prior generation rendered a preview').toBe(true)

      qrWasm.constructorThrows.push(RAW_CAPACITY_ERROR)
      await typeText('Second generation probe that overflows')
      await vi.advanceTimersByTimeAsync(DEBOUNCE_GRACE_MS)
      await settle()

      expect(alertText(wrapper!), 'a data-too-long string shows the capacity message').toBe(
        CAPACITY_FAILURE_MESSAGE,
      )
      expect(wrapper!.text(), 'the raw capacity output must never be shown').not.toContain(
        RAW_CAPACITY_ERROR,
      )
      expect(wrapper!.find('canvas').exists(), 'no stale preview remains after a failure').toBe(
        false,
      )
    })
  })
})
