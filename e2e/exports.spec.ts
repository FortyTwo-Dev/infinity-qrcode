import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const JPEG_START = Buffer.from([0xff, 0xd8])
const JPEG_END = Buffer.from([0xff, 0xd9])

interface FormatCase {
  label: string
  filename: string
  mimeType: string | null
  validate: (file: Buffer) => void
}

function expectSvgFile(file: Buffer): void {
  const svg = file.toString('utf8')
  const trimmed = svg.trim()
  expect(trimmed.startsWith('<svg')).toBe(true)
  expect(trimmed.endsWith('</svg>')).toBe(true)
  expect(svg).toMatch(/width=["']200["']/)
  expect(svg).toMatch(/height=["']200["']/)
  expect(svg).toMatch(/viewBox=["']0 0 200 200["']/)
  expect(svg).toMatch(/<path\s[^>]*\sd=["'][^"']+["']/)
}

function expectPngFile(file: Buffer): void {
  expect(file.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true)
}

function expectWebpFile(file: Buffer): void {
  expect(file.subarray(0, 4).toString('latin1')).toBe('RIFF')
  expect(file.subarray(8, 12).toString('latin1')).toBe('WEBP')
}

function expectJpegFile(file: Buffer): void {
  expect(file.subarray(0, 2).equals(JPEG_START)).toBe(true)
  expect(file.subarray(-2).equals(JPEG_END)).toBe(true)
}

interface ImageSize {
  width: number
  height: number
}

// Raster files are decoded in the browser, so a truncated or mis-sized file fails.
async function decodedImageSize(page: Page, file: Buffer, mimeType: string): Promise<ImageSize> {
  return page.evaluate(
    async ({ bytes, type }) => {
      const bitmap = await createImageBitmap(new Blob([bytes], { type }))
      const size = { width: bitmap.width, height: bitmap.height }
      bitmap.close()
      return size
    },
    { bytes: new Uint8Array(file), type: mimeType },
  )
}

const formatCases: FormatCase[] = [
  { filename: 'qrcode-text.svg', label: 'SVG', mimeType: null, validate: expectSvgFile },
  { filename: 'qrcode-text.png', label: 'PNG', mimeType: 'image/png', validate: expectPngFile },
  { filename: 'qrcode-text.webp', label: 'WebP', mimeType: 'image/webp', validate: expectWebpFile },
  { filename: 'qrcode-text.jpeg', label: 'JPEG', mimeType: 'image/jpeg', validate: expectJpegFile },
]

async function previewDataUrl(page: Page): Promise<string> {
  return page.locator('canvas').evaluate((element) => {
    if (!(element instanceof HTMLCanvasElement)) {
      throw new Error('The preview is not rendered in a canvas')
    }
    return element.toDataURL()
  })
}

// A blank canvas of the same size proves the snapshot is not an empty frame.
async function blankCanvasDataUrl(page: Page): Promise<string> {
  return page.locator('canvas').evaluate((element) => {
    if (!(element instanceof HTMLCanvasElement)) {
      throw new Error('The preview is not rendered in a canvas')
    }
    const blank = document.createElement('canvas')
    blank.width = element.width
    blank.height = element.height
    return blank.toDataURL()
  })
}

// Each case downloads the real file and checks its signature or document shape.
for (const { filename, label, mimeType, validate } of formatCases) {
  test(`downloads a valid ${label} export as ${filename}`, async ({ page }) => {
    await page.goto('/')
    await page.locator('#text').fill('Hello')

    const formatRadio = page.getByRole('radio', { name: label, exact: true })
    await page.getByText(label, { exact: true }).click()
    await expect(formatRadio).toBeChecked()

    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    const previewBefore = await previewDataUrl(page)
    expect(previewBefore).not.toBe(await blankCanvasDataUrl(page))

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: `Download ${label}` }).click(),
    ])

    expect(download.suggestedFilename()).toBe(filename)

    const downloadPath = await download.path()
    if (downloadPath === null) {
      throw new Error('The download did not produce a file on disk')
    }
    const file = await readFile(downloadPath)

    expect(file.length).toBeGreaterThan(0)
    validate(file)

    if (mimeType) {
      expect(await decodedImageSize(page, file, mimeType)).toEqual({
        width: 200,
        height: 200,
      })
    }

    // The preview canvas must outlive the export unchanged.
    await expect(canvas).toBeVisible()
    expect(await previewDataUrl(page)).toBe(previewBefore)
  })
}

test('does not emit a download when the content is invalid', async ({ page }) => {
  await page.goto('/')
  await page.getByText('URL', { exact: true }).click()
  await expect(page.locator('#url')).toBeVisible()

  const downloads: string[] = []
  page.on('download', (download) => {
    downloads.push(download.suggestedFilename())
  })

  await page.locator('#url').fill('not a url')
  await expect(page.getByText('Enter a valid URL.')).toBeVisible()

  const button = page.getByRole('button', { name: 'Download SVG' })
  await expect(button).toBeDisabled()

  // A disabled button ignores a DOM click, so the download event listener
  // must reject instead of resolving.
  const downloadEvent = page.waitForEvent('download', { timeout: 1000 })
  const downloadRejection = expect(downloadEvent).rejects.toThrow(/Timeout/)

  await button.evaluate((element) => {
    if (!(element instanceof HTMLButtonElement)) {
      throw new Error('The download control is not a button')
    }
    element.click()
  })

  await expect(button).toBeDisabled()
  await downloadRejection
  expect(downloads).toEqual([])
})
