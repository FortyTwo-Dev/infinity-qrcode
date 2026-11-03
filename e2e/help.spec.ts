import { expect, test, type Locator } from '@playwright/test'

const LEARN_URL = '/learn?data=https%3A%2F%2Finfinityproject.fr&level=H'

const EXAMPLE_LABELS = ['Low (L)', 'Medium (M)', 'Quartile (Q)', 'High (H)'] as const

const VERSION_SIZE = /v\d+\s*·\s*\d+×\d+/

test.beforeEach(async ({ page }) => {
  await page.goto(LEARN_URL)
})

test('explains error correction and lists one example per level', async ({ page }) => {
  await page.getByRole('button', { name: 'About error correction' }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: 'Error correction' })).toBeVisible()
  await expect(dialog.getByText(/error correction/i).last()).toBeVisible()

  for (const label of EXAMPLE_LABELS) {
    const entry = dialog.getByText(label, { exact: true })
    await expect(entry).toBeVisible()
    await expect(entry.locator('..')).toHaveText(VERSION_SIZE)
  }

  await expect(dialog.getByText(VERSION_SIZE)).toHaveCount(4)
})

test('closes the dialog with the close button, then with Escape', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'About error correction' })
  const dialog = page.getByRole('dialog')

  await trigger.click()
  await expect(dialog).toBeVisible()

  await dialog.getByRole('button', { name: 'Close' }).click()
  await expect(dialog).toBeHidden()

  await trigger.click()
  await expect(dialog).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('closes the dialog on a click outside the panel', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'About error correction' })
  const dialog = page.getByRole('dialog')

  await trigger.click()
  await expect(dialog).toBeVisible()

  await page.mouse.click(10, 10)
  await expect(dialog).toBeHidden()
})

async function expectLabelWithValue(dialog: Locator, label: string, value: string) {
  const entry = dialog.getByText(label, { exact: true })
  await expect(entry).toBeVisible()
  await expect(entry.locator('..')).toContainText(value)
}

test('explains the version with an Auto and a Version 10 example', async ({ page }) => {
  await page.getByRole('button', { name: 'About the version' }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: 'Version' })).toBeVisible()
  const explanation = dialog.locator('p').first()
  await expect(explanation).toBeVisible()
  await expect(explanation).not.toBeEmpty()

  await expectLabelWithValue(dialog, 'Auto', 'v1 · 21×21')
  await expectLabelWithValue(dialog, 'Version 10', 'v10 · 57×57')

  await dialog.getByRole('button', { name: 'Close' }).click()
  await expect(dialog).toBeHidden()
})

test('explains the detail level with one frame count per stride', async ({ page }) => {
  await page.getByRole('button', { name: 'About the detail level' }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: 'Detail' })).toBeVisible()

  await expectLabelWithValue(dialog, 'Every 50 modules', '21 frames')
  await expectLabelWithValue(dialog, 'Every 10 modules', '37 frames')
  await expectLabelWithValue(dialog, 'Every data module', '223 frames')

  await dialog.getByRole('button', { name: 'Close' }).click()
  await expect(dialog).toBeHidden()
})
