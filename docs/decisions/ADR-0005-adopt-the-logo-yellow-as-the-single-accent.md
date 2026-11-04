# ADR-0005 : Adopt the logo yellow as the single accent

- **Status** : `accepted`
- **Date** : 2026-11-04

## Validation

| Field        | Value |
|--------------|-------|
| Validated    | yes |
| Validated by | FortyTwo_Dev |
| Validated on | 2026-11-04 |

## Context

The product received a new logo: a yellow square (`#ffdf00`) with black "IQ"
lettering. Until now the site shipped four accent themes (blue, red, pink,
yellow) selected from the header, as ADR-0003 decided.

The brand now has a colour of its own, and the accent picker adds UI for a
choice the product no longer needs. ADR-0003 rejected a single accent at the
time because it would remove an existing user choice; the owner now requests
that removal, which supersedes that record.

## Decision

- The accent is always the logo yellow: `--it-color-yellow-500` is `#ffdf00`.
- The bright yellow stays readable with black text on top, but fails as text
  on light backgrounds. In light mode the yellow is therefore decorative
  only: underlines, borders, focus and backgrounds (with black text). Text
  that used the accent in dark mode (active navigation, current values, link
  hovers) switches to the foreground colour in light mode, marked by a yellow
  underline. Dark mode keeps yellow text on dark backgrounds, like the logo.
- The site ships only the yellow accent. The `blue`, `red` and `pink` accent
  token files are removed. The `data-accent` attribute stays on `<html>`,
  set statically to `yellow`, so the theme library keeps its accent mechanism.
- The accent picker is removed from the header. Light/dark mode and its toggle
  remain. The mode stays persisted in `localStorage` under `theme`; the
  `themeColor` key is no longer read or written.
- The PWA manifest `theme_color` becomes `#ffdf00`.
- The rest of the ADR-0003 identity is carried forward unchanged: semantic
  token system, square radius (`--it-radius: 0px`), three-column generator
  layout, header controls for mode and dyslexia, and the footer version.

## Consequences

- **Positive**: the site matches the logo; one less UI control; a smaller
  token surface and a simpler theme composable; the brand yellow without any
  contrast workaround.
- **Negative**: users who chose another accent lose it; a stored `themeColor`
  key becomes inert data in existing browsers; light mode shows the yellow
  mostly through decoration, the yellow text look lives only in dark mode.
- **Trade-offs**: the theme library loses three of its four accents in this
  application while keeping the `data-accent` mechanism; reintroducing accents
  is a token-file addition, not a redesign.

## Rejected alternatives

- **Keep the picker and mark yellow as the default**: rejected; the choice is
  no longer wanted.
- **Drop the `data-accent` mechanism entirely**: rejected; it is part of the
  theme library contract and keeps future accents cheap (ADR-0004).
