# ADR-0008 : Remove tailwindcss in favour of application classes

- **Status** : `accepted`
- **Date** : 2026-11-07

## Validation

| Field        | Value |
|--------------|-------|
| Validated    | yes |
| Validated by | FortyTwo_Dev |
| Validated on | 2026-11-07 |

## Context

ADR-0002 adopted Vite 8 with Tailwind CSS 4, and the theme rules reserved
Tailwind for layout only. Since then, ADR-0007 extracted the theme into
`@infinitylib/infinity-theme`, which now ships structural tokens
(`--it-space-*`, `--it-gutter`, `--it-container-*`, `--it-section-gap`,
`--it-stack-gap`) precisely so that application pages can carry their
arrangement in plain CSS.

The audit of the application showed three facts. Most remaining Tailwind
usage was semantic duplication of the `it-*` classes (`text-sm`, `opacity-70`,
`font-semibold`), which week-by-week is a debt against the theme
contract. The genuinely structural part (flex, grids, gaps, orders) mapped
one-to-one to `src/css/layout/` classes written once and reused by the
two routes. And the `@theme` bridge held no design data at all: every value
was an indirection to an `--it-*` token.

## Decision

- Remove Tailwind CSS from the build: no plugin in `vite.config.ts`, no
  `tailwindcss` or `@tailwindcss/vite` dependency, no semantic colour bridge
  in `src/css/style.css`. That file keeps a single duty: declaring the
  cascade order for the whole application,
  `it.tokens, it.base, it.variants, components, it.overrides`.
- The arrangement of a page lives in `src/css/layout/` as named
  application classes built on the theme package tokens. Values with no
  token equivalent stay literal, commented as exact carry-overs from the
  Tailwind norms, and are promoted to tokens if they survive the next
  design pass.
- The brand layer (accent, fonts, accent behaviours) lives in
  `src/css/brand.css` per ADR-0007.
- The migration was done in tiers, each visually validated and committed:
  the semantic swaps, the shell, the generator route, the learn route and
  the secondary pages, then the removal.

## Consequences

- **Positive**: one styling system; the bundle stops carrying a reset and a
  utility engine; every layout rule is a deliberate, named, reviewable
  choice in the application; components no longer need a build step to
  change their layout.
- **Negative**: writing a new arrangement means writing CSS instead of
  composing utilities; the layout vocabulary is the application's own and
  must be kept coherent by review.
- **Trade-offs**: the startup cost of new pages is absorbed by the existing
  classes (`app-container`, `stack`, `row`, `panel` vocabulary) at the
  price of reading that vocabulary before inventing new classes.

## Rejected alternatives

- **Keep Tailwind for layout only**: rejected; two styling systems in one
  application, semantic drift between utilities and `it-*` classes, and a
  reset the theme library already provides.
- **Move the layout classes into the theme package**: rejected; page
  arrangement belongs to the application, per the package's own charter
  (its ADR-0001): the library sells values, not arrangements.
