# ADR-0001 : Rebuild with iqrcode WASM and two routes

- **Status** : `accepted`
- **Date** : 2026-11-03

## Validation

| Field        | Value |
|--------------|-------|
| Validated    | yes |
| Validated by | FortyTwo_Dev |
| Validated on | 2026-11-03 |

## Context

Infinity QRCode is a single-page Vue application that generates QR codes with
the JavaScript `qrcode` package. The project now owns two WebAssembly packages,
`iqrcode-wasm` (generation) and `iqrcode-learn-wasm` (a frame-by-frame
construction trace), and the site must expose both a normal generator and a
pedagogical view.

The rebuild must remain client-side, keep the existing visual identity, and
replace the old QR implementation completely.

## Decision

- Rebuild the application with Vue 3 and two routes:
  - `/`: generator.
  - `/learn`: step-by-step construction replay.
- Generate with `iqrcode-wasm` (`QrCodeWasm`) and trace with
  `iqrcode-learn-wasm` (`LearnTrace`, `LearnFrame`).
- Render both views from the same matrix renderer (`QrCanvas`) and the same
  export utilities. Do not render one DOM node per module.
- Support ten payload types: text, URL, Wi-Fi, email, vCard, SMS, phone,
  geolocation, event and WhatsApp.
- Keep export formats: SVG, PNG, WebP and JPEG.
- Load each WASM package lazily on the route that needs it, initialize it once,
  and free the WASM objects when they are replaced.
- Preserve the final-trace invariant: the learn final matrix equals the
  generator matrix for the same payload and correction level.

## Consequences

- **Positive**: one rendering path, one export path, a pedagogical view that
  provably matches the generator, and no dependency on the old `qrcode`
  package.
- **Negative**: two WASM bundles to load and cache; the learn view must manage
  frame memory and trace rebuilds carefully.
- **Trade-offs**: the pedagogical view has a larger UI surface, but it shares
  the renderer and domain types with the generator.

## Rejected alternatives

- **Keep the `qrcode` package for generation**: rejected because the project
  owns the WASM implementation and must dogfood it.
- **Two separate applications**: rejected because the two views share the
  renderer, payload builders, theme and shell.
- **Render the learn trace as DOM cells**: rejected for large versions; a
  canvas is required for performance.
- **Server-side generation**: rejected; the product is client-side and
  privacy-friendly by design.
