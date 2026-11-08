import { beforeEach, describe, expect, test, vi } from 'vitest'

// The QR engine loader keeps its initialization in a module-level singleton.
// These tests exercise the loader boundary only: the wasm-bindgen package is
// replaced by this mock, and every loader module is imported in isolation so
// the singleton starts empty for each test.
const qrWasm = vi.hoisted(() => {
  const SIZE = 21

  const init = vi.fn<(_input?: unknown) => Promise<unknown>>()
  const constructorSpy = vi.fn<(data: string, level: string) => void>()

  class MockQrCodeWasm {
    readonly free = vi.fn()

    constructor(data: string, level: string) {
      constructorSpy(data, level)
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

  return { MockQrCodeWasm, constructorSpy, init }
})

vi.mock('iqrcode-wasm', () => ({
  default: qrWasm.init,
  initSync: vi.fn(() => {
    throw new Error('useQrWasm must initialize the module through the async init')
  }),
  QrCodeWasm: qrWasm.MockQrCodeWasm,
}))

type LoaderModule = typeof import('@/composables/useQrWasm')

async function freshLoader(): Promise<LoaderModule> {
  vi.resetModules()
  return await import('@/composables/useQrWasm')
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

describe('useQrWasm', () => {
  beforeEach(() => {
    qrWasm.init.mockReset()
    qrWasm.init.mockImplementation(async () => ({}))
  })

  test('shares one pending initialization between concurrent callers', async () => {
    const { loadQrWasm } = await freshLoader()

    const first = attempt(loadQrWasm)
    const second = attempt(loadQrWasm)
    const [firstOutcome, secondOutcome] = await Promise.all([first, second])

    expect(qrWasm.init).toHaveBeenCalledTimes(1)
    expect(firstOutcome).toEqual({ kind: 'resolved' })
    expect(secondOutcome).toEqual({ kind: 'resolved' })
  })

  test('keeps a successful initialization cached', async () => {
    const { loadQrWasm } = await freshLoader()

    await attempt(loadQrWasm)
    await attempt(loadQrWasm)

    expect(qrWasm.init).toHaveBeenCalledTimes(1)
  })

  test('runs a new initialization on the next call after a rejected one', async () => {
    qrWasm.init.mockRejectedValueOnce(new Error('engine offline'))
    const { loadQrWasm } = await freshLoader()

    const failed = await attempt(loadQrWasm)
    expect(qrWasm.init).toHaveBeenCalledTimes(1)

    const retried = await attempt(loadQrWasm)

    expect(qrWasm.init).toHaveBeenCalledTimes(2)
    expect(failed.kind).toBe('rejected')
    expect(retried).toEqual({ kind: 'resolved' })
  })

  test('starts a new initialization for every call after repeated failures', async () => {
    qrWasm.init
      .mockRejectedValueOnce(new Error('first failure'))
      .mockRejectedValueOnce(new Error('second failure'))
    const { loadQrWasm } = await freshLoader()

    const first = await attempt(loadQrWasm)
    const second = await attempt(loadQrWasm)
    const third = await attempt(loadQrWasm)

    expect(qrWasm.init).toHaveBeenCalledTimes(3)
    expect(first.kind).toBe('rejected')
    expect(second.kind).toBe('rejected')
    expect(third).toEqual({ kind: 'resolved' })
  })
})
