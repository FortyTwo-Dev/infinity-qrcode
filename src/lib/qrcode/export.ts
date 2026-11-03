import type { FormatType, QrOptions, QrMatrixData } from '@/types/qr'
import { toDataUrl, toSvg } from './render'

/** Trigger a browser download for a URL. */
export function downloadUrl(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
}

/** Export a QR code in the requested format and download it. */
export function downloadQr(data: QrMatrixData, options: QrOptions, basename = 'qrcode'): void {
  const renderOptions = {
    matrix: data.matrix,
    size: data.size,
    moduleSize: options.moduleSize,
    quietZone: options.quietZone,
    dark: options.dark,
    light: options.light,
  }

  const format: FormatType = options.format
  const filename = `${basename}.${format}`

  if (format === 'svg') {
    const blob = new Blob([toSvg(renderOptions)], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    downloadUrl(url, filename)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return
  }

  downloadUrl(toDataUrl(renderOptions, format), filename)
}
