import { readFileSync } from 'node:fs'

import { beforeAll, describe, expect, test } from 'bun:test'
import initQr, { QrCodeWasm } from 'iqrcode-wasm'
import jsQR from 'jsqr'
import type { QRCode } from 'jsqr'

// These tests validate the matrix produced by the generator with jsQR, an
// independent decoder. Payload builders and export utilities are out of
// scope: all payloads below are literal strings handed straight to the WASM
// constructor. No network, no real timers, one QR object per case.

// Deterministic rendering harness: each matrix becomes a white RGBA bitmap
// with black modules, a 4-module quiet zone and a fixed 8-pixel integer
// scale, which jsQR decodes reliably.
const SCALE = 8
const QUIET_MODULES = 4

type CorrectionLevel = 'L' | 'M' | 'Q' | 'H'

interface DecodeCase {
  readonly name: string
  readonly level: CorrectionLevel
  readonly payload: string
}

// Ten payload shapes; L: three cases, M: three, Q: two, H: two, so every
// correction level is independently decoded at least once.
const CASES: DecodeCase[] = [
  { name: 'text', level: 'L', payload: 'Bonjour café ☕' },
  { name: 'url', level: 'M', payload: 'https://example.com/qr?a=1&b=2#anchor' },
  {
    name: 'wifi',
    level: 'Q',
    payload: 'WIFI:T:WPA;S:Coffee-Shop;P:pass1234;H:true;;',
  },
  { name: 'mailto email', level: 'H', payload: 'mailto:alice@example.org?subject=Hello%20there' },
  {
    name: 'vCard',
    level: 'L',
    payload:
      'BEGIN:VCARD\nVERSION:3.0\nFN:Ada Lovelace\nTEL:+441234567890\nEMAIL:ada@example.org\nEND:VCARD',
  },
  { name: 'sms', level: 'M', payload: 'SMSTO:+15551234567:Confirm order' },
  { name: 'tel phone', level: 'Q', payload: 'tel:+15551234567' },
  { name: 'geo', level: 'H', payload: 'geo:48.8566,2.3522' },
  {
    name: 'calendar event',
    level: 'L',
    payload:
      'BEGIN:VEVENT\nSUMMARY:Team sync\nDTSTART:20260310T090000Z\nDTEND:20260310T100000Z\nLOCATION:Paris\nEND:VEVENT',
  },
  { name: 'whatsapp url', level: 'M', payload: 'https://wa.me/15551234567?text=Hello%20there' },
]

function renderMatrixToRgba(
  matrix: Uint8Array,
  size: number,
): { dimension: number; rgba: Uint8ClampedArray } {
  const sideModules = size + 2 * QUIET_MODULES
  const dimension = sideModules * SCALE
  const rgba = new Uint8ClampedArray(dimension * dimension * 4)
  rgba.fill(255)

  expect(matrix.length).toBe(size * size)
  for (const value of matrix) {
    expect(value === 0 || value === 1).toBe(true)
  }
  expect(dimension).toBe(sideModules * SCALE)
  expect(rgba.length).toBe(dimension * dimension * 4)

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (matrix[row * size + col] !== 1) {
        continue
      }
      for (let pixelY = 0; pixelY < SCALE; pixelY += 1) {
        const y = (QUIET_MODULES + row) * SCALE + pixelY
        for (let pixelX = 0; pixelX < SCALE; pixelX += 1) {
          const x = (QUIET_MODULES + col) * SCALE + pixelX
          const offset = (y * dimension + x) * 4
          rgba[offset] = 0
          rgba[offset + 1] = 0
          rgba[offset + 2] = 0
          rgba[offset + 3] = 255
        }
      }
    }
  }

  return { dimension, rgba }
}

function expectDecodedData(decoded: QRCode | null): string {
  if (decoded === null) {
    throw new Error('jsQR could not decode the rendered matrix bitmap')
  }
  return decoded.data
}

beforeAll(async () => {
  await initQr({
    module_or_path: readFileSync('node_modules/iqrcode-wasm/iqrcode_wasm_bg.wasm'),
  })
})

describe('independent matrix decoding with jsQR', () => {
  for (const decodeCase of CASES) {
    test(`decodes and round-trips a ${decodeCase.name} payload (${decodeCase.level})`, () => {
      const qr = new QrCodeWasm(decodeCase.payload, decodeCase.level)
      try {
        const matrix = qr.matrix()
        const { dimension, rgba } = renderMatrixToRgba(matrix, qr.size())

        // 'dontInvert' pins normal polarity: an inverted-matrix regression
        // must surface as a decode failure instead of being forgiven.
        const decoded = jsQR(rgba, dimension, dimension, { inversionAttempts: 'dontInvert' })

        expect(expectDecodedData(decoded)).toBe(decodeCase.payload)
      } finally {
        qr.free()
      }
    })
  }

  test('returns null for an entirely light bitmap', () => {
    const sideModules = 21 + 2 * QUIET_MODULES
    const dimension = sideModules * SCALE
    const rgba = new Uint8ClampedArray(dimension * dimension * 4)
    rgba.fill(255)

    expect(rgba.length).toBe(dimension * dimension * 4)

    expect(jsQR(rgba, dimension, dimension, { inversionAttempts: 'dontInvert' })).toBeNull()
  })
})
