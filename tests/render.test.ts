import { describe, expect, test } from 'bun:test'

import { toSvg } from '../src/lib/qrcode/render'

describe('SVG rendering', () => {
  test('builds a sized SVG with the requested colours', () => {
    const matrix = new Uint8Array([1, 0, 0, 1])
    const svg = toSvg({
      matrix,
      size: 2,
      moduleSize: 10,
      quietZone: 1,
      dark: '#112233',
      light: '#ffffff',
    })

    expect(svg).toContain('<svg')
    expect(svg).toContain('width="40"')
    expect(svg).toContain('viewBox="0 0 40 40"')
    expect(svg).toContain('fill="#112233"')
    expect(svg).toContain('fill="#ffffff"')
    expect(svg.match(/M/g)?.length).toBe(2)
  })

  test('falls back to safe colours when the input is not a hex colour', () => {
    const svg = toSvg({
      matrix: new Uint8Array([1]),
      size: 1,
      moduleSize: 10,
      quietZone: 0,
      dark: '"><script>alert(1)</script>',
      light: 'not-a-colour',
    })

    expect(svg).not.toContain('<script>')
    expect(svg).toContain('fill="#000000"')
    expect(svg).toContain('fill="#ffffff"')
  })
})
