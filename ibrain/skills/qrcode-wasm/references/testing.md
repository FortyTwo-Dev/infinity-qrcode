# Testing

## Mandatory invariant

For the same payload and level, the final learn matrix must equal the generator
matrix:

```ts
import { expect, test } from 'bun:test'
import { QrCodeWasm } from 'iqrcode-wasm'
import { LearnTrace } from 'iqrcode-learn-wasm'

for (const level of ['L', 'M', 'Q', 'H'] as const) {
  test(`learn final matrix equals generator (${level})`, () => {
    const qr = new QrCodeWasm('HELLO WORLD', level)
    const trace = new LearnTrace('HELLO WORLD', level, undefined, 50, 100_000, true)
    const last = trace.frame(trace.frame_count() - 1)

    expect(last.matrix()).toEqual(qr.matrix())

    last.free()
    trace.free()
    qr.free()
  })
}
```

Initialize both packages before the tests:

```ts
import { readFileSync } from 'node:fs'
import initQr from 'iqrcode-wasm'
import initLearn from 'iqrcode-learn-wasm'

await initQr({
  module_or_path: readFileSync('node_modules/iqrcode-wasm/iqrcode_wasm_bg.wasm'),
})
await initLearn({
  module_or_path: readFileSync('node_modules/iqrcode-learn-wasm/iqrcode_learn_wasm_bg.wasm'),
})
```

If the test runner resolves package assets differently, point it at the file
with `import.meta.resolve` or a path derived from the package root. Never fetch
a remote file in a test.

## Payload tests

- Every payload type: valid, empty, malformed, boundary.
- URL schemes, email shape, phone normalization, geo bounds, event date order.
- vCard/event escaping (newlines, semicolons).
- A payload that exceeds capacity throws a readable error.

## Manual scan

A QR code that renders is not a QR code that scans. Before release, scan one
code per payload type with a phone, in both light and dark colour schemes.
