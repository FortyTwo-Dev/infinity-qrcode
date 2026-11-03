import { describe, expect, test } from 'bun:test'

import { buildPayload, escapeVCard, normalizePhone, toEventDate } from '../src/lib/qrcode/payloads'
import { createDefaultFormState, type FormState } from '../src/types/qr'

function state(patch: (value: FormState) => void): FormState {
  const value = createDefaultFormState()
  patch(value)
  return value
}

describe('payload builders', () => {
  test('text requires content', () => {
    const empty = buildPayload('text', createDefaultFormState())
    expect(empty.value).toBe('')
    expect(empty.errors.text).toBeDefined()

    const filled = buildPayload(
      'text',
      state((value) => (value.text = 'Hello')),
    )
    expect(filled).toEqual({ value: 'Hello', errors: {} })
  })

  test('url normalizes the scheme and rejects unsafe schemes', () => {
    const valid = buildPayload(
      'url',
      state((value) => {
        value.url = 'example.com'
        value.urlScheme = 'https://'
      }),
    )
    expect(valid.value).toBe('https://example.com/')

    const invalid = buildPayload(
      'url',
      state((value) => {
        value.url = 'javascript://alert(1)'
      }),
    )
    expect(invalid.value).toBe('')
    expect(invalid.errors.url).toBeDefined()
  })

  test('wi-fi escapes separators and requires a password unless open', () => {
    const secured = buildPayload(
      'wi-fi',
      state((value) => {
        value.wifiSsid = 'My;Network'
        value.wifiEncryption = 'WPA'
        value.wifiPassword = 'p:a;ss'
      }),
    )
    expect(secured.value).toBe('WIFI:S:My\\;Network;T:WPA;P:p\\:a\\;ss;;')

    const open = buildPayload(
      'wi-fi',
      state((value) => {
        value.wifiSsid = 'Open'
        value.wifiEncryption = 'nopass'
      }),
    )
    expect(open.value).toBe('WIFI:S:Open;T:nopass;P:;;')
  })

  test('email builds a mailto with optional subject and body', () => {
    const result = buildPayload(
      'email',
      state((value) => {
        value.email = 'contact@example.com'
        value.emailSubject = 'Hello world'
        value.emailBody = 'Line one'
      }),
    )

    expect(result.value).toBe('mailto:contact@example.com?subject=Hello+world&body=Line+one')
  })

  test('vcard requires a name and escapes values', () => {
    const missing = buildPayload('vcard', createDefaultFormState())
    expect(missing.errors.vcardName).toBeDefined()

    const result = buildPayload(
      'vcard',
      state((value) => {
        value.vcard.firstName = 'Ada'
        value.vcard.lastName = 'Lovelace'
        value.vcard.organization = 'Analytical;Engines'
      }),
    )

    expect(result.value).toContain('BEGIN:VCARD')
    expect(result.value).toContain('FN:Ada Lovelace')
    expect(result.value).toContain('ORG:Analytical\\;Engines')
    expect(result.value).toContain('END:VCARD')
  })

  test('sms and phone normalize numbers', () => {
    const sms = buildPayload(
      'sms',
      state((value) => {
        value.smsNumber = '+33 6 12 34 56 78'
        value.smsMessage = 'Hello'
      }),
    )
    expect(sms.value).toBe('SMSTO:+33612345678:Hello')

    const phone = buildPayload(
      'phone',
      state((value) => (value.phone = '+33 6 12 34 56 78')),
    )
    expect(phone.value).toBe('tel:+33612345678')
  })

  test('geo validates bounds', () => {
    const valid = buildPayload(
      'geo',
      state((value) => {
        value.latitude = '48.8566'
        value.longitude = '2.3522'
      }),
    )
    expect(valid.value).toBe('geo:48.8566,2.3522')

    const invalid = buildPayload(
      'geo',
      state((value) => {
        value.latitude = '91'
        value.longitude = '2'
      }),
    )
    expect(invalid.errors.latitude).toBeDefined()
  })

  test('event validates dates and requires a title', () => {
    const missingTitle = buildPayload('event', createDefaultFormState())
    expect(missingTitle.errors.eventTitle).toBeDefined()

    const result = buildPayload(
      'event',
      state((value) => {
        value.eventTitle = 'Launch'
        value.eventStart = '2026-11-03T18:00'
        value.eventEnd = '2026-11-03T19:00'
        value.eventLocation = 'Paris'
      }),
    )
    expect(result.value).toContain('BEGIN:VEVENT')
    expect(result.value).toContain('SUMMARY:Launch')
    expect(result.value).toContain('DTSTART:')
    expect(result.value).toContain('LOCATION:Paris')
    expect(result.value).toContain('END:VEVENT')

    const reversed = buildPayload(
      'event',
      state((value) => {
        value.eventTitle = 'Launch'
        value.eventStart = '2026-11-03T19:00'
        value.eventEnd = '2026-11-03T18:00'
      }),
    )
    expect(reversed.errors.eventEnd).toBeDefined()
  })

  test('whatsapp builds a wa.me link', () => {
    const result = buildPayload(
      'whatsapp',
      state((value) => {
        value.whatsappNumber = '+33 6 12 34 56 78'
        value.whatsappMessage = 'Hello world'
      }),
    )
    expect(result.value).toBe('https://wa.me/33612345678?text=Hello%20world')
  })
})

describe('helpers', () => {
  test('normalizePhone keeps a leading plus and strips separators', () => {
    expect(normalizePhone('+33 6 12 34 56 78')).toBe('+33612345678')
    expect(normalizePhone('06.12.34.56.78')).toBe('0612345678')
  })

  test('escapeVCard escapes backslashes, newlines, semicolons and commas', () => {
    expect(escapeVCard('a\\b\nc;d,e')).toBe('a\\\\b\\nc\\;d\\,e')
  })

  test('toEventDate converts to the iCalendar UTC form', () => {
    expect(toEventDate('2026-11-03T18:00')).toMatch(/^20261103T\d{6}Z$/)
    expect(toEventDate('')).toBeNull()
    expect(toEventDate('not a date')).toBeNull()
  })
})
