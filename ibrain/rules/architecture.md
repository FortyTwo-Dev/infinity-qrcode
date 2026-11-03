---
paths:
  - 'src/**'
---

# Architecture

Infinity QRCode is a client-side Vue 3 application with two product routes and
three secondary pages:

| Route | View | Purpose |
| --- | --- | --- |
| `/` | `src/views/GeneratorView.vue` | Generate a QR code from a payload |
| `/learn` | `src/views/LearnView.vue` | Replay the construction of a QR code step by step |
| `/credits` | `src/views/CreditsView.vue` | Open-source and font credits |
| `/legal` | `src/views/LegalView.vue` | Mentions légales, in French |
| `/privacy` | `src/views/PrivacyView.vue` | Politique de confidentialité, in French |

## Layers

- `src/views/`: route screens. They compose features and own page state.
- `src/components/generator/`: content forms, options, preview, export.
- `src/components/learn/`: controls, stage, timeline, phase panel, stats.
- `src/components/qr/`: `QrCanvas`, the shared matrix renderer.
- `src/components/theme/`: thin Vue wrappers for the theme library, no styles.
- `src/components/layout/`: header, footer and PWA prompt.
- `src/theme/`: design tokens, base HTML styles and `it-*` variants.
- `src/composables/`: WASM loaders and shared UI state.
- `src/lib/qrcode/`: payload builders, validation, matrix rendering, export.
- `src/types/`: domain types.
- `src/router/`: routes and guards.

Dependencies point downward: views → components/composables → lib/types. A
lower layer must not import a view or a component. `src/theme` must not import
Vue.

## Rules

- `App.vue` is the shell: router outlet, layout, theme. No QR business logic.
- Components do not call the WASM API directly. They use the adapters in
  `src/lib/qrcode/` and the composables in `src/composables/`.
- The generator and the learn view share `QrCanvas` and the export utilities;
  they must not duplicate matrix drawing.
- State is local unless it is genuinely cross-route. There is no store in this
  project; shared state is a composable.
- Every route is lazy-loaded in `src/router/index.ts`.
- A new feature gets its own folder under `src/components/<feature>/`, not a
  new top-level layer.

## Definition of done

- The route renders on mobile and desktop.
- Loading, empty, error and capacity-error states are explicit.
- The behaviour is covered by a test at the level where it lives.
