import { mount } from '@vue/test-utils'
import type { DOMWrapper } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import type { Router } from 'vue-router'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

// The Learn view owns LearnTrace instances from the external learn package.
// These tests observe the WASM boundary only: every trace that the view builds
// and frees is recorded here, in place of the real bindings.
const learnWasm = vi.hoisted(() => {
  interface InitOutputLike {
    readonly memory?: unknown
  }

  type TraceConstructorArgs = [
    data: string,
    level: string,
    version: number | null | undefined,
    stride: number,
    maxFrames: number,
    maskCandidates: boolean,
  ]

  const MATRIX_SIZE = 4

  const constructorSpy = vi.fn<(...args: TraceConstructorArgs) => void>()
  const init = vi.fn<(_input?: unknown) => Promise<InitOutputLike>>(async () => ({}))
  const traces: MockLearnTrace[] = []
  const freedTraces: MockLearnTrace[] = []

  function emptyMatrix(): Uint8Array {
    return new Uint8Array(MATRIX_SIZE * MATRIX_SIZE)
  }

  function finalMatrix(): Uint8Array {
    return Uint8Array.from([
      1, 0, 0, 1,
      0, 1, 1, 0,
      0, 1, 1, 0,
      1, 0, 0, 1,
    ])
  }

  class MockLearnFrame {
    #matrix: Uint8Array
    #highlight: Uint32Array
    #phase: string
    #size: number

    constructor(size: number, matrix: Uint8Array, phase: string, highlight: Uint32Array) {
      this.#size = size
      this.#matrix = matrix
      this.#phase = phase
      this.#highlight = highlight
    }

    free(): void {}
    matrix(): Uint8Array {
      return this.#matrix
    }
    size(): number {
      return this.#size
    }
    highlight(): Uint32Array {
      return this.#highlight
    }
    phase(): string {
      return this.#phase
    }
    bit_index(): number | undefined {
      return undefined
    }
    mask(): number | undefined {
      return undefined
    }
    penalty(): number | undefined {
      return undefined
    }
  }

  class MockLearnTrace {
    readonly free = vi.fn((): void => {
      freedTraces.push(this)
    })

    #level: string
    #version: number | null | undefined

    constructor(
      data: string,
      level: string,
      version: number | null | undefined,
      stride: number,
      maxFrames: number,
      maskCandidates: boolean,
    ) {
      this.#level = level
      this.#version = version
      constructorSpy(data, level, version, stride, maxFrames, maskCandidates)
      traces.push(this)
    }

    blocks(): number {
      return 1
    }
    data_codewords(): number {
      return 16
    }
    data_modules(): number {
      return 208
    }
    ecc_per_block(): number {
      return 10
    }
    frame_count(): number {
      return 2
    }
    frame(index: number): MockLearnFrame {
      const frames: MockLearnFrame[] = [
        new MockLearnFrame(MATRIX_SIZE, emptyMatrix(), 'empty', new Uint32Array(0)),
        new MockLearnFrame(MATRIX_SIZE, finalMatrix(), 'final', new Uint32Array(0)),
      ]
      const frame = frames[index]
      if (!frame) throw new Error(`learn frame out of range: ${index}`)
      return frame
    }
    level(): string {
      return this.#level
    }
    mask(): number {
      return 0
    }
    segments(): string {
      return 'numeric 5, alphanumeric 5, byte 6'
    }
    size(): number {
      return MATRIX_SIZE
    }
    total_codewords(): number {
      return 26
    }
    version(): number {
      return this.#version ?? 1
    }
  }

  function reset(): void {
    init.mockClear()
    constructorSpy.mockClear()
    traces.length = 0
    freedTraces.length = 0
  }

  return {
    MockLearnFrame,
    MockLearnTrace,
    constructorSpy,
    freedTraces,
    init,
    reset,
    traces,
  }
})

vi.mock('iqrcode-learn-wasm', () => ({
  default: learnWasm.init,
  initSync: vi.fn(() => {
    throw new Error('LearnView must initialize the learn module through the async init')
  }),
  LearnFrame: learnWasm.MockLearnFrame,
  LearnTrace: learnWasm.MockLearnTrace,
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
const TEXT_PAYLOAD = 'Debounce regression probe'

type Wrapper = ReturnType<typeof mount>

const RouterOutletHost = {
  name: 'RouterOutletHost',
  render: () => h(RouterView),
}

const EmptyRouteView = {
  name: 'EmptyRouteView',
  render: () => null,
}

let wrapper: Wrapper | undefined

// Each test receives a fresh application module graph: vi.resetModules()
// clears the loader singleton together with the view module, while the
// external package mocks above stay registered and controllable.
beforeEach(() => {
  vi.resetModules()
  learnWasm.reset()
  learnWasm.init.mockImplementation(async () => ({}))
  vi.useFakeTimers()
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  vi.useRealTimers()
})

// Mounts through the public UI: the view is imported after vi.resetModules()
// so the view and the loader singleton are fresh for this test. The i18n
// instance is imported in the same fresh graph and pinned to English so the
// plugin and any module level consumer resolve the same messages.
async function mountLearnView(): Promise<Router> {
  const i18nModule = await import('@/i18n')
  const { default: learnView } = await import('./LearnView.vue')
  i18nModule.default.global.locale.value = 'en'

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: EmptyRouteView },
      { path: '/learn', name: 'learn', component: learnView },
    ],
  })
  await router.push('/learn')
  await router.isReady()

  wrapper = mount(RouterOutletHost, {
    global: { plugins: [i18nModule.default, router] },
    attachTo: document.body,
  })
  await nextTick()
  await Promise.resolve()
  await Promise.resolve()
  return router
}

async function typeText(text: string): Promise<void> {
  const input = wrapper!.find('input#text')
  expect(input.exists(), 'the default text input of the Learn view').toBe(true)
  await input.setValue(text)
}

async function navigateAway(router: Router): Promise<void> {
  await router.push('/')
  await nextTick()
  await Promise.resolve()
}

// Drains pending microtasks, one round per awaited link of the loader chain,
// then lets Vue flush its render queue.
async function settle(rounds = 12): Promise<void> {
  for (let i = 0; i < rounds; i += 1) {
    await Promise.resolve()
  }
  await nextTick()
}

function retryButton(source: Wrapper): DOMWrapper<Element> | undefined {
  return source.findAll('button').find((node) => {
    const accessible = node.attributes('aria-label') ?? node.attributes('title') ?? node.text()
    return /retry/i.test(accessible)
  })
}

describe('LearnView', () => {
  test('builds exactly one learn trace when valid text settles', async () => {
    await mountLearnView()
    await typeText(TEXT_PAYLOAD)

    await vi.advanceTimersByTimeAsync(DEBOUNCE_GRACE_MS)
    await Promise.resolve()

    const calls = learnWasm.constructorSpy.mock.calls
    expect(calls).toHaveLength(1)
    expect(calls[0]![0]).toBe(TEXT_PAYLOAD)
    expect(CORRECTION_LEVELS).toContain(calls[0]![1])
    expect(learnWasm.traces).toHaveLength(1)
    expect(learnWasm.freedTraces).toHaveLength(0)
  })

  test('does not build a learn trace after the view unmounts before the text settles', async () => {
    const router = await mountLearnView()
    await typeText(TEXT_PAYLOAD)

    await navigateAway(router)
    expect(wrapper!.find('input#text').exists(), 'the Learn view left the DOM').toBe(false)

    await vi.advanceTimersByTimeAsync(DEBOUNCE_GRACE_MS)
    await Promise.resolve()

    expect(learnWasm.constructorSpy).not.toHaveBeenCalled()
    expect(learnWasm.traces).toHaveLength(0)
  })

  test('frees the owned learn trace when the built view unmounts', async () => {
    const router = await mountLearnView()
    await typeText(TEXT_PAYLOAD)

    await vi.advanceTimersByTimeAsync(DEBOUNCE_GRACE_MS)
    await Promise.resolve()
    expect(learnWasm.traces).toHaveLength(1)
    const trace = learnWasm.traces[0]!

    await navigateAway(router)

    expect(trace.free).toHaveBeenCalled()
    expect(learnWasm.freedTraces).toEqual([trace])
  })

  test('recovers the learn flow through the retry action after a failed initialization', async () => {
    learnWasm.init.mockRejectedValueOnce(new Error('learn engine offline'))

    await mountLearnView()
    await settle()

    const retry = retryButton(wrapper!)
    expect(retry, 'retry action after a failed initialization').toBeDefined()

    await retry!.trigger('click')
    await settle()

    expect(learnWasm.init).toHaveBeenCalledTimes(2)
    expect(retryButton(wrapper!), 'retry action cleared after a successful retry').toBeUndefined()

    await typeText(TEXT_PAYLOAD)
    await vi.advanceTimersByTimeAsync(DEBOUNCE_GRACE_MS)
    await Promise.resolve()

    const calls = learnWasm.constructorSpy.mock.calls
    expect(calls).toHaveLength(1)
    expect(calls[0]![0]).toBe(TEXT_PAYLOAD)
    expect(learnWasm.traces).toHaveLength(1)
    expect(learnWasm.freedTraces).toHaveLength(0)
  })

  test('keeps the engine initialization cached across an unmount and a new mount', async () => {
    await mountLearnView()
    expect(learnWasm.init, 'first mount initializes the engine').toHaveBeenCalledTimes(1)

    wrapper?.unmount()
    wrapper = undefined
    document.body.innerHTML = ''

    await mountLearnView()

    expect(learnWasm.init, 'the cached engine must survive the unmount').toHaveBeenCalledTimes(1)
  })
})
