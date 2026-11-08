import { expect, test, type Locator, type Page } from '@playwright/test'

const LEARN_URL = '/learn?data=https%3A%2F%2Finfinityproject.fr&level=H'

const EXAMPLE_LABELS = ['Low (L)', 'Medium (M)', 'Quartile (Q)', 'High (H)'] as const

const VERSION_SIZE = /v\d+\s*·\s*\d+×\d+/

test.beforeEach(async ({ page }) => {
  await page.goto(LEARN_URL)

  // The trace and its stage settle asynchronously: do not interact with the
  // help controls before the canvas and a nonzero frame counter are rendered.
  await expect(page.locator('canvas')).toBeVisible()
  await expect(page.locator('.timeline-counter')).toHaveText(/^Frame [1-9]\d* \/ [1-9]\d*$/)
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

async function roundedPagePosition(element: Locator): Promise<{ x: number; y: number }> {
  return element.evaluate((el) => {
    const rect = el.getBoundingClientRect()
    return {
      x: Math.round(rect.x + window.scrollX),
      y: Math.round(rect.y + window.scrollY),
    }
  })
}

// Two animation frames: the first flushes the pending style change, the second
// guarantees the browser laid out the new state before it is measured.
async function waitForLayoutFrame(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve())
        })
      }),
  )
}

test('keeps the help trigger in place when the banner visibility changes', async ({ page }) => {
  const banner = page.locator('.pwa-banner')
  const trigger = page.getByRole('button', { name: 'About error correction' })

  await expect(banner).toBeVisible()
  await expect(trigger).toBeVisible()

  // Toggle the banner through the DOM style so only the page layout reacts,
  // and compare the trigger position at each state of the cycle: it must stay
  // identical whether the banner is shown, hidden or restored.
  const withBanner = await roundedPagePosition(trigger)

  await banner.evaluate((el) => {
    if (!(el instanceof HTMLElement)) {
      throw new Error('.pwa-banner is not an HTML element')
    }
    el.style.display = 'none'
  })
  const withoutBanner = await roundedPagePosition(trigger)

  await banner.evaluate((el) => {
    if (!(el instanceof HTMLElement)) {
      throw new Error('.pwa-banner is not an HTML element')
    }
    el.style.display = ''
  })
  await waitForLayoutFrame(page)
  const restoredBanner = await roundedPagePosition(trigger)

  expect(withoutBanner).toEqual(withBanner)
  expect(restoredBanner).toEqual(withBanner)

  await trigger.click()
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('positions the banner inside the viewport across viewports and dark mode', async ({ page }) => {
  const banner = page.locator('.pwa-banner')

  await page.setViewportSize({ width: 1280, height: 720 })
  await expect(banner).toBeVisible()

  const desktop = await banner.evaluate((el) => {
    const inset = (value: string) => {
      const parsed = Number.parseFloat(value)
      return Number.isFinite(parsed) ? parsed : 0
    }
    const style = getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = document.documentElement.clientHeight
    return {
      position: style.position,
      viewportWidth,
      viewportHeight,
      rightEdge: rect.right,
      expectedRight: viewportWidth - inset(style.right) - inset(style.marginRight),
      bottomEdge: rect.bottom,
      expectedBottom: viewportHeight - inset(style.bottom) - inset(style.marginBottom),
    }
  })
  expect(desktop.position).toBe('fixed')
  expect(desktop.rightEdge).toBeCloseTo(desktop.expectedRight, 0)
  expect(desktop.bottomEdge).toBeCloseTo(desktop.expectedBottom, 0)
  expect(desktop.expectedRight).toBeGreaterThan(0)
  expect(desktop.expectedBottom).toBeGreaterThan(0)

  await page.setViewportSize({ width: 360, height: 800 })
  await expect(banner).toBeVisible()

  const mobile = await banner.evaluate((el) => {
    const inset = (value: string) => {
      const parsed = Number.parseFloat(value)
      return Number.isFinite(parsed) ? parsed : 0
    }
    const style = getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    const viewportWidth = document.documentElement.clientWidth
    return {
      viewportWidth,
      leftEdge: rect.left,
      expectedLeft: inset(style.left) + inset(style.marginLeft),
      rightEdge: rect.right,
      expectedRight: viewportWidth - inset(style.right) - inset(style.marginRight),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }
  })
  expect(mobile.leftEdge).toBeCloseTo(mobile.expectedLeft, 0)
  expect(mobile.rightEdge).toBeCloseTo(mobile.expectedRight, 0)
  expect(mobile.expectedLeft).toBeGreaterThan(0)
  expect(mobile.expectedRight).toBeLessThan(mobile.viewportWidth)
  expect(mobile.scrollWidth).toBeLessThanOrEqual(mobile.clientWidth)

  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(banner).toBeVisible()

  const dark = await banner.evaluate((el) => {
    const rect = el.getBoundingClientRect()
    return {
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      viewportWidth: document.documentElement.clientWidth,
      viewportHeight: document.documentElement.clientHeight,
    }
  })
  expect(dark.top).toBeGreaterThanOrEqual(0)
  expect(dark.left).toBeGreaterThanOrEqual(0)
  expect(dark.right).toBeLessThanOrEqual(dark.viewportWidth)
  expect(dark.bottom).toBeLessThanOrEqual(dark.viewportHeight)
})
