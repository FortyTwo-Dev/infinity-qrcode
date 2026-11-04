# ADR-0006 : Add internationalization with vue-i18n

- **Status** : `accepted`
- **Date** : 2026-11-04

## Validation

| Field        | Value |
|--------------|-------|
| Validated    | yes |
| Validated by | FortyTwo_Dev |
| Validated on | 2026-11-04 |

## Context

The application is written in English while its audience includes French
users, and the owner wants more languages later. The interface must switch
languages without per-component conditionals, and translation-ready wording
must not leak into pure logic layers. The legal and privacy pages carry
French legal value (LCEN mentions légales, RGPD readability for the French
authority) and a `.fr` domain audience: they must not follow the interface
locale the same way.

Rejected along the way, then accepted: the language toggle lives in the
header and persists its choice, mirroring the existing mode toggles.

## Decision

- Use `vue-i18n` (Composition API, `legacy: false`) as the only translation
  engine. Adding a language is a catalog file plus one entry in `LOCALES`.
- Catalogs live in `src/locales/en.ts` and `src/locales/fr.ts`; keys are the
  stable contract shared by components and lib layers, so renaming a key is a
  coordinated change, not a local one.
- Locale resolution: `localStorage.locale` if valid, else the first browser
  language matching a shipped locale, else English. `<html lang>` follows the
  locale synchronously, and `theme-init.js` applies the stored or detected
  language before hydration so screen readers get the right language without a
  flash. The locale does not live in the URL.
- Pure logic layers (`src/lib/qrcode/payloads.ts`, `src/lib/learn/phases.ts`)
  emit stable catalog keys, never display text; the UI translates. Component
  tests pin the singleton to `en` and assert the translated output.
- The `/legal` and `/privacy` routes are exempt: their content stays in
  French at every locale, as the French legal reference. Their footer labels
  are translated like the rest of the chrome.
- vue-i18n special characters in message values are escaped inline
  (`{'@'}`, `{'|'}`); keys and rendered text stay unchanged.

## Consequences

- **Positive**: two full locales with one engine; new languages are cheap;
  screens and lib stay in sync through keys; no translation strings in
  components.
- **Negative**: a dependency (~9 kB gzipped); every new user-visible string
  needs keys in every locale, in one commit; specs depend on the shared
  i18n instance so their mount helpers carry the plugin.
- **Trade-offs**: the stored `locale` key adds a privacy-page entry and the
  toggle adds a header control; the URL stays locale-agnostic, so a shared
  link renders per-visitor languages.

## Rejected alternatives

- **A hand-rolled `t()` map**: rejected; it would reimplement pluralization,
  interpolation and message compilation for no weight saving.
- **Locale in the URL** (`/fr/learn`): rejected for now; better for SEO and
  sharing but heavier on routing, and a build-time static client app has no
  per-locale server rendering to gain from today.
- **Translate the legal pages too**: rejected; they are French legal
  documents; an optional courtesy translation with a "French prevails" note
  remains possible later without touching this design.
