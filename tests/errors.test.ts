import { describe, expect, test } from 'bun:test'

import { classifyQrError } from '../src/lib/qrcode/errors'

// The classifier maps a thrown cause to a message catalog key. It always
// receives one of the two route fallbacks and returns catalog keys only,
// never display text.
const GENERATION_FALLBACK = 'generator.errors.generation' as const
const TRACE_FALLBACK = 'learn.errors.trace' as const
const CAPACITY_KEY = 'common.errors.capacity' as const

const FALLBACKS = [GENERATION_FALLBACK, TRACE_FALLBACK] as const

describe('classifyQrError', () => {
  test('maps a capacity Error message to the capacity key for both fallbacks', () => {
    for (const fallback of FALLBACKS) {
      expect(classifyQrError(new Error('data too long for level H'), fallback)).toBe(CAPACITY_KEY)
    }
  })

  test('maps a capacity thrown string to the capacity key for both fallbacks', () => {
    for (const fallback of FALLBACKS) {
      expect(
        classifyQrError('data too long: 2956 bits exceed the available capacity', fallback),
      ).toBe(CAPACITY_KEY)
    }
  })

  test('keeps the fallback when the capacity prefix is not at the start', () => {
    expect(classifyQrError(new Error('engine stopped: data too long'), GENERATION_FALLBACK)).toBe(
      GENERATION_FALLBACK,
    )
    expect(classifyQrError('marker after data too long text', TRACE_FALLBACK)).toBe(TRACE_FALLBACK)
  })

  test('returns the generator fallback for an unknown Error message', () => {
    expect(classifyQrError(new Error('low-level generator detail'), GENERATION_FALLBACK)).toBe(
      GENERATION_FALLBACK,
    )
    expect(classifyQrError(new Error(''), GENERATION_FALLBACK)).toBe(GENERATION_FALLBACK)
  })

  test('returns the learn fallback for a raw bit-count Error message', () => {
    expect(classifyQrError(new Error('trace build failed: 208 data modules'), TRACE_FALLBACK)).toBe(
      TRACE_FALLBACK,
    )
  })

  test('returns the fallback for thrown strings without the capacity prefix', () => {
    expect(classifyQrError('engine offline', GENERATION_FALLBACK)).toBe(GENERATION_FALLBACK)
    expect(classifyQrError('learn engine offline', TRACE_FALLBACK)).toBe(TRACE_FALLBACK)
    expect(classifyQrError('', TRACE_FALLBACK)).toBe(TRACE_FALLBACK)
  })

  test('returns the fallback for representative non-Error values without throwing', () => {
    const causes: unknown[] = [null, undefined, 0, 42, { code: 'WASM_ERR' }]
    for (const fallback of FALLBACKS) {
      for (const cause of causes) {
        expect(classifyQrError(cause, fallback)).toBe(fallback)
      }
    }
  })
})
