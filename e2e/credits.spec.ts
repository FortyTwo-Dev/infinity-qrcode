import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const CREDITS_PATH = '/credits'

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
