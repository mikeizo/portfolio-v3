import { expect, test } from '@playwright/test'

test.describe('layout test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('toggles theme via header button', async ({ page }) => {
    const html = page.locator('html')
    const initial = await html.getAttribute('data-theme')
    expect(initial).toMatch(/^(light|dark)$/)
    const next = initial === 'dark' ? 'light' : 'dark'

    const themeBtn = page.locator('.header__desktop .header__theme-btn')
    await expect(themeBtn).toBeVisible()

    await expect(async () => {
      await themeBtn.click()
      await expect(html).toHaveAttribute('data-theme', next)
    }).toPass()
  })

  test('opens and closes the contact modal', async ({ page }) => {
    const contactBtn = page.locator('.header__desktop button.nav__contact')
    const modal = page.locator('.modal')

    await expect(async () => {
      await contactBtn.click()
      await expect(modal).toBeVisible()
    }).toPass()

    await modal.getByRole('button', { name: 'Close' }).click()
    await expect(modal).toBeHidden()
  })
})
