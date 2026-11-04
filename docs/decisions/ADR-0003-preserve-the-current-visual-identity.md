# ADR-0003 : Preserve the current visual identity

- **Status** : `deprecated`
- **Date** : 2026-11-03

> Superseded by ADR-0005.

## Validation

| Field        | Value |
|--------------|-------|
| Validated    | yes |
| Validated by | FortyTwo_Dev |
| Validated on | 2026-11-03 |

## Context

The current site has an established visual identity: four accent themes
(blue, red, pink, yellow), a light/dark mode, square corners, a three-column
generator layout and theme controls in the header. The rebuild replaces the
application structure and the QR engine, but the user does not want a redesign.

## Decision

- Keep the four accent themes and the light/dark modes.
- Keep the semantic token system (`background`, `foreground`, `primary`,
  `secondary`, `accent`, `destructive` and their `-foreground` pairs).
- Keep the theme class on `<html>` (`light-blue`, `dark-red`, ...).
- Keep the square radius (`--radius: 0rem`).
- Keep the generator's three-column proportions, the header theme controls and
  the footer version.
- Persist the accent and the mode in `localStorage`. Do not reintroduce the
  cookie-per-domain hack.
- Rebuild the components; do not copy the old unformatted code.

## Consequences

- **Positive**: visual continuity; the rebuild is about capability and
  correctness, not a redesign; theme tokens stay central.
- **Negative**: the new learn view must fit the same visual language while
  adding a timeline, a canvas stage and explanation panels.
- **Trade-offs**: preserving the layout constrains the mobile arrangement; the
  learn view shows the stage first on small screens and moves the controls
  below.

## Rejected alternatives

- **New visual identity**: rejected; not requested and would obscure the
  functional change.
- **Single accent colour**: rejected; it would remove an existing user choice.
- **Copy the old components as-is**: rejected; they are unformatted, mix DOM
  manipulation with Vue state and do not meet the new rules.
