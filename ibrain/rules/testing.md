---
id: vue/testing
paths:
  - 'src/**'
  - 'tests/**'
  - 'e2e/**'
  - '*.test.ts'
  - '*.spec.ts'
---

# Testing in this project

This project overrides the generic `vue/testing` rule.

## Three layers

| Layer | Path | Command | Purpose |
| --- | --- | --- | --- |
| Domain | `tests/**/*.test.ts` | `bun test` | Pure logic, WASM, export, invariants |
| Components | `src/**/*.spec.ts` | `bun run test:unit` | Mounted Vue components, emitted events, states |
| End to end | `e2e/**/*.spec.ts` | `bun run test:e2e` | Built app in Chromium: flows, layout, CSS |

- `bun test` stays the runner for pure TypeScript. It does not compile `.vue`.
  `bunfig.toml` excludes `src/**/*.spec.ts` so the two runners never overlap.
- Vitest (`bun run test:unit`) runs with `happy-dom` and `@vue/test-utils`.
- Playwright (`bun run test:e2e`) starts its own preview server, built with
  `vite build`, at `http://127.0.0.1:4173`.
- `bun run check` runs lint, type-check, Bun tests and component tests.
  `bun run check:all` adds the end-to-end suite.
- `bun run type-check` runs `vue-tsc --noEmit`.
- `bun run lint` runs ESLint with zero warnings allowed.

## What must be covered

| Area | Layer | Cases |
| --- | --- | --- |
| Payload builders | domain | Every type: valid input, empty input, malformed input, boundary values, escaping |
| Validation | domain | Accepted and rejected URL schemes, email, phone, geo bounds, event dates |
| QR generation | domain | Each correction level produces a matrix; capacity errors are surfaced |
| Learn trace | domain | Phase sequence, metadata, final matrix equality with the generator |
| Export | domain | SVG contains the right size/colours; canvas export produces a non-empty image |
| Forms | component | A validation error appears after input, not before; it clears when valid; it resets on type change |
| Choice groups | component | One radio per option, keyboard order, external model updates |
| Preview | component | Empty, loading and error states; the displayed size ignores the export size |
| Learn controls | component | Four correction levels, chosen level emitted, mask toggle emitted |
| QR code stats | component | Unknown values shown as `?`, revealed at their phase, `data-state` marks the active one |
| Shell | component | Theme menu closes on outside click, Escape and selection |
| Flows | end to end | Generate, switch type, invalid then valid content, download enabled |
| Layout | end to end | No horizontal overflow at 360, 768 and 1440 px; the code stays inside the preview |
| Routes | end to end | `/`, `/learn`, `/credits`, `/legal` and `/privacy` render with no console error |

## Invariants

- `LearnTrace.final.matrix()` equals `QrCodeWasm.matrix()` for the same payload
  and level. This test is mandatory and runs on L/M/Q/H.
- A matrix is `size * size` bytes, row-major, values `0` or `1`.
- A failed generation never leaves the previous QR visible as if it succeeded.
- The preview never grows with `moduleSize`; that value is export-only.

## Rules

- Tests are deterministic: no network, no real timers, no dependency on order.
- Use the WASM package's bytes or the Vite asset URL; do not fetch a remote file.
- End-to-end tests run against the built app, never a remote URL.
- Do not weaken an assertion to get green.
- Run `bun run check:all` before pushing.
