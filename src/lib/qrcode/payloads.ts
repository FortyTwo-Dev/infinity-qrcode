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
  return value ? ok(state.text) : fail({ text: 'Enter some text.' })
}

function buildUrl(state: FormState): PayloadResult {
  const raw = state.url.trim()
  if (!raw) return fail({ url: 'Enter a URL.' })

  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `${state.urlScheme}${raw}`

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return fail({ url: 'Only http and https URLs are supported.' })
    }
    if (!url.hostname) return fail({ url: 'Enter a valid host.' })
    return ok(url.toString())
  } catch {
    return fail({ url: 'Enter a valid URL.' })
  }
}

function buildWifi(state: FormState): PayloadResult {
  const ssid = state.wifiSsid.trim()
  if (!ssid) return fail({ wifiSsid: 'Enter the network name.' })

  if (state.wifiEncryption !== 'nopass' && !state.wifiPassword) {
    return fail({ wifiPassword: 'Enter the network password.' })
  }

  const password = state.wifiEncryption === 'nopass' ? '' : state.wifiPassword
  return ok(`WIFI:S:${escapeWifi(ssid)};T:${state.wifiEncryption};P:${escapeWifi(password)};;`)
}

function buildEmail(state: FormState): PayloadResult {
  const email = state.email.trim()
  if (!isValidEmail(email)) return fail({ email: 'Enter a valid email address.' })

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

  if (!displayName) return fail({ vcardName: 'Enter a name or an organization.' })
  if (email.trim() && !isValidEmail(email.trim())) {
    return fail({ vcardEmail: 'Enter a valid email address.' })
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
  if (!number || number === '+') return fail({ smsNumber: 'Enter a phone number.' })
  if (!state.smsMessage.trim()) return fail({ smsMessage: 'Enter a message.' })
  return ok(`SMSTO:${number}:${state.smsMessage.trim()}`)
}

function buildPhone(state: FormState): PayloadResult {
  const number = normalizePhone(state.phone)
  if (!number || number === '+') return fail({ phone: 'Enter a phone number.' })
  return ok(`tel:${number}`)
}

function buildGeo(state: FormState): PayloadResult {
  const latitude = Number(state.latitude)
  const longitude = Number(state.longitude)
  const errors: Record<string, string> = {}

  if (!state.latitude.trim() || Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
    errors.latitude = 'Latitude must be between -90 and 90.'
  }
  if (!state.longitude.trim() || Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
    errors.longitude = 'Longitude must be between -180 and 180.'
  }
  if (Object.keys(errors).length) return fail(errors)

  return ok(`geo:${latitude},${longitude}`)
}

function buildEvent(state: FormState): PayloadResult {
  const title = state.eventTitle.trim()
  if (!title) return fail({ eventTitle: 'Enter an event title.' })

  const start = toEventDate(state.eventStart)
  if (!start) return fail({ eventStart: 'Enter a valid start date.' })

  const end = state.eventEnd.trim() ? toEventDate(state.eventEnd) : null
  if (state.eventEnd.trim() && !end) return fail({ eventEnd: 'Enter a valid end date.' })
  if (end && new Date(state.eventStart) >= new Date(state.eventEnd)) {
    return fail({ eventEnd: 'The end must be after the start.' })
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
  if (!number) return fail({ whatsappNumber: 'Enter a phone number with country code.' })

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
