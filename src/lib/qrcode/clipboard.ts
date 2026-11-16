import type { QrMatrixData, QrOptions } from '@/types/qr'

import { drawMatrix } from './render'

/** Why a clipboard write could not complete. */
export type CopyImageFailure = 'unsupported' | 'rejected' | 'encode'

/** A clipboard write failure the view turns into a catalog message. */
export class CopyImageError extends Error {
  readonly reason: CopyImageFailure

  constructor(reason: CopyImageFailure) {
    super(`QR image copy failed: ${reason}`)
    this.name = 'CopyImageError'
    this.reason = reason
  }
}

/** True when the browser exposes the image clipboard APIs. */
export function canCopyImage(): boolean {
  return (
    typeof ClipboardItem === 'function' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard?.write === 'function'
  )
}

/** Encode the canvas as a PNG blob. */
function encodePng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new CopyImageError('encode'))
      }
    }, 'image/png')
  })
}

/**
 * Copy the rendered QR code as a PNG image.
 *
 * The ClipboardItem is built synchronously so the write stays inside the click
 * gesture Safari requires; the canvas encodes the PNG asynchronously.
 */
export async function copyQrImage(data: QrMatrixData, options: QrOptions): Promise<void> {
  if (!canCopyImage()) throw new CopyImageError('unsupported')

  const dimension = (data.size + options.quietZone * 2) * options.moduleSize
  const canvas = document.createElement('canvas')
  canvas.width = dimension
  canvas.height = dimension

  const context = canvas.getContext('2d')
  if (!context) throw new CopyImageError('encode')

  drawMatrix(context, {
    matrix: data.matrix,
    size: data.size,
    moduleSize: options.moduleSize,
    quietZone: options.quietZone,
    dark: options.dark,
    light: options.light,
  })

  const png = encodePng(canvas)
  const item = new ClipboardItem({ 'image/png': png })

  try {
    await Promise.all([navigator.clipboard.write([item]), png])
  } catch (cause) {
    throw cause instanceof CopyImageError ? cause : new CopyImageError('rejected')
  }
}
