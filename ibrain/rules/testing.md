---
id: vue/testing
paths:
  - 'src/**'
  - 'tests/**'
  - '*.test.ts'
---

# Testing in this project

This project overrides the generic `vue/testing` rule.

## Runner

- `bun test` is the test runner. Tests are TypeScript files executed by Bun.
- `bun run type-check` runs `vue-tsc --noEmit`.
- `bun run lint` runs ESLint with zero warnings allowed.
- A component test that needs a DOM uses `happy-dom` or `jsdom` explicitly; do
  not assume a browser environment.

## What must be covered

| Area | Cases |
| --- | --- |
| Payload builders | Every type: valid input, empty input, malformed input, boundary values, escaping |
| Validation | Accepted and rejected URL schemes, email, phone, geo bounds, event dates |
| QR generation | Each correction level produces a matrix; capacity errors are surfaced |
| Learn trace | Phase sequence, metadata, final matrix equality with the generator |
| Export | SVG contains the right size/colours; canvas export produces a non-empty image |

## Invariants

- `LearnTrace.final.matrix()` equals `QrCodeWasm.matrix()` for the same payload
  and level. This test is mandatory and runs on L/M/Q/H.
- A matrix is `size * size` bytes, row-major, values `0` or `1`.
- A failed generation never leaves the previous QR visible as if it succeeded.

## Rules

- Tests are deterministic: no network, no real timers, no dependency on order.
- Use the WASM package's bytes or the Vite asset URL; do not fetch a remote file.
- Do not weaken an assertion to get green.
- Run the full suite before pushing.
