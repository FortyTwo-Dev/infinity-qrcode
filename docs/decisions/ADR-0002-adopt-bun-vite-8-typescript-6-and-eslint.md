# ADR-0002 : Adopt Bun, Vite 8, TypeScript 6 and ESLint

- **Status** : `accepted`
- **Date** : 2026-11-03

## Validation

| Field        | Value |
|--------------|-------|
| Validated    | yes |
| Validated by | FortyTwo_Dev |
| Validated on | 2026-11-03 |

## Context

The project was pinned to Vue 3.5.18, Vite 7.0.6, Tailwind 4.1.12 and an npm
lockfile, with no type-check, lint or test gate. `npm audit` reported 23
vulnerabilities, including one critical and fifteen high, with `vite` and `vue`
affected directly. The user also wants Bun as the package manager and runner.

The latest Vue tooling has one hard constraint: `vue-tsc` 3.3.14 does not
support TypeScript 7.0.2 (`./lib/tsc` is no longer exported). TypeScript 6.0.3
works.

## Decision

- Use Bun 1.4.4 as package manager and script runner; commit `bun.lock` and
  remove `package-lock.json`.
- Update to Vue 3.5.44, Vue Router 5.4.0, Vite 8.3.5, `@vitejs/plugin-vue`
  6.0.10, Tailwind 4.3.4, `vite-plugin-pwa` 2.0.0, Prettier 3.9.10.
- Pin TypeScript 6.0.3 and `vue-tsc` 3.3.14; do not float to TypeScript 7 until
  the Vue tooling supports it.
- Add ESLint 10 with `eslint-plugin-vue`, `@vue/eslint-config-typescript`,
  `eslint-plugin-vuejs-accessibility` and `eslint-config-prettier`. Run with
  `--max-warnings=0`.
- Use `bun test` rather than Vitest. Vitest remains the reference for Vue
  component tests in the `vue` pack, but this project's tests are TypeScript
  modules executed by Bun.
- Add a CI workflow on `develop` and `main` running install, lint, type-check,
  test and build.

## Consequences

- **Positive**: no high or critical advisory in the new tree; reproducible
  installs; lint, type-check and tests are gates; Bun is the single toolchain.
- **Negative**: three residual moderate/low advisories remain in the
  build-time `workbox-build` chain (`deepmerge`, `glob`, `minimatch`); they are
  upstream-blocked and not shipped to the browser. TypeScript is pinned to 6.
- **Trade-offs**: Vue Router 5 is a transition release that merges file-based
  routing; the project keeps explicit routes and does not adopt file-based
  routing in this change.

## Rejected alternatives

- **Stay on npm and Vite 7**: rejected; it keeps the direct `vite` and `vue`
  advisories.
- **Use TypeScript 7**: rejected; `vue-tsc` fails.
- **Add Vitest**: rejected for this project; Bun already runs TypeScript tests
  and the WASM equality test does not need a browser.
- **Force `overrides` for the residual Workbox advisories**: rejected; the
  overrides would cross dependency ranges and risk the build.
