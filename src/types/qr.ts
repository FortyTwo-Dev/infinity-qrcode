/**
 * @file qr.ts
 * Domain types for QR generation and payload forms.
 */

/** Supported payload kinds. */
export type QrcodeType =
  'text' | 'url' | 'wi-fi' | 'email' | 'vcard' | 'sms' | 'phone' | 'geo' | 'event' | 'whatsapp'

/** Error correction levels supported by the QR specification. */
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

/** Export formats offered by the generator. */
export type FormatType = 'svg' | 'png' | 'webp' | 'jpeg'

/** Wi-Fi encryption modes accepted by the WIFI payload. */
export type WifiEncryption = 'WPA' | 'WPA3' | 'WEP' | 'nopass'

/** A rendered QR matrix and its metadata. */
export interface QrMatrixData {
  matrix: Uint8Array
  size: number
  version: number
  mask: number
}

/** Generator options shared by the preview and the export. */
export interface QrOptions {
  level: ErrorCorrectionLevel
  format: FormatType
  moduleSize: number
  quietZone: number
  dark: string
  light: string
}

/** The result of building a payload: a value or field errors. */
export interface PayloadResult {
  value: string
  errors: Record<string, string>
}

/** vCard fields collected by the form. */
export interface VCardFields {
  firstName: string
  lastName: string
  organization: string
  title: string
  phone: string
  email: string
  website: string
  address: string
}

/** Raw form state. All values are strings so they can bind directly to inputs. */
export interface FormState {
  text: string
  urlScheme: 'https://' | 'http://'
  url: string
  wifiSsid: string
  wifiEncryption: WifiEncryption
  wifiPassword: string
  email: string
  emailSubject: string
  emailBody: string
  vcard: VCardFields
  smsNumber: string
  smsMessage: string
  phone: string
  latitude: string
  longitude: string
  eventTitle: string
  eventLocation: string
  eventStart: string
  eventEnd: string
  eventDescription: string
  whatsappNumber: string
  whatsappMessage: string
}

/** Content picker entries, in display order. */
export const CONTENT_TYPES: ReadonlyArray<{ value: QrcodeType; label: string }> = [
  { value: 'text', label: 'Text' },
  { value: 'url', label: 'URL' },
  { value: 'wi-fi', label: 'Wi-Fi' },
  { value: 'email', label: 'Email' },
  { value: 'vcard', label: 'vCard' },
  { value: 'sms', label: 'SMS' },
  { value: 'phone', label: 'Phone' },
  { value: 'geo', label: 'Location' },
  { value: 'event', label: 'Event' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

/** Empty form state used when a type is selected for the first time. */
export function createDefaultFormState(): FormState {
  return {
    text: '',
    urlScheme: 'https://',
    url: '',
    wifiSsid: '',
    wifiEncryption: 'WPA',
    wifiPassword: '',
    email: '',
    emailSubject: '',
    emailBody: '',
    vcard: {
      firstName: '',
      lastName: '',
      organization: '',
      title: '',
      phone: '',
      email: '',
      website: '',
      address: '',
    },
    smsNumber: '',
    smsMessage: '',
    phone: '',
    latitude: '',
    longitude: '',
    eventTitle: '',
    eventLocation: '',
    eventStart: '',
    eventEnd: '',
    eventDescription: '',
    whatsappNumber: '',
    whatsappMessage: '',
  }
}
