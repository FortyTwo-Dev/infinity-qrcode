# ADR-0007 : Extract the theme into the @infinitylib/infinity-theme package

- **Status** : `accepted`
- **Date** : 2026-11-07

## Validation

| Field        | Value |
|--------------|-------|
| Validated    | yes |
| Validated by | FortyTwo_Dev |
| Validated on | 2026-11-07 |

## Context

ADR-0004 kept the CSS theme library in this repository "for now" and planned
its extraction into a package once the API was stable. Three years of churn
later the surface is stable: tokens, base element styles and `it-*` variants
serve every route, and the wrapper contract (CSS source of truth, Vue
wrappers without styles) held.

Three new needs close the question. The theme must be reusable across the
Infinity applications, which requires a publishable artefact rather than a
shared folder. The owner created the `infinitylib` npm organization and
publishes other Infinity libraries there (`iqrcode-wasm` already ships on
public npm under MIT). Finally, a later goal of this application is to
replace Tailwind layout utilities with application classes built on theme
tokens, which the current token set does not fully cover.

## Decision

- Publish the library as `@infinitylib/infinity-theme` on public npm, under
  MIT, as its own repository under the InfinityLib organisation. The package
  ships its CSS source as
  is: no build, one entry point (`exports: "."`).
- The package scope is: colour and structural tokens, `@property`
  registrations, base element styles, `it-*` variants, and one shared
  accessibility utility, `it-sr-only`.
- The package imposes no typeface: it ships no font file and no `@font-face`
  rule. `--it-font-sans` defaults to a neutral system stack; this application
  keeps Space Grotesk, OpenDyslexic and the `data-font` override on its side,
  alongside its own font declarations.
- The token set gains structural tokens for layout values:
  `--it-gutter`, `--it-container-sm|md|lg`, `--it-stack-gap` and
  `--it-section-gap`. Applications compose layouts with their own classes on
  these tokens; the library ships no layout components.
- Space Grotesk and OpenDyslexic stay in this application, with their licence
  files: a theme package ships appearance rules, not brand assets.
- The Vue wrappers stay in this repository under `src/components/theme` for
  now. A sibling package `@infinitylib/infinity-theme-vue` is the planned
  next step, published as its own repository, because its build and
  test pipeline (SFC compilation, `d.ts`, Vitest) has nothing in common
  with the CSS package.
- This application becomes a consumer of the package: `src/theme` is
  replaced by the dependency, in an incremental migration route by route.
  Tailwind stays the layout tool during the migration; its removal is a
  separate future record with its own validation.

## Consequences

- **Positive**: the theme becomes consumable by any project with or without
  a framework; token renames become semver-visible instead of silent
  in-repo edits; the application eats its own dog food as the first real
  consumer outside its own tree.
- **Negative**: releases of the theme and application changes decouple;
  a styling fix now needs a package release before it reaches this app.
- **Trade-offs**: the in-repo iteration speed of ADR-0004 is traded for
  reuse. Structural tokens standardise layout values but do not remove the
  per-application layout CSS, which is the intended boundary.

## Rejected alternatives

- **Keep the library in this repository**: rejected because ADR-0004
  already designated the exit, and no other Infinity application could
  consume it.
- **One package with a `vue` subpath**: rejected because the two halves have
  asymmetric pipelines; a buildless CSS package should not carry the SFC
  compilation and test tooling. Two sibling repositories keep the concerns
  separate without the coupling. A single `InfinityLib/ibrain-packs`
  repository hosts the path-scoped rules of the organisation's libraries.
- **Layout components in the library**: rejected because page arrangements
  are application-specific; shipping them would compete with utility
  frameworks and freeze patterns that only one application validated.
- **Private registry or git dependency**: rejected because the artefact is
  public MIT content and the organization already publishes to public npm.
