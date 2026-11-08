import { vi } from 'vitest'

import { describeWasmLoader } from './wasmLoaderTestUtils'

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
  LearnTrace: class {},
}))

async function freshLoader(): Promise<() => Promise<void>> {
  vi.resetModules()
  const { loadLearnWasm } = await import('@/composables/useLearnWasm')
  return loadLearnWasm
}

describeWasmLoader('useLearnWasm', { init: learnWasm.init, loadLoader: freshLoader })
