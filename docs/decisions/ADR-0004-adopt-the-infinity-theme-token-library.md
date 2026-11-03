# ADR-0004 : Adopt the Infinity Theme token library

- **Status** : `accepted`
- **Date** : 2026-11-03

## Validation

| Field        | Value |
|--------------|-------|
| Validated    | yes |
| Validated by | FortyTwo_Dev |
| Validated on | 2026-11-03 |

## Context

The application needs a reusable visual foundation for its generator, learn view
and future screens. The previous implementation mixed Tailwind utilities, a
custom UI primitive folder and four theme stylesheets. It worked, but the
component rules were not reusable outside this app and the theme classes were
coupled to the old CSS variables.

A prototype of a personal CSS-first component library was validated on a
styleguide page. The prototype uses base HTML, design tokens, `it-*` variants
and a `.it-theme` scope. It supports light/dark modes and four accents.

## Decision

- Keep the library in this repository for now, under:
  - `src/theme/` for the CSS library;
  - `src/components/theme/` for the thin Vue wrappers.
- The CSS library is framework-agnostic and is the source of truth.
- The Vue wrappers contain no styles. They only map props to `it-*` classes.
- Use the `it-` prefix for classes and `--it-*` for custom properties.
- Use `@layer it.tokens, it.base, it.variants, it.overrides` for cascade order.
- Use `.it-theme` as the scope and `data-theme="light|dark"` plus
  `data-accent="blue|red|pink|yellow"` for themes.
- Register only the tokens that benefit from typing or interpolation with
  `@property`. Do not register every token.
- Use base HTML elements for typography and forms, and `it-*` classes only for
  variants, sizes and alternate styles.
- Keep Tailwind for layout only. Its semantic colour tokens map to `--it-*`.
- Add `/styleguide` as the living documentation and visual test page.
- Extract `src/theme` and `src/components/theme` into packages when the API is
  stable enough.

## Consequences

- **Positive**: one theme model for the whole app, less duplication, reusable
  components, a documented visual contract, and an easier path to a package.
- **Negative**: the app now depends on the library's token names and layer
  order; the styleguide must be kept current as components are added.
- **Trade-offs**: Tailwind remains for layout, so the project still carries two
  styling systems. The library owns components and tokens; Tailwind owns layout
  utilities only.

## Rejected alternatives

- **Keep the old UI primitives and theme files**: rejected because they are not
  reusable and duplicate the theme model.
- **Adopt a third-party design system**: rejected because the goal is a personal
  library with a small, controlled surface.
- **One theme file per colour and mode**: rejected because it multiplies the
  combinations. Mode and accent are independent.
- **Register all tokens with `@property`**: rejected because it adds noise and
  can hide invalid values behind the initial value.
