---
name: qrcode-wasm
description: Work with the two WebAssembly QR packages used by Infinity QRCode, generate a QR with iqrcode-wasm, replay the construction with iqrcode-learn-wasm, render the matrix, and test that both agree. Use when changing generation, the learn view, matrix rendering, export or the WASM lifecycle.
---

# QRCode WASM

The application uses two packages from the same Rust core:

- `iqrcode-wasm`: the generator.
- `iqrcode-learn-wasm`: the construction trace used by the pedagogical view.

Both are `wasm-bindgen` web-target builds: the default export is an async init
function, and the classes are WASM-owned objects.

## Workflow

1. Read `ibrain resolve <path> --render` for the files you are about to change.
2. Initialize the package once, from the composable/loader, with the explicit
   Vite `?url` asset.
3. Build the payload in `src/lib/qrcode/payloads.ts`; validate it first.
4. Generate or trace; copy the matrix/highlight data into JS arrays.
5. Free the WASM objects when replacing them or unmounting.
6. Test the final trace matrix against the generator matrix.

## References

| Reference | Read it when |
| --- | --- |
| `references/api.md` | The exact constructors, methods and return shapes |
| `references/learn-trace.md` | Phases, frames, stride and trace metadata |
| `references/rendering.md` | Matrix to canvas/SVG, highlights, export |
| `references/testing.md` | Equality test, payload tests, manual scan |

## Non-negotiables

- Do not call the packages directly from a component; use the adapters.
- Do not proxy a WASM object through `reactive()` or deep `ref()`.
- Do not build a new trace for every timeline frame.
- Do not let a capacity error leave a stale QR that looks valid.
