---
paths:
  - 'src/lib/qrcode/**'
  - 'src/types/**'
  - 'src/views/**'
---

# QR code domain

## Payload types

The generator supports ten payloads. The builder is the source of truth; the
forms only collect fields.

| Type | Payload |
| --- | --- |
| `text` | The text as typed |
| `url` | `https://…` or `http://…` with a validated host |
| `wi-fi` | `WIFI:S:<ssid>;T:<WPA|WPA3|WEP|nopass>;P:<password>;;` |
| `email` | `mailto:<address>` |
| `vcard` | `BEGIN:VCARD` … `END:VCARD` with at least `FN` |
| `sms` | `SMSTO:<number>:<message>` |
| `phone` | `tel:<number>` |
| `geo` | `geo:<latitude>,<longitude>` |
| `event` | `BEGIN:VEVENT` … `END:VEVENT` with `SUMMARY`, `DTSTART` |
| `whatsapp` | `https://wa.me/<number>?text=<encoded message>` |

## Validation

- Validate before generation. An invalid form shows a field-level error and
  does not call the WASM API.
- URL: allow only `http:` and `https:`; reject `javascript:`, `data:` and
  unknown schemes.
- Email: require a non-empty local part and domain.
- Phone: normalize to digits and an optional leading `+`; do not invent a
  country code.
- Geo: latitude in `[-90, 90]`, longitude in `[-180, 180]`.
- Event: `DTSTART` is required; `DTEND` is optional but must be after
  `DTSTART`.
- Wi-Fi: `nopass` means no password; otherwise a password is required.
- vCard: `FN` is required; escape newlines and semicolons per vCard.

## Matrix invariants

- `matrix()` is row-major, `0` = light, `1` = dark.
- `size()` is the side length; the matrix contains `size * size` bytes.
- `version()` is the QR version, `mask()` the selected mask (0–7).
- The learn trace's final matrix must equal the generator matrix for the same
  payload and level. This is a tested invariant, not an assumption.

## Scannability

- Warn when the quiet zone is 0. Do not block the export: an external margin can
  provide it. A 1-module margin was tested as readable, but the specification
  recommends 4 when the layout can afford it.
- Warn when the contrast ratio between the two colours is below 4.5, and when
  the dark colour is lighter than the light one.
- These warnings never disable the download.
- Show the current export size in pixels next to the module size.

## Capacity

- The libraries throw when the data does not fit. Catch the error and show a
  readable message naming the cause.
- Do not silently truncate content or lower the correction level.
- Long vCard/event payloads are the common overflow case.

## Export

- SVG is built from the matrix, with the chosen dark/light colours and quiet
  zone.
- PNG, WebP and JPEG are rendered through a canvas at the requested module
  size.
- A download never mutates the preview state.
- JPEG has no transparency: always paint the light colour first.
