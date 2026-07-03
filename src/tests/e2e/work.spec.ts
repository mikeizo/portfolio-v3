import { expect, type Locator, type Page, test } from '@playwright/test'

const openModal = async (page: Page): Promise<Locator> => {
  const item = page.locator('.work__list-item').first()
  if ((await item.count()) === 0) {
    test.skip(true, 'No items available')
  }

  const modal = page.locator('.modal').first()
  await expect(async () => {
    await item.click()
    await expect(modal).toBeVisible()
  }).toPass()
  return modal
}

const getSlideshowOrSkip = async (
  page: Page,
  minSlides = 1
): Promise<Locator> => {
  const slideshow = page.locator('.slideshow')
  const dotCount = await slideshow.locator('.slideshow__dot').count()
  if ((await slideshow.count()) === 0 || dotCount < minSlides) {
    test.skip(true, `slideshow with ${minSlides}+ slides not present`)
  }
  return slideshow
}

test.describe('work page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/work')
  })

  test('has title containing Work', async ({ page }) => {
    await expect(page).toHaveTitle(/Work/)
  })

  test('opens and closes work detail modal', async ({ page }) => {
    const modal = await openModal(page)
    await modal.getByRole('button', { name: 'Close' }).click()
    await expect(modal).toBeHidden()
  })

  test('closes modal via overlay click', async ({ page }) => {
    const modal = await openModal(page)
    await modal.locator('.modal__overlay').click({ position: { x: 5, y: 5 } })
    await expect(modal).toBeHidden()
  })

  test('work detail links open in a new tab', async ({ page }) => {
    await openModal(page)

    const links = page.locator('.work-item__links a')
    const count = await links.count()
    if (count === 0) {
      test.skip(true, 'no external links present')
    }

    for (let i = 0; i < count; i++) {
      const link = links.nth(i)
      await expect(link).toHaveAttribute('href', /^https?:\/\/.+/)
      await expect(link).toHaveAttribute('target', '_blank')
    }
  })

  test('slideshow next/prev advances the active slide', async ({ page }) => {
    await openModal(page)

    const slideshow = await getSlideshowOrSkip(page, 2)

    const activeDot = slideshow.locator('.slideshow__dot--active')
    await expect(activeDot).toHaveAttribute('aria-label', 'Go to slide 1')

    await slideshow.getByRole('button', { name: 'Next image' }).click()
    await expect(activeDot).toHaveAttribute('aria-label', 'Go to slide 2')

    await slideshow.getByRole('button', { name: 'Previous image' }).click()
    await expect(activeDot).toHaveAttribute('aria-label', 'Go to slide 1')
  })

  test('slideshow dot click jumps to that slide', async ({ page }) => {
    await openModal(page)

    const slideshow = await getSlideshowOrSkip(page, 3)

    await slideshow.getByRole('tab', { name: 'Go to slide 3' }).click()

    const activeDot = slideshow.locator('.slideshow__dot--active')
    await expect(activeDot).toHaveAttribute('aria-label', 'Go to slide 3')
  })
})
