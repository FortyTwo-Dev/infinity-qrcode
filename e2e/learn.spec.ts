import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const DATA = 'https%3A%2F%2Finfinityproject.fr'
// Payload form the application restores from the encoded query value.
const DATA_TEXT = decodeURIComponent(DATA)
const LEARN_URL = `/learn?data=${DATA}&level=H`
const SPECIAL_TEXT = 'Café & Co = #42?'
const TEXT_INPUT = 'input#text'

const REDUCED_MOTION_NOTE =
  'Autoplay is off because your system asks for reduced motion. Use the arrows to step through.'

/**
 * Splits a URL into its query and fragment parameters, so the assertions can
 * check both parts separately instead of searching for substrings.
 */
const parseUrlParts = (value: string) => {
  const url = new URL(value)
  return {
    url,
    query: new URLSearchParams(url.search),
    fragment: new URLSearchParams(url.hash.slice(1)),
  }
}

/** True when a `data` payload rides in the current query or fragment. */
const hasPayloadInUrl = (page: Page) => {
  const { query, fragment } = parseUrlParts(page.url())
  return query.has('data') || fragment.has('data')
}

/** The payload the page carries in its fragment, or null when absent. */
const fragmentData = (page: Page) => parseUrlParts(page.url()).fragment.get('data')

test('restores the frame from the URL', async ({ page }) => {
  await page.goto(`${LEARN_URL}&frame=90`)

  await expect(page.locator('body')).toContainText(/Frame 90 \/ \d+/)
})

test('writes the one-based frame to the URL when stepping', async ({ page }) => {
  await page.goto(LEARN_URL)

  await page.getByRole('button', { name: 'Next frame' }).click()

  // With the payload living in the fragment, the frame parameter can be
  // followed by the fragment delimiter instead of the end of the address.
  await expect(page).toHaveURL(/[?&]frame=2(?:[&#]|$)/)
  await expect(page.locator('body')).toContainText(/Frame 2 \/ \d+/)
})

test.describe('url state', () => {
  test.use({ reducedMotion: 'reduce' })

  test('keeps the payload out of the URL while typing', async ({ page }) => {
    await page.goto('/learn')

    await page.locator(TEXT_INPUT).fill('Hello privacy check')
    // Synchronization writes the non-sensitive level. Wait for that write
    // before judging where the payload ended up.
    await expect.poll(() => parseUrlParts(page.url()).query.has('level')).toBe(true)

    const { query, fragment } = parseUrlParts(page.url())
    expect(query.get('data')).toBeNull()
    expect(fragment.has('data')).toBe(false)
    expect(query.has('level')).toBe(true)
    // The first frame is index zero: the contract omits frame from the URL
    // at rest.
    expect(query.get('frame')).toBeNull()
  })

  test('migrates a legacy query link into the fragment', async ({ page }) => {
    await page.goto(`${LEARN_URL}&frame=90`)

    await expect(page.locator('body')).toContainText(/Frame 90 \/ \d+/)
    // The legacy query payload moves to the fragment without a reload.
    await expect.poll(() => fragmentData(page)).toBe(DATA_TEXT)

    const { query, fragment } = parseUrlParts(page.url())
    expect(query.get('data')).toBeNull()
    expect(query.get('level')).toBe('H')
    expect(query.get('frame')).toBe('90')
    expect(fragment.get('data')).toBe(DATA_TEXT)
  })

  test('keeps the fragment payload while synchronizing level and frame', async ({ page }) => {
    await page.goto(`${LEARN_URL}&frame=1`)

    await expect(page.locator('body')).toContainText(/Frame 1 \/ \d+/)
    await page.getByRole('button', { name: 'Next frame' }).click()
    await expect.poll(() => parseUrlParts(page.url()).query.get('frame')).toBe('2')

    const { query, fragment } = parseUrlParts(page.url())
    expect(query.get('data')).toBeNull()
    expect(fragment.get('data')).toBe(DATA_TEXT)
  })

  test('drops the fragment payload after an edit', async ({ page }) => {
    await page.goto(`${LEARN_URL}&frame=1`)

    await expect.poll(() => fragmentData(page)).toBe(DATA_TEXT)

    await page.locator(TEXT_INPUT).fill('Edited away from the link')
    // After an edit, neither the fragment nor the query may carry a payload.
    await expect.poll(() => hasPayloadInUrl(page)).toBe(false)

    await expect(page.locator(TEXT_INPUT)).toHaveValue('Edited away from the link')
    const { query, fragment } = parseUrlParts(page.url())
    expect(query.get('data')).toBeNull()
    expect(fragment.get('data')).toBeNull()
  })
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
  test.use({ reducedMotion: 'reduce' })

  test('confirms the link was copied', async ({ page }) => {
    await page.goto(`${LEARN_URL}&frame=90`)

    await page.getByRole('button', { name: 'Copy link to this frame' }).click()

    await expect(page.getByRole('button', { name: 'Link copied' })).toBeVisible()
  })

  test('copies a shareable link with the payload in the fragment', async ({ page }) => {
    await page.goto(`${LEARN_URL}&frame=90`)
    await expect(page.locator('body')).toContainText(/Frame 90 \/ \d+/)
    await expect.poll(() => fragmentData(page)).toBe(DATA_TEXT)

    await page.getByRole('button', { name: 'Copy link to this frame' }).click()
    await expect(page.getByRole('button', { name: 'Link copied' })).toBeVisible()

    const link = await page.evaluate(() => navigator.clipboard.readText())
    const { url, query, fragment } = parseUrlParts(link)
    expect(url.pathname).toBe('/learn')
    expect(query.get('data')).toBeNull()
    expect(query.get('level')).toBe('H')
    expect(query.get('frame')).toBe('90')
    expect(fragment.get('data')).toBe(DATA_TEXT)
  })

  test('restores text and frame from a fragment link', async ({ page }) => {
    const text = 'Hello shared frame'
    await page.goto(`/learn?data=${encodeURIComponent(text)}&level=H&frame=1`)
    await page.getByRole('button', { name: 'Next frame' }).click()
    await expect(page.locator('body')).toContainText(/Frame 2 \/ \d+/)
    await expect.poll(() => fragmentData(page)).toBe(text)

    await page.getByRole('button', { name: 'Copy link to this frame' }).click()
    await expect(page.getByRole('button', { name: 'Link copied' })).toBeVisible()

    const link = await page.evaluate(() => navigator.clipboard.readText())
    const { query, fragment } = parseUrlParts(link)
    expect(query.get('data')).toBeNull()
    expect(query.get('level')).toBe('H')
    expect(query.get('frame')).toBe('2')
    expect(fragment.get('data')).toBe(text)

    await page.goto(link)
    await expect(page.locator(TEXT_INPUT)).toHaveValue(text)
    await expect(page.locator('body')).toContainText(/Frame 2 \/ \d+/)
  })

  test('round-trips special characters through a fragment link', async ({ page }) => {
    await page.goto('/learn')

    await page.locator(TEXT_INPUT).fill(SPECIAL_TEXT)
    // Synchronization writes the non-sensitive level. Wait for that write
    // before judging where the payload ended up.
    await expect.poll(() => parseUrlParts(page.url()).query.has('level')).toBe(true)
    const { query, fragment } = parseUrlParts(page.url())
    expect(query.get('data')).toBeNull()
    expect(fragment.has('data')).toBe(false)

    await page.getByRole('button', { name: 'Copy link to this frame' }).click()
    await expect(page.getByRole('button', { name: 'Link copied' })).toBeVisible()

    const link = await page.evaluate(() => navigator.clipboard.readText())
    const { query: linkQuery, fragment: linkFragment } = parseUrlParts(link)
    expect(linkQuery.get('data')).toBeNull()
    expect(linkQuery.get('level')).toBe('H')
    // The first frame is index zero: the copied link omits frame.
    expect(linkQuery.get('frame')).toBeNull()
    expect(linkFragment.get('data')).toBe(SPECIAL_TEXT)

    await page.goto(link)
    await expect(page.locator(TEXT_INPUT)).toHaveValue(SPECIAL_TEXT)
    await expect(page.locator('body')).toContainText(/Frame 1 \/ \d+/)
  })
})

test('has nothing to share without a trace', async ({ page }) => {
  await page.goto('/learn')

  await expect(page.locator('body')).toContainText('Frame 0 / 0')
  await expect(page.getByRole('button', { name: 'Copy link to this frame' })).toBeDisabled()
})
