import { onMounted, ref } from 'vue'
import initQr, { QrCodeWasm } from 'iqrcode-wasm'
import qrWasmUrl from 'iqrcode-wasm/iqrcode_wasm_bg.wasm?url'

import type { ErrorCorrectionLevel, QrMatrixData } from '@/types/qr'

let readyPromise: Promise<void> | null = null

/** Initialize the generator WASM module once. */
export function loadQrWasm(): Promise<void> {
  readyPromise ??= initQr({ module_or_path: qrWasmUrl }).then(() => undefined)
  return readyPromise
}

/** Generate a QR matrix; the WASM object is freed before returning. */
export function generateQr(data: string, level: ErrorCorrectionLevel): QrMatrixData {
  const qr = new QrCodeWasm(data, level)
  try {
    return {
      matrix: qr.matrix(),
      size: qr.size(),
      version: qr.version(),
      mask: qr.mask(),
    }
  } finally {
    qr.free()
  }
}

/** Reactive loading state for the generator module. */
export function useQrWasm() {
  const ready = ref(false)
  const error = ref<string | null>(null)

  onMounted(async () => {
    try {
      await loadQrWasm()
      ready.value = true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    }
  })

  return { ready, error }
}
