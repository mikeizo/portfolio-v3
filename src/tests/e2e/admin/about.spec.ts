import {
  editUrlRe,
  expectAdminWrite,
  login,
  openFirstRowEdit,
  openFirstRowMenu,
  selectField
} from '@/tests/e2e/helpers'
import { expect, test } from '@playwright/test'

const pageName = editUrlRe('about')

test.describe('admin about page (guest)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/admin/about')
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible()
  })

  test('row menu exposes Edit and Delete', async ({ page }) => {
    await openFirstRowMenu(page)

    const editLink = page.getByRole('link', { name: 'Edit' }).first()
    await expect(editLink).toBeVisible()
    await expect(editLink).toHaveAttribute('href', pageName)

    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible()
  })

  test('forbids the guest from deleting (403) and keeps the row', async ({ page }) => {
    const rows = page.getByRole('button', { name: 'Actions' })
    const before = await rows.count()

    await openFirstRowMenu(page)
    await page.getByRole('button', { name: 'Delete' }).click()

    // The confirm dialog opens before any request is made.
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()

    // Confirming reaches the write API, which the middleware rejects with 403
    // for the guest role; the failure surfaces as a toast.
    await expectAdminWrite(page, {
      feed: 'about',
      method: 'DELETE',
      trigger: dialog.getByRole('button', { name: 'Delete' }),
      status: 403,
      toast: ['Delete failed', 'Forbidden']
    })

    // The dialog closes and the row remains.
    await expect(dialog).toBeHidden()
    await expect(rows).toHaveCount(before)
  })

  test('edit opens the populated edit form', async ({ page }) => {
    await openFirstRowEdit(page, 'about')

    // The form is pre-filled from the DB-backed record.
    await expect(page.getByLabel('Year From')).not.toHaveValue('')
    await expect(page.getByLabel('Year To')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Bold' })).toBeVisible()

    const update = page.getByRole('button', { name: 'Update' })
    await expect(update).toBeVisible()
    await expect(update).toBeEnabled()
  })

  test('new form validates required fields client-side', async ({ page }) => {
    // Year From is a select whose only empty state is the disabled placeholder,
    // so an existing record can't be cleared — validate on the new form, where
    // it starts empty. A submit before hydration is a no-op, so retry the click
    // until the inline valibot error appears; the API is never reached.
    await page.goto('/admin/about/new')
    await expect(page.getByRole('heading', { name: 'New about entry' })).toBeVisible()

    await expect(async () => {
      await page.getByRole('button', { name: 'Add' }).click()
      await expect(page.getByText('Please enter a start year')).toBeVisible({
        timeout: 1000
      })
    }).toPass()
  })

  test('forbids the guest from saving edits (403)', async ({ page }) => {
    await openFirstRowEdit(page, 'about')

    // Edit a field (also gates hydration). The data stays valid, so submitting
    // reaches the write API, which the middleware rejects with 403 for the
    // guest role; the failure surfaces as a toast.
    await selectField(page, 'Year From', '2005')
    await expectAdminWrite(page, {
      feed: 'about',
      method: 'PATCH',
      trigger: page.getByRole('button', { name: 'Update' }),
      status: 403,
      toast: ['Save failed', 'Forbidden']
    })
  })
})
