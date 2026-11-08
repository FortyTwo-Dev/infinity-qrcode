import { vi } from 'vitest'

import { describeWasmLoader } from './wasmLoaderTestUtils'

// The QR engine loader keeps its initialization in a module-level singleton.
// These tests exercise the loader boundary only: the wasm-bindgen package is
// replaced by this mock, and every loader module is imported in isolation so
// the singleton starts empty for each test.
const qrWasm = vi.hoisted(() => {
  const init = vi.fn<(_input?: unknown) => Promise<unknown>>()

  return { init }
})

vi.mock('iqrcode-wasm', () => ({
  default: qrWasm.init,
  QrCodeWasm: class {},
}))

async function freshLoader(): Promise<() => Promise<void>> {
  vi.resetModules()
  const { loadQrWasm } = await import('@/composables/useQrWasm')
  return loadQrWasm
}

describeWasmLoader('useQrWasm', { init: qrWasm.init, loadLoader: freshLoader })
