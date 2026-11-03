# API

## iqrcode-wasm

```ts
import initQr, { QrCodeWasm } from 'iqrcode-wasm'

await initQr({ module_or_path: wasmUrl })

const qr = new QrCodeWasm('HELLO WORLD', 'H') // data, level L|M|Q|H
qr.version() // 2
qr.size() // 25
qr.mask() // 0..7
qr.matrix() // Uint8Array, row-major, 0 light / 1 dark
qr.svg(moduleSize, quietZone) // SVG string
qr.free()
```

- The constructor throws if the level is invalid or the data does not fit.
- There is no version parameter: the generator selects the smallest version.
- `svg()` hard-codes `#000000` and `#ffffff`; for custom colours, render the
  matrix yourself.
- `matrix()` returns a copy; it is safe to keep after `free()`.

## iqrcode-learn-wasm

```ts
import initLearn, { LearnTrace } from 'iqrcode-learn-wasm'

await initLearn({ module_or_path: wasmUrl })

const trace = new LearnTrace(
  data,
  level,
  version,        // number | null/undefined = auto
  stride,         // data modules per frame (1 = one frame per module)
  maxFrames,      // soft cap; structural frames are kept
  maskCandidates, // include the 8 mask evaluation frames
)

trace.version()
trace.size()
trace.mask()
trace.blocks()
trace.data_codewords()
trace.ecc_per_block()
trace.total_codewords()
trace.data_modules()
trace.segments()
trace.frame_count()
trace.frame(index) // LearnFrame
trace.free()
```

- `stride` is the main lever for frame count. `1` is exhaustive, `10` is a good
  UI default, `50` is fast.
- `maxFrames` is soft: the final/structural frames and the mask frames remain.
- The final frame matrix equals `QrCodeWasm.matrix()` for the same input.

## Loading

Vite example:

```ts
import initQr, { QrCodeWasm } from 'iqrcode-wasm'
import qrWasmUrl from 'iqrcode-wasm/iqrcode_wasm_bg.wasm?url'

let ready: Promise<void> | null = null

export function loadQr() {
  ready ??= initQr({ module_or_path: qrWasmUrl }).then(() => undefined)
  return ready
}
```

Add `wasm` to the Workbox `globPatterns` so the asset is precached.
