import {
  editUrlRe,
  expectAdminWrite,
  fillField,
  login,
  openFirstRowEdit,
  openFirstRowMenu
} from '@/tests/e2e/helpers'
import { expect, test } from '@playwright/test'

const pageName = editUrlRe('work')

test.describe('admin work page (guest)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/admin/work')
    await expect(page.getByRole('heading', { name: 'Work' })).toBeVisible()
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
      feed: 'work',
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
    await openFirstRowEdit(page, 'work')

    // The form is pre-filled from the DB-backed record.
    await expect(page.getByLabel('Name')).not.toHaveValue('')
    await expect(page.getByLabel('Weight')).toBeVisible()

    // Slug is a readonly input rendered only once a slug exists on the record;
    // it carries no associated label, so target the form's only readonly input.
    const slug = page.locator('input[readonly]')
    await expect(slug).toBeVisible()
    await expect(slug).not.toHaveValue('')

    await expect(page.getByRole('button', { name: 'Bold' })).toBeVisible()

    const update = page.getByRole('button', { name: 'Update' })
    await expect(update).toBeVisible()
    await expect(update).toBeEnabled()
  })

  test('edit form validates required fields client-side', async ({ page }) => {
    await openFirstRowEdit(page, 'work')

    // fillField retries until the value sticks, which also gates form hydration
    // so the submit handler is wired before we click. Clearing the required
    // field surfaces the inline valibot error; the API is never reached.
    await fillField(page, 'Name', '')
    await page.getByRole('button', { name: 'Update' }).click()

    await expect(page.getByText('Name is required')).toBeVisible()
  })

  test('forbids the guest from saving edits (403)', async ({ page }) => {
    await openFirstRowEdit(page, 'work')

    // Edit a field (also gates hydration). The data stays valid, so submitting
    // reaches the write API, which the middleware rejects with 403 for the
    // guest role; the failure surfaces as a toast.
    await fillField(page, 'Name', 'Test Project')
    await expectAdminWrite(page, {
      feed: 'work',
      method: 'PATCH',
      trigger: page.getByRole('button', { name: 'Update' }),
      status: 403,
      toast: ['Save failed', 'Forbidden']
    })
  })
})
