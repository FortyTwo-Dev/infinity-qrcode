---
paths:
  - 'src/css/**'
  - 'src/components/ui/**'
  - 'src/**/*.vue'
---

# Design tokens

The visual identity of the current site is preserved. The rebuild changes the
implementation, not the look.

## Themes

- Four accent themes: `blue`, `red`, `pink`, `yellow`.
- Two modes: `light` and `dark`, following `prefers-color-scheme` on first visit
  and an explicit user choice afterwards.
- The active combination is a class on `<html>`: `light-blue`, `dark-red`, etc.
  Keep the class list and the token files in sync.
- Persist the accent and the mode in `localStorage`. Do not reintroduce the
  cookie-per-domain hack.

## Tokens

- Use semantic utilities: `bg-background`, `text-foreground`, `bg-primary`,
  `text-primary-foreground`, `border-secondary`, `text-destructive`.
- Do not hard-code a colour that a token already names. A hexadecimal value in
  a component is only acceptable as data (for example a QR colour preview).
- Radius is a token (`--radius`), currently `0rem`. Do not introduce rounded
  corners in one component.
- Typography follows the existing scale. Do not add a font dependency without a
  design decision.

## Layout

- Generator: content picker, preview and options. Mobile stacks them; desktop
  keeps the current three-column proportions.
- Learn: controls, stage and explanation. Mobile shows the stage first and the
  controls below.
- Keep the header/footer identity: theme controls in the header, version in the
  footer.

## Accessibility

- Both modes meet contrast requirements.
- Focus is visible.
- Motion respects `prefers-reduced-motion`.
