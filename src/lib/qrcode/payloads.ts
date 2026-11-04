import type { PayloadResult, FormState, QrcodeType } from '@/types/qr'

/** Validate an email address without a backtracking-prone regular expression. */
export function isValidEmail(value: string): boolean {
  const at = value.indexOf('@')
  if (at <= 0 || at !== value.lastIndexOf('@')) return false

  const local = value.slice(0, at)
  const domain = value.slice(at + 1)
  if (!local || !domain || value.includes(' ')) return false
  if (domain.startsWith('.') || domain.endsWith('.')) return false
  return domain.includes('.')
}

/** Normalize a phone number to digits with an optional leading `+`. */
export function normalizePhone(value: string): string {
  const trimmed = value.trim()
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D/g, '')
  return hasPlus ? `+${digits}` : digits
}

/** Escape a vCard text value. */
export function escapeVCard(value: string): string {
  return value
    .replaceAll('\\', String.raw`\\`)
    .replaceAll('\r\n', String.raw`\n`)
    .replaceAll('\n', String.raw`\n`)
    .replaceAll(';', String.raw`\;`)
    .replaceAll(',', String.raw`\,`)
}

/** Escape a Wi-Fi field value. */
export function escapeWifi(value: string): string {
  return value
    .replaceAll('\\', String.raw`\\`)
    .replaceAll(';', String.raw`\;`)
    .replaceAll(',', String.raw`\,`)
    .replaceAll(':', String.raw`\:`)
    .replaceAll('"', String.raw`\"`)
}

/** Convert a `datetime-local` value to the iCalendar UTC form. */
export function toEventDate(value: string): string | null {
  if (!value.trim()) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')
}

function fail(errors: Record<string, string>): PayloadResult {
  return { value: '', errors }
}

function ok(value: string): PayloadResult {
  return { value, errors: {} }
}

function buildText(state: FormState): PayloadResult {
  const value = state.text.trim()
  return value ? ok(state.text) : fail({ text: 'generator.errors.textRequired' })
}

function buildUrl(state: FormState): PayloadResult {
  const raw = state.url.trim()
  if (!raw) return fail({ url: 'generator.errors.urlRequired' })
  // Browsers percent-encode spaces in a host, so `https://not a url` would
  // otherwise be accepted. Reject whitespace before parsing.
  if (/\s/.test(raw)) return fail({ url: 'generator.errors.urlInvalid' })

  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `${state.urlScheme}${raw}`

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return fail({ url: 'generator.errors.urlSchemeUnsupported' })
    }
    if (!url.hostname) return fail({ url: 'generator.errors.urlHostRequired' })
    return ok(url.toString())
  } catch {
    return fail({ url: 'generator.errors.urlInvalid' })
  }
}

function buildWifi(state: FormState): PayloadResult {
  const ssid = state.wifiSsid.trim()
  if (!ssid) return fail({ wifiSsid: 'generator.errors.wifiSsidRequired' })

  if (state.wifiEncryption !== 'nopass' && !state.wifiPassword) {
    return fail({ wifiPassword: 'generator.errors.wifiPasswordRequired' })
  }

  const password = state.wifiEncryption === 'nopass' ? '' : state.wifiPassword
  return ok(`WIFI:S:${escapeWifi(ssid)};T:${state.wifiEncryption};P:${escapeWifi(password)};;`)
}

function buildEmail(state: FormState): PayloadResult {
  const email = state.email.trim()
  if (!isValidEmail(email)) return fail({ email: 'generator.errors.emailInvalid' })

  const params = new URLSearchParams()
  if (state.emailSubject.trim()) params.set('subject', state.emailSubject.trim())
  if (state.emailBody.trim()) params.set('body', state.emailBody)
  const query = params.toString()

  const suffix = query ? `?${query}` : ''
  return ok(`mailto:${email}${suffix}`)
}

function buildVCard(state: FormState): PayloadResult {
  const { firstName, lastName, organization, title, phone, email, website, address } = state.vcard

  const fullName = [firstName, lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ')
  const displayName = fullName || organization.trim()

  if (!displayName) return fail({ vcardName: 'generator.errors.vcardNameRequired' })
  if (email.trim() && !isValidEmail(email.trim())) {
    return fail({ vcardEmail: 'generator.errors.emailInvalid' })
  }

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeVCard(lastName.trim())};${escapeVCard(firstName.trim())};;;`,
    `FN:${escapeVCard(displayName)}`,
  ]

  if (organization.trim()) lines.push(`ORG:${escapeVCard(organization.trim())}`)
  if (title.trim()) lines.push(`TITLE:${escapeVCard(title.trim())}`)
  if (phone.trim()) lines.push(`TEL;TYPE=CELL:${escapeVCard(normalizePhone(phone))}`)
  if (email.trim()) lines.push(`EMAIL:${escapeVCard(email.trim())}`)
  if (website.trim()) lines.push(`URL:${escapeVCard(website.trim())}`)
  if (address.trim()) lines.push(`ADR;TYPE=HOME:;;${escapeVCard(address.trim())};;;;`)

  lines.push('END:VCARD')
  return ok(lines.join('\r\n'))
}

function buildSms(state: FormState): PayloadResult {
  const number = normalizePhone(state.smsNumber)
  if (!number || number === '+') return fail({ smsNumber: 'generator.errors.phoneRequired' })
  if (!state.smsMessage.trim()) return fail({ smsMessage: 'generator.errors.smsMessageRequired' })
  return ok(`SMSTO:${number}:${state.smsMessage.trim()}`)
}

function buildPhone(state: FormState): PayloadResult {
  const number = normalizePhone(state.phone)
  if (!number || number === '+') return fail({ phone: 'generator.errors.phoneRequired' })
  return ok(`tel:${number}`)
}

function buildGeo(state: FormState): PayloadResult {
  const latitude = Number(state.latitude)
  const longitude = Number(state.longitude)
  const errors: Record<string, string> = {}

  if (!state.latitude.trim() || Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
    errors.latitude = 'generator.errors.latitudeRange'
  }
  if (!state.longitude.trim() || Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
    errors.longitude = 'generator.errors.longitudeRange'
  }
  if (Object.keys(errors).length) return fail(errors)

  return ok(`geo:${latitude},${longitude}`)
}

function buildEvent(state: FormState): PayloadResult {
  const title = state.eventTitle.trim()
  if (!title) return fail({ eventTitle: 'generator.errors.eventTitleRequired' })

  const start = toEventDate(state.eventStart)
  if (!start) return fail({ eventStart: 'generator.errors.eventStartInvalid' })

  const end = state.eventEnd.trim() ? toEventDate(state.eventEnd) : null
  if (state.eventEnd.trim() && !end) return fail({ eventEnd: 'generator.errors.eventEndInvalid' })
  if (end && new Date(state.eventStart) >= new Date(state.eventEnd)) {
    return fail({ eventEnd: 'generator.errors.eventEndAfterStart' })
  }

  const lines = ['BEGIN:VEVENT', `SUMMARY:${escapeVCard(title)}`, `DTSTART:${start}`]
  if (end) lines.push(`DTEND:${end}`)
  if (state.eventLocation.trim()) lines.push(`LOCATION:${escapeVCard(state.eventLocation.trim())}`)
  if (state.eventDescription.trim()) {
    lines.push(`DESCRIPTION:${escapeVCard(state.eventDescription.trim())}`)
  }
  lines.push('END:VEVENT')
  return ok(lines.join('\r\n'))
}

function buildWhatsApp(state: FormState): PayloadResult {
  const number = normalizePhone(state.whatsappNumber).replace(/^\+/, '')
  if (!number) return fail({ whatsappNumber: 'generator.errors.whatsappNumberRequired' })

  const message = state.whatsappMessage.trim()
  const suffix = message ? `?text=${encodeURIComponent(message)}` : ''
  return ok(`https://wa.me/${number}${suffix}`)
}

/** Build the payload for the selected content type. */
export function buildPayload(type: QrcodeType, state: FormState): PayloadResult {
  switch (type) {
    case 'text':
      return buildText(state)
    case 'url':
      return buildUrl(state)
    case 'wi-fi':
      return buildWifi(state)
    case 'email':
      return buildEmail(state)
    case 'vcard':
      return buildVCard(state)
    case 'sms':
      return buildSms(state)
    case 'phone':
      return buildPhone(state)
    case 'geo':
      return buildGeo(state)
    case 'event':
      return buildEvent(state)
    case 'whatsapp':
      return buildWhatsApp(state)
  }
}
