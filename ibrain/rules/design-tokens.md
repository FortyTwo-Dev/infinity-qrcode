---
paths:
  - 'src/theme/**'
  - 'src/components/theme/**'
  - 'src/css/**'
  - 'src/**/*.vue'
---

# Design tokens

The application uses the in-repo Infinity Theme library. The visual identity is
still the same: four accents, light/dark modes, square corners and the existing
layout proportions.

## Themes

- The theme is scoped by `.it-theme` on `<html>`.
- The mode is `data-theme="light|dark"` on `<html>`.
- The accent is `data-accent="blue|red|pink|yellow"` on `<html>`.
- Persist the accent and the mode in `localStorage`.
- Do not reintroduce the old `light-blue` / `dark-red` classes or the
  cookie-per-domain hack.

## Tokens

- Library tokens use `--it-*`: `--it-bg`, `--it-fg`, `--it-surface`,
  `--it-border`, `--it-accent`, `--it-accent-fg`, `--it-danger`.
- Component tokens use `--it-button-*` and `--it-input-*`.
- Tailwind is for layout only. Its semantic colours are mapped to `--it-*` in
  `src/css/style.css`:
  - `background` → `--it-bg`
  - `foreground` → `--it-fg`
  - `primary` → `--it-accent`
  - `secondary` → `--it-surface`
  - `border` → `--it-border`
  - `destructive` → `--it-danger`
  - `success` → `--it-success`
  - `warning` → `--it-warning`
  - `info` → `--it-info`
- Use `border-border`, not `border-secondary`, for borders.
- Do not hard-code a colour that a token already names. A hexadecimal value in a
  component is only acceptable as data (for example a QR colour preview).
- Radius is a token (`--it-radius`), currently `0px`. Do not introduce rounded
  corners in one component.

## Components

- Base HTML elements are styled by the library inside `.it-theme`.
- Use `it-*` classes only for variants and sizes:
  `it-btn-primary`, `it-btn-sm`, `it-input-lg`, `it-h5`, `it-p`, `it-img`.
- Header navigation uses `.it-nav-link`; the current page is marked by
  `aria-current="page"` and gets the accent underline. Do not style the active
  route as a primary button.
- Mutually exclusive choices use `.it-choice-group` (with `-2` or `-4`) and a
  `.it-choice` label wrapping a native radio. Do not rebuild it with buttons.
- Selects stay native. Style the closed control with `appearance: none` and an
  inset chevron. Where `appearance: base-select` is supported, style
  `::picker(select)` with the theme tokens; other browsers keep the native
  picker. Do not add a select library.
- Do not add a second component style in a Vue file. The CSS library is the
  source of truth.
- The Vue wrappers live in `src/components/theme/` and contain no `<style>`.

## Cascade

Layer order is declared once, at the top of `src/css/style.css`, before the
imports:

```
theme, base, it.tokens, it.base, it.variants, components, utilities, it.overrides
```

- Tailwind preflight (`base`) runs before the theme tokens and base styles.
- Tailwind utilities run after `it.base` and `it.variants`, so a layout
  utility such as `w-20` or `sr-only` wins over a library default.
- `it.overrides` stays last for a deliberate, documented exception.
- Do not import the theme stylesheet before `src/css/style.css`: the first
  `@layer` statement fixes the whole order, and the theme would end up below
  Tailwind's reset.

## Verification

- `/styleguide` is the living documentation. Update it when a token, a base
  element or a variant changes.
- Check light and dark modes, all four accents and the focus/disabled states.

## Layout

- Generator, desktop: three columns. Content type on the left (it fills the
  column), preview then content fields in the middle, options on the right.
- Generator, mobile: content type, content fields, preview, options. The fields
  come before the preview so the form is reachable without scrolling past an
  empty preview.
- The preview is capped: the on-screen QR fits the preview box and never
  resizes the page. `moduleSize` only controls the exported file, not the
  preview.
- Learn: controls, stage and explanation. Mobile shows the stage first and the
  controls below.
- Keep the header/footer identity: theme controls in the header, version in the
  footer.

## Accessibility

- Both modes meet contrast requirements.
- Focus is visible.
- Motion respects `prefers-reduced-motion`.
