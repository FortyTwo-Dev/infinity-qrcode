import { expect, test } from '@playwright/test'

const routes = [
  { path: '/', title: 'QR Code generator' },
  { path: '/learn', title: 'Learn QR codes' },
  { path: '/credits', title: 'Credits' },
  { path: '/legal', title: 'Mentions légales' },
  { path: '/privacy', title: 'Politique de confidentialité' },
]

for (const route of routes) {
  test(`${route.path} renders without a console error`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('pageerror', (error) => errors.push(error.message))

    await page.goto(route.path)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { level: 1, name: route.title })).toBeVisible()
    expect(errors).toEqual([])
  })
}
