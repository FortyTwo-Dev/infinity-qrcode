import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('starts without an error and with a disabled download', async ({ page }) => {
  await expect(page.locator('.it-field-error')).toHaveCount(0)
  await expect(page.getByText('Enter valid content to see the QR code.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Download SVG' })).toBeDisabled()
})

test('generates a QR code from text', async ({ page }) => {
  await page.locator('#text').fill('Hello')

  await expect(page.locator('canvas')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Download SVG' })).toBeEnabled()
})

test('shows an error after an invalid URL, then clears it', async ({ page }) => {
  await page.getByText('URL', { exact: true }).click()
  await expect(page.locator('#url')).toBeVisible()
  await expect(page.locator('.it-field-error')).toHaveCount(0)

  await page.locator('#url').fill('not a url')
  await expect(page.getByText('Enter a valid URL.')).toBeVisible()

  await page.locator('#url').fill('example.com')
  await expect(page.locator('.it-field-error')).toHaveCount(0)
  await expect(page.locator('canvas')).toBeVisible()
})

test('switches content type without leaking validation', async ({ page }) => {
  await page.locator('#text').fill('Hello')

  await page.getByText('Wi-Fi', { exact: true }).click()

  await expect(page.locator('#wifi-ssid')).toBeVisible()
  await expect(page.locator('.it-field-error')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Download SVG' })).toBeDisabled()
})

test('keeps the preview bounded when the export size grows', async ({ page }) => {
  await page.locator('#text').fill('Hello')
  await expect(page.locator('canvas')).toBeVisible()

  await page.locator('input[aria-label="Module size value"]').fill('24')

  const box = await page.locator('canvas').boundingBox()
  expect(box?.width ?? 0).toBeLessThanOrEqual(360)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(overflow).toBe(false)
})

test('closes the theme menu on an outside click', async ({ page }) => {
  await page.getByText('Theme', { exact: true }).click()
  await expect(page.locator('details[open]')).toHaveCount(1)

  await page.getByRole('heading', { level: 1 }).click()

  await expect(page.locator('details[open]')).toHaveCount(0)
})

test('toggles dark mode', async ({ page }) => {
  await page.getByRole('button', { name: 'Switch to dark mode' }).click()

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible()
})

test.describe('responsive layout', () => {
  for (const width of [360, 768, 1440]) {
    test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.locator('#text').fill('Hello')

      const metrics = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }))

      expect(metrics.scroll).toBeLessThanOrEqual(metrics.client)
    })
  }
})
