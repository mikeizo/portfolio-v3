import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

// Test users seeded in the dev/test database. Guest only for now; add other
// roles here (and update the union below) when a test needs them.
const credentials = {
  guest: {
    email: process.env.LOGIN_USER || '',
    password: process.env.LOGIN_PASS || ''
  }
} as const

type Role = keyof typeof credentials

type WriteMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE'

const TIMEOUT = 2000

// client:load Vue islands use controlled inputs; a fill before hydration gets
// reset, so retry until the value sticks.
export async function fillField(page: Page, label: string, value: string) {
  const field = page.getByLabel(label)
  await expect(async () => {
    await field.fill(value)
    await expect(field).toHaveValue(value)
  }).toPass()
}

// Log in through the real login form. Lands on /admin/settings by default;
// callers needing another admin page navigate on from there.
export async function login(page: Page, role: Role = 'guest') {
  const { email, password } = credentials[role]
  await page.goto('/login')

  // Already authenticated: /login redirects to /admin, so there's no form to
  // fill — the session is good, nothing to do.
  if (page.url().includes('/admin')) return

  // The login form is a client:load island; a Sign in click before hydration
  // does a native (no-redirect) submit. Retry fill + submit until the Vue
  // handler takes over and redirects to an admin page.
  await expect(async () => {
    await fillField(page, 'Email', email)
    await fillField(page, 'Password', password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/admin\//, { timeout: TIMEOUT })
  }).toPass()
}

// Fire a write at /api/admin/<feed> by clicking `trigger`, then assert the
// response status and the toast text(s) it surfaces. Works for both the
// rejected path (status 403, toast ['Save failed', 'Forbidden']) and the
// success path (status 200/201, toast 'Saved'). The response listener is
// registered before the click so the request is never missed.
export async function expectAdminWrite(
  page: Page,
  options: {
    feed: string
    method: WriteMethod
    trigger: Locator
    status: number
    toast: string | string[]
  }
) {
  const { feed, method, trigger, status, toast } = options
  const response = page.waitForResponse(
    (res) =>
      res.url().includes(`/api/admin/${feed}`) &&
      res.request().method() === method
  )
  await trigger.click()
  expect((await response).status()).toBe(status)
  for (const text of Array.isArray(toast) ? toast : [toast]) {
    await expect(page.getByText(text)).toBeVisible()
  }
}

// Matches an /admin/<feed>/<id> edit URL, where <id> is a 24-char hex Mongo
// ObjectId. Used to assert both a row's Edit link href and the landed edit URL.
export function editUrlRe(feed: string) {
  return new RegExp(`/admin/${feed}/[a-f0-9]{24}$`)
}

// Open the first row's action dropdown. The trigger is labelled "Actions" and
// there is one per row, so target the first. The list is a client:load island;
// a click before hydration is a no-op, so retry until the menu actually opens.
export async function openFirstRowMenu(page: Page) {
  const trigger = page.getByRole('button', { name: 'Actions' }).first()
  await expect(async () => {
    await trigger.click()
    await expect(page.getByRole('link', { name: 'Edit' }).first()).toBeVisible({
      timeout: 1000
    })
  }).toPass()
}

// Open the first row's menu and follow its Edit link to the <feed> edit form.
// Asserts the URL and the "Edit <feed> entry" heading, then waits for the
// rich-text toolbar (Bold): it's v-if="editor", so a visible button means the
// island has hydrated and the submit handler is wired.
export async function openFirstRowEdit(page: Page, feed: string) {
  await openFirstRowMenu(page)
  await page.getByRole('link', { name: 'Edit' }).first().click()
  await expect(page).toHaveURL(editUrlRe(feed))
  await expect(
    page.getByRole('heading', { name: `Edit ${feed} entry` })
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Bold' })).toBeVisible()
}
