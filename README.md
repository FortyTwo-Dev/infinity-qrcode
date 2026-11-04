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
- The logo yellow (`#ffdf00`) as the single accent, and light/dark mode.
- Interface in English and French, switchable from the header; the legal
  notices stay in French.
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
| `bun test` | Run the domain test suite |
| `bun run test:unit` | Run the component tests with Vitest |
| `bun run test:e2e` | Run the Playwright suite against the built app |
| `bun run check` | Lint, type-check, domain and component tests |
| `bun run check:all` | `check` plus the end-to-end suite |
| `bun run format` | Format with Prettier |
| `bun run governance:sync` | Refresh the ibrain materialized rules |
| `bun run governance:check` | Check that the generated rules are current |

## Releases

The version follows the Conventional Commits. A push on `main` opens a release
pull request with the next version and the changelog. Merging it creates the tag
and the GitHub release, and the footer reads the version from `package.json`.

## Container

The image builds the app with Bun and serves the static files with an
unprivileged nginx on port 8080.

```sh
podman build --format docker -f container/Containerfile -t infinity-qrcode:local .
podman run --rm -p 8080:8080 infinity-qrcode:local
```

A release publishes `ghcr.io/fortytwo-dev/infinity-qrcode` with the version tag
(`vX.Y.Z`), `sha-<commit>` and `latest`. The `/healthz` endpoint answers for a
health probe.

Quadlet example:

```ini
[Container]
Image=ghcr.io/fortytwo-dev/infinity-qrcode:latest
ContainerName=infinity-qrcode
AutoUpdate=registry
PublishPort=8080:8080
NoNewPrivileges=true
DropCapability=ALL
ReadOnly=true
Tmpfs=/tmp:rw,mode=1777
HealthCmd=wget -qO- http://127.0.0.1:8080/healthz
HealthInterval=30s

[Service]
Restart=always

[Install]
WantedBy=default.target
```

`systemctl --user enable --now podman-auto-update.timer` follows the `latest`
tag. Pin a version tag instead when a deployment must be reproducible.

## Architecture

```
src/
├── views/                 # Generator, Learn, Credits, Legal, Privacy
├── components/
│   ├── generator/         # content picker, payload form, options, preview
│   ├── learn/             # controls, stage, timeline, phase panel, stats
│   ├── qr/                # shared matrix renderer
│   ├── theme/             # thin Vue wrappers, no styles
│   └── layout/            # header, footer and PWA prompt
├── theme/                 # tokens, base HTML and it-* variants
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

## Theme library

The UI uses the in-repo Infinity Theme library:

- `src/theme` owns design tokens, base HTML styles and `it-*` variants.
- `src/components/theme` contains thin Vue wrappers without styles.

Tailwind is used for layout only. Its semantic colours map to `--it-*` in
`src/css/style.css`. The theme is set with `data-theme` on `<html>`; the accent
is always `data-accent="yellow"`.

## Internationalization

The interface is localized with `vue-i18n`:

- `src/i18n` owns the locale engine (fallback English, browser detection,
  persistence under `localStorage.locale`); `src/locales` holds the catalogs.
- Keys are the shared contract: lib layers emit catalog keys and the UI
  translates them (ADR-0006).
- `/legal` and `/privacy` stay in French at every locale: they are the French
  legal reference.

## Fonts

- **Space Grotesk** (variable, SIL OFL 1.1) is the base typeface.
- **OpenDyslexic** (Bitstream Vera license) is available from the accessibility
  button in the header, which switches the whole interface.

Both families and their license files live in `src/assets/fonts`.

## Testing

```sh
bun test           # domain logic and WASM
bun run test:unit  # components with Vitest and happy-dom
bun run test:e2e   # Chromium against the built app
```

Three layers:

- **Domain**: every payload builder, invalid and boundary input, the mandatory
  invariant that the final learn matrix equals the generator matrix for L, M, Q
  and H, the structural phases of a trace, and SVG rendering.
- **Components**: forms, choice groups, preview states and the theme menu.
- **End to end**: generate, switch type, invalid then valid content, the download
  state, the theme menu, dark mode, and no horizontal overflow at 360, 768 and
  1440 px.

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
