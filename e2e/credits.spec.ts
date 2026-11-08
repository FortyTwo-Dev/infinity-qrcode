import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const CREDITS_PATH = '/credits'
const VUE_THEME_ENTRY_URL = 'https://github.com/InfinityLib/infinity-theme-vue'
const VUE_THEME_ROLE_TEXT = 'Vue wrappers for the theme component classes.'
const EXPECTED_ENTRY_COUNT = 10

// The credits list is the list holding the exact "Infinity Theme" credit entry.
function creditsList(page: Page): Locator {
  return page
    .getByRole('list')
    .filter({
      has: page.getByRole('link', { name: 'Infinity Theme', exact: true }),
    })
}

async function expectNoListMarkers(list: Locator): Promise<void> {
  const computed = await list.evaluate((element) => {
    const styles = getComputedStyle(element)
    return {
      listStyleType: styles.listStyleType,
      paddingInlineStart: styles.getPropertyValue('padding-inline-start'),
    }
  })
  expect(computed.listStyleType).toBe('none')
  expect(computed.paddingInlineStart).toBe('0px')
}

test('credits lists Infinity Theme Vue as a distinct entry with license and role text', async ({
  page,
}) => {
  await page.goto(CREDITS_PATH)

  const list = creditsList(page)
  const vueThemeLink = page.getByRole('link', {
    name: 'Infinity Theme Vue',
    exact: true,
  })

  // Both entries exist as distinct accessible names.
  await expect(list.getByRole('link', { name: 'Infinity Theme', exact: true })).toBeVisible()
  await expect(vueThemeLink).toBeVisible()
  await expect(vueThemeLink).toHaveAttribute('href', VUE_THEME_ENTRY_URL)

  // The entry keeps the external-link behaviour of the page.
  await expect(vueThemeLink).toHaveAttribute('target', '_blank')
  await expect(vueThemeLink).toHaveAttribute('rel', /\bnoopener\b/)
  await expect(vueThemeLink).toHaveAttribute('rel', /\bnoreferrer\b/)

  // The entry shows its license and its role text.
  const vueThemeEntry = list.getByRole('listitem').filter({ has: vueThemeLink })
  await expect(vueThemeEntry).toContainText('MIT')
  await expect(vueThemeEntry).toContainText(VUE_THEME_ROLE_TEXT)

  // The entry completes the credits list.
  await expect(list.getByRole('listitem')).toHaveCount(EXPECTED_ENTRY_COUNT)
})

test('credits list has no markers and no start padding in light and dark mode', async ({
  page,
}) => {
  await page.goto(CREDITS_PATH)

  const list = creditsList(page)
  await expect(list).toBeVisible()

  // Light mode (fresh context, no persisted mode).
  await expectNoListMarkers(list)

  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expectNoListMarkers(list)
})
