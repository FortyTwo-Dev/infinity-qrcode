import { afterEach, describe, expect, test, vi } from 'vitest'

import type { QrMatrixData, QrOptions } from '@/types/qr'

import { canCopyImage, CopyImageError, copyQrImage } from './clipboard'

const DATA: QrMatrixData = {
  matrix: new Uint8Array([1, 0, 0, 1]),
  size: 2,
  version: 1,
  mask: 0,
}

const OPTIONS: QrOptions = {
  level: 'H',
  format: 'png',
  moduleSize: 8,
  quietZone: 2,
  dark: '#000000',
  light: '#ffffff',
}

type ClipboardData = Record<string, string | Blob | PromiseLike<string | Blob>>

class FakeClipboardItem {
  constructor(readonly data: ClipboardData) {}
}

function stubClipboard(write: (items: unknown[]) => Promise<void>): void {
  vi.stubGlobal('ClipboardItem', FakeClipboardItem)
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { write },
  })
}

function stubCanvas(
  context: object | null,
  blob: Blob | null = new Blob(['png'], { type: 'image/png' }),
) {
  const canvases: HTMLCanvasElement[] = []

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (
    this: HTMLCanvasElement,
  ) {
    canvases.push(this)
    return context as unknown as CanvasRenderingContext2D | null
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
    callback(blob)
  })

  return canvases
}

afterEach(() => {
  vi.unstubAllGlobals()
  Reflect.deleteProperty(navigator, 'clipboard')
})

describe('copyQrImage', () => {
  test('reports an unsupported clipboard when ClipboardItem is missing', async () => {
    vi.stubGlobal('ClipboardItem', undefined)
    vi.stubGlobal('navigator', { clipboard: { write: vi.fn() } })

    expect(canCopyImage()).toBe(false)
    await expect(copyQrImage(DATA, OPTIONS)).rejects.toMatchObject({ reason: 'unsupported' })
  })

  test('reports an unsupported clipboard when the write API is missing', async () => {
    vi.stubGlobal('ClipboardItem', FakeClipboardItem)
    vi.stubGlobal('navigator', {})

    expect(canCopyImage()).toBe(false)
    await expect(copyQrImage(DATA, OPTIONS)).rejects.toMatchObject({ reason: 'unsupported' })
  })

  test('writes a PNG item sized from the quiet zone and the module size', async () => {
    const write = vi.fn<(items: unknown[]) => Promise<void>>().mockResolvedValue(undefined)
    stubClipboard(write)
    const canvases = stubCanvas({ clearRect: vi.fn(), fillRect: vi.fn(), fillStyle: '' })

    await copyQrImage(DATA, OPTIONS)

    expect(canvases).toHaveLength(1)
    expect(canvases[0]?.width).toBe((2 + 2 * 2) * 8)
    expect(canvases[0]?.height).toBe((2 + 2 * 2) * 8)
    expect(write).toHaveBeenCalledTimes(1)

    const items = write.mock.calls[0]?.[0] as FakeClipboardItem[]
    const blob = await items[0]?.data['image/png']

    expect(blob).toBeInstanceOf(Blob)
    expect((blob as Blob).type).toBe('image/png')
  })

  test('reports a rejected write', async () => {
    const write = vi
      .fn<(items: unknown[]) => Promise<void>>()
      .mockRejectedValue(new Error('denied'))
    stubClipboard(write)
    stubCanvas({ clearRect: vi.fn(), fillRect: vi.fn(), fillStyle: '' })

    await expect(copyQrImage(DATA, OPTIONS)).rejects.toBeInstanceOf(CopyImageError)
    await expect(copyQrImage(DATA, OPTIONS)).rejects.toMatchObject({ reason: 'rejected' })
  })

  test('reports an encoding failure when the canvas produces no blob', async () => {
    const write = vi.fn<(items: unknown[]) => Promise<void>>().mockResolvedValue(undefined)
    stubClipboard(write)
    stubCanvas({ clearRect: vi.fn(), fillRect: vi.fn(), fillStyle: '' }, null)

    await expect(copyQrImage(DATA, OPTIONS)).rejects.toMatchObject({ reason: 'encode' })
  })
})
