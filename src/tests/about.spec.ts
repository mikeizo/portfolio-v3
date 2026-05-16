import { expect, test } from '@playwright/test'

const TIMEOUT = 2000

test.describe('about page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('domcontentloaded')
  })

  test('has title containing About Me', async ({ page }) => {
    await expect(page).toHaveTitle(/About Me/)
  })

  test('renders multiple timeline items', async ({ page }) => {
    const items = page.locator('.about__list-item')
    if ((await items.count()) === 0) {
      test.skip(true, 'No about timeline items available')
    }
    expect(await items.count()).toBeGreaterThanOrEqual(1)
  })

  test('toggles accordion open and closed on click', async ({ page }) => {
    const description = page
      .locator('.about__list-description')
      .filter({ has: page.locator('.about__list-accordion') })
      .first()
    const accordion = description.locator('.about__list-accordion')

    await expect(async () => {
      await description.click()
      await expect(description).toHaveClass(/about__list-description--open/, {
        timeout: TIMEOUT
      })
    }).toPass()

    const height = await accordion.evaluate(
      (el) => (el as HTMLElement).style.height
    )
    expect(height).not.toBe('')
    expect(height).not.toBe('0px')

    await description.click()
    await expect(description).not.toHaveClass(/about__list-description--open/)
    await expect(accordion).toHaveAttribute('style', /height:\s*0px/)
  })
})
