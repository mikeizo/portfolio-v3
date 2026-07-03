import { expect, test } from '@playwright/test'
import { fillField, login } from '@/tests/e2e/helpers'

test.describe('login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('rejects invalid credentials', async ({ page }) => {
    await fillField(page, 'Email', 'user@guest.com')
    await fillField(page, 'Password', 'wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Invalid credentials')).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('logs in with valid guest credentials', async ({ page }) => {
    await login(page)
    await expect(page).toHaveURL(/\/admin\/settings/)
  })
})
