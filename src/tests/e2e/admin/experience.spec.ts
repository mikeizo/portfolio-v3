import { expect, test } from '@playwright/test'
import { expectAdminWrite, fillField, login } from '@/tests/e2e/helpers'

test.describe('admin experience page (guest)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/admin/experience')
    await expect(
      page.getByRole('heading', { name: 'Experience' })
    ).toBeVisible()
  })

  test('renders the add form and the SSR-rendered icon grid', async ({
    page
  }) => {
    // The add form starts empty.
    await expect(page.getByLabel('Icon')).toHaveValue('')
    await expect(page.getByLabel('Name')).toHaveValue('')
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible()

    // Reference link out to the icon set, opening in a new tab.
    const devicons = page.getByRole('link', { name: 'DevIcons' })
    await expect(devicons).toHaveAttribute('href', 'https://devicon.dev')
    await expect(devicons).toHaveAttribute('target', '_blank')

    // The grid is populated from the DB-backed SSR render: every card exposes
    // an Edit control, so a visible one proves the list rendered.
    await expect(
      page.getByRole('button', { name: 'Edit' }).first()
    ).toBeVisible()
  })

  test('validates the add form client-side', async ({ page }) => {
    await fillField(page, 'Icon', 'android') // missing the "devicon-" prefix
    await fillField(page, 'Name', 'ab') // shorter than 3 characters
    await page.getByRole('button', { name: 'Add' }).click()

    // valibot errors render inline under each field; the API is never reached.
    await expect(
      page.getByText('Icon class must start with "devicon-"')
    ).toBeVisible()
    await expect(page.getByText('Must be more than 3 characters')).toBeVisible()
  })

  test('forbids the guest from adding an experience', async ({ page }) => {
    await fillField(page, 'Icon', 'devicon-playwright-plain')
    await fillField(page, 'Name', 'PW Guest Test')

    // Valid input clears client validation and reaches the write API, which the
    // middleware rejects with 403 for the guest role; the failure surfaces as a
    // toast.
    await expectAdminWrite(page, {
      feed: 'experience',
      method: 'POST',
      trigger: page.getByRole('button', { name: 'Add' }),
      status: 403,
      toast: ['Add failed', 'Forbidden']
    })
  })
})
