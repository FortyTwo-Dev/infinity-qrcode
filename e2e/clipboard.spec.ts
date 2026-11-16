import { expect, test } from '@playwright/test'
import type { BrowserContext, Page } from '@playwright/test'

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const COPY_BUTTON = 'Copy image'
const COPY_STATUS = 'Copy status'
const COPIED = 'QR code copied to the clipboard.'

interface CopyRecord {
  types: string[]
  size: number
  signature: number[]
}

// Records what the app hands to Clipboard.write, then calls the native
// implementation: the test observes the payload without replacing the write.
async function instrumentClipboard(page: Page): Promise<void> {
  await page.evaluate(() => {
    const clipboard = navigator.clipboard
    if (!clipboard) throw new Error('The page has no clipboard API')

    const nativeWrite = clipboard.write.bind(clipboard)
    const record: CopyRecord = { types: [], size: 0, signature: [] }
    ;(window as unknown as { __copied?: CopyRecord }).__copied = record

    Object.defineProperty(clipboard, 'write', {
      configurable: true,
      value: (items: ClipboardItems): Promise<void> => {
        const item = items[0]
        if (item) {
          record.types = [...item.types]
          void item.getType('image/png').then(async (blob) => {
            const bytes = new Uint8Array(await blob.arrayBuffer())
            record.size = blob.size
            record.signature = Array.from(bytes.slice(0, 8))
          })
        }
        return nativeWrite(items)
      },
    })
  })
}

function copied(page: Page): Promise<CopyRecord | undefined> {
  return page.evaluate(() => (window as unknown as { __copied?: CopyRecord }).__copied)
}

// Chromium gates the write behind a permission the other engines do not
// expose; they either write from the click or refuse, which the app reports.
async function grantWrite(context: BrowserContext, browserName: string): Promise<void> {
  if (browserName !== 'chromium') return
  await context.grantPermissions(['clipboard-write'])
}

async function generate(page: Page): Promise<void> {
  await page.goto('/')
  await page.locator('#text').fill('Hello')
  await expect(page.locator('canvas')).toBeVisible()
  // Fonts change the line boxes, so settle them before any geometry check.
  await page.evaluate(() => document.fonts.ready)
}

test('copies a PNG and confirms it in a bottom-right toast', async ({
  page,
  context,
  browserName,
}) => {
  await grantWrite(context, browserName)
  await generate(page)
  await instrumentClipboard(page)

  const download = page.getByRole('button', { name: 'Download SVG' })
  const copy = page.getByRole('button', { name: COPY_BUTTON })
  // Playwright scrolls before clicking, so settle the scroll first: the check
  // is that the fixed toast moves nothing, not that the click does not scroll.
  await copy.scrollIntoViewIfNeeded()
  const downloadBox = await download.boundingBox()

  await copy.click()

  const toast = page.getByRole('status', { name: COPY_STATUS })
  await expect(toast).toContainText(COPIED)

  const record = await copied(page)
  expect(record?.types).toContain('image/png')
  await expect.poll(async () => (await copied(page))?.size ?? 0).toBeGreaterThan(0)
  expect((await copied(page))?.signature).toEqual(PNG_SIGNATURE)

  // A fixed overlay: it sits in the corner without moving the controls.
  const viewport = page.viewportSize()
  const box = await toast.boundingBox()
  expect(box).not.toBeNull()
  expect(viewport).not.toBeNull()
  expect(box!.y + box!.height).toBeGreaterThan(viewport!.height * 0.6)
  expect(box!.x + box!.width).toBeGreaterThan(viewport!.width * 0.6)
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height)

  expect(await download.boundingBox()).toEqual(downloadBox)

  // A success confirmation dismisses itself.
  await expect(toast).toBeHidden({ timeout: 6000 })
})

test('keeps the copy toast inside a 360 px viewport', async ({ page, context, browserName }) => {
  await grantWrite(context, browserName)
  await page.setViewportSize({ width: 360, height: 800 })
  await generate(page)
  await instrumentClipboard(page)

  await page.getByRole('button', { name: COPY_BUTTON }).click()
  await expect(page.getByRole('status', { name: COPY_STATUS })).toContainText(COPIED)

  const box = await page.getByRole('status', { name: COPY_STATUS }).boundingBox()
  expect(box).not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(360)

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(overflow).toBe(false)
})

test('puts a decodable PNG on the system clipboard', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'clipboard-read is only granted by Chromium')

  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await generate(page)

  await page.getByRole('button', { name: COPY_BUTTON }).click()
  await expect(page.getByRole('status', { name: COPY_STATUS })).toContainText(COPIED)

  const image = await page.evaluate(async () => {
    for (const item of await navigator.clipboard.read()) {
      if (!item.types.includes('image/png')) continue
      const blob = await item.getType('image/png')
      const bytes = new Uint8Array(await blob.arrayBuffer())
      const bitmap = await createImageBitmap(blob)
      const size = { width: bitmap.width, height: bitmap.height }
      bitmap.close()
      return { signature: Array.from(bytes.slice(0, 8)), ...size }
    }
    return null
  })

  expect(image?.signature).toEqual(PNG_SIGNATURE)
  expect(image?.width).toBe(200)
  expect(image?.height).toBe(200)
})

test('reports a refused clipboard write without hiding the code', async ({ page }) => {
  await generate(page)

  // The engine refuses the write, so the failure path is exercised for real.
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, 'write', {
      configurable: true,
      value: () => Promise.reject(new Error('denied')),
    })
  })

  await page.getByRole('button', { name: COPY_BUTTON }).click()

  await expect(page.getByRole('status', { name: COPY_STATUS })).toContainText(
    'The image could not be copied. Download it instead.',
  )
  await expect(page.locator('canvas')).toBeVisible()

  // A failure stays until it is closed.
  await page
    .getByRole('status', { name: COPY_STATUS })
    .getByRole('button', { name: 'Close' })
    .click()
  await expect(page.getByRole('status', { name: COPY_STATUS })).toBeHidden()
})
