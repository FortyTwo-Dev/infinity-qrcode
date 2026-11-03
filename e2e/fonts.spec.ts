import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

async function bodyFontFamily(page: Page): Promise<string> {
  return page.evaluate(async () => {
    await document.fonts.ready
    return getComputedStyle(document.body).fontFamily
  })
}

async function storedFont(page: Page): Promise<string | null> {
  return page.evaluate(() => localStorage.getItem('readingFont'))
}

test('uses Space Grotesk and loads it', async ({ page }) => {
  const state = await page.evaluate(async () => {
    await document.fonts.ready
    return {
      family: getComputedStyle(document.body).fontFamily,
      loaded: document.fonts.check('16px "Space Grotesk"'),
    }
  })

  expect(state.family).toContain('Space Grotesk')
  expect(state.loaded).toBe(true)
})

test('enables the dyslexia-friendly font, persists it and survives a reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Enable dyslexia-friendly font' }).click()

  await expect(page.locator('html')).toHaveAttribute('data-font', 'dyslexic')
  await expect.poll(() => storedFont(page)).toBe('dyslexic')
  await expect.poll(() => bodyFontFamily(page)).toContain('OpenDyslexic')

  await page.reload()

  await expect(page.locator('html')).toHaveAttribute('data-font', 'dyslexic')
  await expect.poll(() => storedFont(page)).toBe('dyslexic')
  await expect.poll(() => bodyFontFamily(page)).toContain('OpenDyslexic')
})

test('disables the dyslexia-friendly font and stores the default', async ({ page }) => {
  await page.getByRole('button', { name: 'Enable dyslexia-friendly font' }).click()
  await expect(page.getByRole('button', { name: 'Disable dyslexia-friendly font' })).toBeVisible()

  await page.getByRole('button', { name: 'Disable dyslexia-friendly font' }).click()

  await expect
    .poll(() => page.evaluate(() => document.documentElement.hasAttribute('data-font')))
    .toBe(false)
  await expect.poll(() => storedFont(page)).toBe('default')
})
