import { expect, test } from '@playwright/test'

const DATA = 'https%3A%2F%2Finfinityproject.fr'
const LEARN_URL = `/learn?data=${DATA}&level=H`

const REDUCED_MOTION_NOTE =
  'Autoplay is off because your system asks for reduced motion. Use the arrows to step through.'

test('restores the frame from the URL', async ({ page }) => {
  await page.goto(`${LEARN_URL}&frame=90`)

  await expect(page.locator('body')).toContainText(/Frame 90 \/ \d+/)
})

test('writes the one-based frame to the URL when stepping', async ({ page }) => {
  await page.goto(LEARN_URL)

  await page.getByRole('button', { name: 'Next frame' }).click()

  await expect(page).toHaveURL(/[?&]frame=2(?:&|$)/)
  await expect(page.locator('body')).toContainText(/Frame 2 \/ \d+/)
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('disables autoplay and keeps manual stepping', async ({ page }) => {
    await page.goto(`/learn?data=${DATA}`)

    await expect(page.getByRole('button', { name: 'Play' })).toBeDisabled()
    await expect(page.getByText(REDUCED_MOTION_NOTE)).toBeVisible()

    await page.getByRole('button', { name: 'Next frame' }).click()
    await expect(page.locator('body')).toContainText(/Frame 2 \/ \d+/)
  })
})

test.describe('share link', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  test('confirms the link was copied', async ({ page }) => {
    await page.goto(`${LEARN_URL}&frame=90`)

    await page.getByRole('button', { name: 'Copy link to this frame' }).click()

    await expect(page.getByRole('button', { name: 'Link copied' })).toBeVisible()
  })

  test('copies the current frame deep link to the clipboard', async ({ page }) => {
    await page.goto(`${LEARN_URL}&frame=90`)

    await page.getByRole('button', { name: 'Copy link to this frame' }).click()
    await expect(page.getByRole('button', { name: 'Link copied' })).toBeVisible()

    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied).toContain('/learn')
    expect(copied).toContain('data=')
    expect(copied).toContain('frame=90')
  })
})

test('has nothing to share without a trace', async ({ page }) => {
  await page.goto('/learn')

  await expect(page.locator('body')).toContainText('Frame 0 / 0')
  await expect(page.getByRole('button', { name: 'Copy link to this frame' })).toBeDisabled()
})
