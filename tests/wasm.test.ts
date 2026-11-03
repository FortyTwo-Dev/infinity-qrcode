import { readFileSync } from 'node:fs'

import { beforeAll, describe, expect, test } from 'bun:test'
import initLearn, { LearnTrace } from 'iqrcode-learn-wasm'
import initQr, { QrCodeWasm } from 'iqrcode-wasm'

import type { ErrorCorrectionLevel } from '../src/types/qr'

const LEVELS: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H']

beforeAll(async () => {
  await initQr({
    module_or_path: readFileSync('node_modules/iqrcode-wasm/iqrcode_wasm_bg.wasm'),
  })
  await initLearn({
    module_or_path: readFileSync('node_modules/iqrcode-learn-wasm/iqrcode_learn_wasm_bg.wasm'),
  })
})

describe('WASM packages', () => {
  for (const level of LEVELS) {
    test(`learn final matrix equals generator matrix (${level})`, () => {
      const qr = new QrCodeWasm('HELLO WORLD', level)
      const trace = new LearnTrace('HELLO WORLD', level, undefined, 50, 100_000, true)

      try {
        const last = trace.frame(trace.frame_count() - 1)
        try {
          expect(last.matrix()).toEqual(qr.matrix())
        } finally {
          last.free()
        }

        expect(trace.version()).toBe(qr.version())
        expect(trace.size()).toBe(qr.size())
        expect(trace.mask()).toBe(qr.mask())
        expect(trace.segments().length).toBeGreaterThan(0)
      } finally {
        trace.free()
        qr.free()
      }
    })
  }

  test('trace includes the structural phases and the final frame', () => {
    const trace = new LearnTrace('HELLO WORLD', 'H', undefined, 50, 100_000, true)

    try {
      const phases = new Set<string>()
      for (let index = 0; index < trace.frame_count(); index += 1) {
        const frame = trace.frame(index)
        phases.add(frame.phase())
        frame.free()
      }

      expect(phases.has('finders')).toBe(true)
      expect(phases.has('data_placement')).toBe(true)
      expect(phases.has('mask_chosen')).toBe(true)
      expect(phases.has('final')).toBe(true)
    } finally {
      trace.free()
    }
  })

  test('a payload that does not fit throws', () => {
    expect(() => new QrCodeWasm('x'.repeat(5000), 'H')).toThrow()
  })
})
