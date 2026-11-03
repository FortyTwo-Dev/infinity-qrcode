---
paths:
  - 'src/composables/**'
  - 'src/lib/**'
  - 'src/views/**'
---

# WASM lifecycle

The application uses two `wasm-bindgen` web-target packages:

- `iqrcode-wasm`: `QrCodeWasm(data, level)` with `matrix()`, `size()`,
  `version()`, `mask()` and `svg()`.
- `iqrcode-learn-wasm`: `LearnTrace(...)` and `LearnFrame`.

## Initialization

- Initialize each module once, lazily, on the route that needs it. Do not load
  the learn module on the generator page or the reverse.
- Import the wasm asset explicitly with Vite's `?url` suffix and pass it to the
  package's default init function. Do not rely on a relative URL inside a
  bundled dependency.
- Keep the init promise in a module-level singleton per package. Concurrent
  callers await the same promise.
- Expose `loading`, `ready` and `error` states to the view.
- A failed initialization is shown, not swallowed. Retry is explicit.

## Ownership

- `QrCodeWasm`, `LearnTrace` and every `LearnFrame` are WASM objects. Call
  `free()` when they are replaced or the view unmounts.
- Do not store a WASM object in a deep `reactive()` or a `ref()` that Vue will
  proxy. Use `shallowRef` and replace the value.
- Copy the matrix and highlight data into ordinary JS arrays before freeing a
  frame.
- Creating a trace is relatively expensive; do not rebuild it on every frame
  change. Rebuild only when content, level, version, stride or mask mode change.

## Learn trace

- `frame.matrix()` is row-major `0`/`1`.
- `frame.highlight()` is a flat `(x, y)` pair array.
- `frame.phase()` is one of `empty`, `finders`, `timing`, `alignment`,
  `format_reserved`, `data_placement`, `mask_candidate`, `mask_chosen`,
  `format_info`, `final`.
- `frame.bit_index()`, `frame.mask()` and `frame.penalty()` are optional.
- The final frame's matrix must equal the generator matrix for the same input.

## Tests

- Test initialization and error propagation.
- Test that the final learn matrix equals the generator matrix for L/M/Q/H.
- Test that `free()` is called when a trace/frame is replaced.
- Tests must not depend on network access; initialize from the package's wasm
  bytes or the Vite URL.
