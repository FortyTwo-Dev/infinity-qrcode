import { beforeEach, describe, expect, test, vi } from 'vitest'

// The learn engine loader keeps its initialization in a module-level
// singleton. These tests exercise the loader boundary only: the wasm-bindgen
// package is replaced by this mock, and every loader module is imported in
// isolation so the singleton starts empty for each test.
const learnWasm = vi.hoisted(() => {
  const init = vi.fn<(_input?: unknown) => Promise<unknown>>()

  return { init }
})

vi.mock('iqrcode-learn-wasm', () => ({
  default: learnWasm.init,
  initSync: vi.fn(() => {
    throw new Error('useLearnWasm must initialize the learn module through the async init')
  }),
}))

type LoaderModule = typeof import('@/composables/useLearnWasm')

async function freshLoader(): Promise<LoaderModule> {
  vi.resetModules()
  return await import('@/composables/useLearnWasm')
}

type LoadOutcome =
  | { readonly kind: 'resolved'; reason?: undefined }
  | { readonly kind: 'rejected'; reason: unknown }

// The public contract of the loader is Promise<void>: a failed attempt may
// reject or settle while exposing its failure through the loader state. These
// tests tolerate both shapes and pin the initialization call counts instead.
async function attempt(load: () => Promise<void>): Promise<LoadOutcome> {
  try {
    await load()
    return { kind: 'resolved' }
  } catch (reason: unknown) {
    return { kind: 'rejected', reason }
  }
}

describe('useLearnWasm', () => {
  beforeEach(() => {
    learnWasm.init.mockReset()
    learnWasm.init.mockImplementation(async () => ({}))
  })

  test('shares one pending initialization between concurrent callers', async () => {
    const { loadLearnWasm } = await freshLoader()

    const first = attempt(loadLearnWasm)
    const second = attempt(loadLearnWasm)
    const [firstOutcome, secondOutcome] = await Promise.all([first, second])

    expect(learnWasm.init).toHaveBeenCalledTimes(1)
    expect(firstOutcome).toEqual({ kind: 'resolved' })
    expect(secondOutcome).toEqual({ kind: 'resolved' })
  })

  test('keeps a successful initialization cached', async () => {
    const { loadLearnWasm } = await freshLoader()

    await attempt(loadLearnWasm)
    await attempt(loadLearnWasm)

    expect(learnWasm.init).toHaveBeenCalledTimes(1)
  })

  test('runs a new initialization on the next call after a rejected one', async () => {
    learnWasm.init.mockRejectedValueOnce(new Error('learn engine offline'))
    const { loadLearnWasm } = await freshLoader()

    const failed = await attempt(loadLearnWasm)
    expect(learnWasm.init).toHaveBeenCalledTimes(1)

    const retried = await attempt(loadLearnWasm)

    expect(learnWasm.init).toHaveBeenCalledTimes(2)
    expect(failed.kind).toBe('rejected')
    expect(retried).toEqual({ kind: 'resolved' })
  })

  test('starts a new initialization for every call after repeated failures', async () => {
    learnWasm.init
      .mockRejectedValueOnce(new Error('first failure'))
      .mockRejectedValueOnce(new Error('second failure'))
    const { loadLearnWasm } = await freshLoader()

    const first = await attempt(loadLearnWasm)
    const second = await attempt(loadLearnWasm)
    const third = await attempt(loadLearnWasm)

    expect(learnWasm.init).toHaveBeenCalledTimes(3)
    expect(first.kind).toBe('rejected')
    expect(second.kind).toBe('rejected')
    expect(third).toEqual({ kind: 'resolved' })
  })
})
