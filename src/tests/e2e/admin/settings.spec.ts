import { expect, test } from '@playwright/test'
import { expectAdminWrite, login } from '@/tests/e2e/helpers'

test.describe('admin settings page (guest)', () => {
  test.beforeEach(async ({ page }) => {
    // Login lands on /admin/settings by default.
    await login(page)
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    // The form is a client:load island; the rich-text toolbar renders only once
    // Tiptap's editor instantiates (v-if="editor"), so a visible toolbar button
    // means the island has hydrated and the submit handler is wired (otherwise a
    // pre-hydration click triggers a native form submit and the PUT never fires).
    await expect(page.getByRole('button', { name: 'Bold' })).toBeVisible()
  })

  test('forbids the guest from saving settings', async ({ page }) => {
    // The form data is already valid, so submitting reaches the write API,
    // which the middleware rejects with 403 for the guest role. The failure
    // surfaces as a toast.
    await expectAdminWrite(page, {
      feed: 'settings',
      method: 'PUT',
      trigger: page.getByRole('button', { name: 'Update' }),
      status: 403,
      toast: ['Update failed', 'Forbidden']
    })
  })
})
