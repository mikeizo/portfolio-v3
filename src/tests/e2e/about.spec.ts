import { expect, test } from '@playwright/test'

test.describe('about page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about')
  })

  test('has title containing About Me', async ({ page }) => {
    await expect(page).toHaveTitle(/About Me/)
  })

  test('renders timeline items', async ({ page }) => {
    await expect(page.locator('.about__list-item').first()).toBeVisible()
  })

  test('toggles accordion open and closed on click', async ({ page }) => {
    const description = page
      .locator('.about__list-description')
      .filter({ has: page.locator('.about__list-accordion') })
      .first()
    const accordion = description.locator('.about__list-accordion')

    await expect(async () => {
      await description.click()
      await expect(description).toHaveClass(/about__list-description--open/)
    }).toPass()

    const height = await accordion.evaluate((el) => (el as HTMLElement).style.height)
    expect(height).not.toBe('')
    expect(height).not.toBe('0px')

    await description.click()
    await expect(description).not.toHaveClass(/about__list-description--open/)
    await expect(accordion).toHaveAttribute('style', /height:\s*0px/)
  })
})
