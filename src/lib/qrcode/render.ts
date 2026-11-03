import type { FormatType } from '@/types/qr'

const COLOR_RE = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i

function safeColor(value: string, fallback: string): string {
  return COLOR_RE.test(value) ? value : fallback
}

export interface MatrixRenderOptions {
  matrix: Uint8Array
  size: number
  moduleSize: number
  quietZone: number
  dark: string
  light: string
  highlight?: readonly number[]
  highlightColor?: string
}

/** Draw a QR matrix into a 2D context, in CSS pixels. */
export function drawMatrix(context: CanvasRenderingContext2D, options: MatrixRenderOptions): void {
  const { matrix, size, moduleSize, quietZone, dark, light, highlight, highlightColor } = options
  const dimension = (size + quietZone * 2) * moduleSize

  context.clearRect(0, 0, dimension, dimension)
  context.fillStyle = light
  context.fillRect(0, 0, dimension, dimension)
  context.fillStyle = dark

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (matrix[y * size + x] === 1) {
        context.fillRect(
          (x + quietZone) * moduleSize,
          (y + quietZone) * moduleSize,
          moduleSize,
          moduleSize,
        )
      }
    }
  }

  if (highlight?.length) {
    context.strokeStyle = highlightColor ?? '#f97316'
    context.lineWidth = Math.max(1, moduleSize * 0.2)
    for (let index = 0; index < highlight.length; index += 2) {
      const x = highlight[index]
      const y = highlight[index + 1]
      if (x === undefined || y === undefined) continue
      context.strokeRect(
        (x + quietZone) * moduleSize + context.lineWidth / 2,
        (y + quietZone) * moduleSize + context.lineWidth / 2,
        moduleSize - context.lineWidth,
        moduleSize - context.lineWidth,
      )
    }
  }
}

/** Build a standalone SVG string from a matrix. */
export function toSvg(options: MatrixRenderOptions): string {
  const { matrix, size, moduleSize, quietZone } = options
  const dark = safeColor(options.dark, '#000000')
  const light = safeColor(options.light, '#ffffff')
  const dimension = (size + quietZone * 2) * moduleSize
  const segments: string[] = []

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (matrix[y * size + x] !== 1) continue
      segments.push(
        `M${(x + quietZone) * moduleSize} ${(y + quietZone) * moduleSize}` +
          `h${moduleSize}v${moduleSize}h-${moduleSize}z`,
      )
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${dimension}" height="${dimension}"`,
    ` viewBox="0 0 ${dimension} ${dimension}" shape-rendering="crispEdges">`,
    `<rect width="${dimension}" height="${dimension}" fill="${light}"/>`,
    `<path fill="${dark}" d="${segments.join('')}"/>`,
    '</svg>',
  ].join('')
}

/** Render a matrix to a raster data URL. */
export function toDataUrl(
  options: MatrixRenderOptions,
  format: Exclude<FormatType, 'svg'>,
): string {
  const { size, moduleSize, quietZone } = options
  const dimension = (size + quietZone * 2) * moduleSize
  const canvas = document.createElement('canvas')
  canvas.width = dimension
  canvas.height = dimension

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D is not available.')

  drawMatrix(context, options)
  return canvas.toDataURL(`image/${format}`)
}
