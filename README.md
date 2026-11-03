# Infinity QRCode

A client-side QR code generator and a step-by-step construction viewer, built on
two WebAssembly packages from the same Rust core.

- `/` generates a QR code for ten payload types and exports it as SVG, PNG,
  WebP or JPEG.
- `/learn` replays the construction frame by frame: finder patterns, timing,
  data placement, mask selection and format information.

Everything runs in the browser. No payload is sent to a server.

## Features

- Ten payload types: text, URL, Wi-Fi, email, vCard, SMS, phone, geolocation,
  event and WhatsApp.
- Live preview with error correction level, module size, quiet zone and custom
  colours.
- Export as SVG, PNG, WebP or JPEG.
- Pedagogical trace with timeline, phase explanations, mask penalties and
  trace metadata.
- Four accent themes (blue, red, pink, yellow) and light/dark mode.
- Installable PWA with the WASM assets precached for offline use.

## Stack

- Vue 3.5 with the Composition API and `<script setup lang="ts">`.
- TypeScript 6, pinned because `vue-tsc` 3.3 does not support TypeScript 7.
- Vite 8, Vue Router 5 and Tailwind CSS 4.
- Bun 1.4 as package manager and test runner.
- `iqrcode-wasm` for generation and `iqrcode-learn-wasm` for the trace.
- ESLint 10 with `eslint-plugin-vue`, `typescript-eslint` and
  `eslint-plugin-vuejs-accessibility`.

## Getting started

```sh
bun install
bun run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

Production build:

```sh
bun run build
bun run preview
```

## Scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the Vite dev server |
| `bun run build` | Type-check and build for production |
| `bun run preview` | Preview the production build |
| `bun run lint` | Run ESLint with zero warnings allowed |
| `bun run lint:fix` | Apply ESLint fixes |
| `bun run type-check` | Run `vue-tsc --noEmit` |
| `bun test` | Run the Bun test suite |
| `bun run check` | Lint, type-check and test |
| `bun run format` | Format with Prettier |
| `bun run governance:sync` | Refresh the ibrain materialized rules |
| `bun run governance:check` | Check that the generated rules are current |

## Architecture

```
src/
├── views/                 # GeneratorView, LearnView
├── components/
│   ├── generator/         # content picker, payload form, options, preview
│   ├── learn/             # controls, stage, timeline, phase panel, stats
│   ├── qr/                # shared matrix renderer
│   ├── layout/            # header and footer
│   └── ui/                # primitives
├── composables/           # WASM loaders and theme state
├── lib/
│   ├── qrcode/            # payload builders, rendering, export
│   └── learn/             # phase descriptions
├── router/
├── types/
└── css/
```

The generator and the learn view share the payload builders, `QrCanvas`, the
export utilities and the theme. The WASM modules are loaded lazily on the route
that needs them.

## Testing

```sh
bun test
```

The suite covers:

- every payload builder, including invalid and boundary input;
- the mandatory invariant that the final learn matrix equals the generator
  matrix for L, M, Q and H;
- the structural phases of a trace;
- SVG rendering.

A QR that renders is not necessarily a QR that scans. Scan one code per payload
type with a phone before a release.

## Governance

The repository uses [ibrain](https://github.com/FortyTwo-Dev/infinity-brain) for
AI governance knowledge. The Vue standards live in the `vue` pack; the project
rules live in `ibrain/`. The generated `.ai/` and `.agents/` trees are ignored
and recreated by `ibrain sync`.

## Notes

- TypeScript is pinned to 6.0.3 until `vue-tsc` supports TypeScript 7.
- `bun audit` reports three upstream, build-time advisories in the
  `workbox-build` chain. There is no high or critical advisory in shipped code.
- `bun.lock` is the only lockfile; do not add an npm, yarn or pnpm lockfile.

## License

MIT. See [LICENSE](LICENSE).
