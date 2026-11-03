import { describe, expect, test } from 'vitest'

import { LEGAL_MISSING, legalValue } from './legal'

describe('legalValue', () => {
  test('returns the value when it is present', () => {
    expect(legalValue('ACME SAS')).toBe('ACME SAS')
  })

  test('falls back to the placeholder when the value is empty or blank', () => {
    expect(legalValue('')).toBe(LEGAL_MISSING)
    expect(legalValue('   ')).toBe(LEGAL_MISSING)
  })
})
