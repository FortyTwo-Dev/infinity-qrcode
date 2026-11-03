import { describe, expect, test } from 'vitest'

import { LEGAL_MISSING, legalValue } from './legal'

describe('legalValue', () => {
  test('returns the value when it is filled', () => {
    expect(legalValue('ACME SAS')).toBe('ACME SAS')
  })

  test('returns LEGAL_MISSING for an empty string', () => {
    expect(legalValue('')).toBe(LEGAL_MISSING)
  })

  test('returns LEGAL_MISSING for a whitespace-only string', () => {
    expect(legalValue('   ')).toBe(LEGAL_MISSING)
  })
})
