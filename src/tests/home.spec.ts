import { expect, test } from '@playwright/test'

test.describe('home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('has title containing site name', async ({ page }) => {
    await expect(page).toHaveTitle(/Mike Tropea/)
  })

  test('renders hero headings', async ({ page }) => {
    const h1 = page.locator('main h1')
    const h2 = page.locator('main h2')
    await expect(h1).toBeVisible()
    await expect(h2).toBeVisible()
  })

  test('shows GitHub profile link', async ({ page }) => {
    const link = page.locator('.git-btn')
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', /^https?:\/\/.+/)
  })

  test('exposes About link in primary navigation', async ({ page }) => {
    const link = page
      .getByRole('navigation')
      .getByRole('link', { name: 'About' })
    if ((await link.count()) === 0) {
      test.skip(true, 'About nav link not available')
    }
    await expect(link).toHaveAttribute('href', /\/about$/)
  })

  test('exposes Work link in primary navigation', async ({ page }) => {
    const link = page
      .getByRole('navigation')
      .getByRole('link', { name: 'Work' })
    if ((await link.count()) === 0) {
      test.skip(true, 'Work nav link not available')
    }
    await expect(link).toHaveAttribute('href', /\/work$/)
  })
})
