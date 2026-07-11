import type { APIContext } from 'astro'

import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchData } from '@/utils/mongodb'
import { POST } from '@/pages/api/mail'

vi.mock('@/utils/mongodb', () => ({
  fetchData: vi.fn<typeof fetchData>()
}))

const fetchDataMock = vi.mocked(fetchData)
const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<unknown>>()

vi.stubGlobal('fetch', fetchMock)

const validForm = {
  name: 'Mike Tropea',
  email: 'mike@example.com',
  phone: '',
  message: 'Hello, this is a valid message.'
}

const validSubmission = { ...validForm, recaptchaToken: 'tok' }

const makeContext = (body: unknown) =>
  ({
    request: new Request('http://localhost:3030/api/mail', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }) as unknown as APIContext

type RecaptchaOverrides = {
  tokenProperties?: Record<string, unknown>
  riskAnalysis?: Record<string, unknown>
}

// Deep-merges overrides onto the passing defaults, so a case can flip a single
// nested field (e.g. tokenProperties.valid) without restating its siblings.
const recaptchaResponse = (overrides: RecaptchaOverrides = {}) => ({
  ok: true,
  status: 200,
  json: async () => ({
    tokenProperties: { valid: true, action: 'contact_submit', ...overrides.tokenProperties },
    riskAnalysis: { score: 0.9, ...overrides.riskAnalysis }
  })
})

beforeEach(() => {
  fetchDataMock.mockReset()
  fetchMock.mockReset()
  fetchDataMock.mockResolvedValue([{ email: 'to@example.com' }])
})

afterAll(() => {
  vi.unstubAllGlobals()
})

describe('POST /api/mail', () => {
  it('returns 400 for an invalid form without calling any external service', async () => {
    const response = await POST(makeContext({ ...validSubmission, email: 'nope' }))

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 403 when the recaptcha token is missing', async () => {
    const response = await POST(makeContext(validForm))

    expect(response.status).toBe(403)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 403 when the recaptcha assessment request fails', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })

    const response = await POST(makeContext(validSubmission))

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ message: 'reCAPTCHA verification failed.' })
  })

  const rejectionCases: { label: string; overrides: RecaptchaOverrides }[] = [
    { label: 'token is invalid', overrides: { tokenProperties: { valid: false } } },
    { label: 'action mismatches', overrides: { tokenProperties: { action: 'other_action' } } },
    { label: 'score is below the threshold', overrides: { riskAnalysis: { score: 0.1 } } }
  ]

  it.each(rejectionCases)('returns 403 when the $label', async ({ overrides }) => {
    fetchMock.mockResolvedValueOnce(recaptchaResponse(overrides))

    const response = await POST(makeContext(validSubmission))

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ message: 'reCAPTCHA verification failed.' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('sends sanitized mail via Mailgun and returns 200 on success', async () => {
    fetchMock.mockResolvedValueOnce(recaptchaResponse()).mockResolvedValueOnce({ status: 200 })

    const response = await POST(
      makeContext({
        ...validSubmission,
        message: '<script>alert(1)</script> hello from a visitor'
      })
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ message: 'Success! Your message has been sent' })
    expect(fetchDataMock).toHaveBeenCalledWith('settings')

    const recaptchaBody = JSON.parse(fetchMock.mock.calls[0][1]!.body as string)

    expect(recaptchaBody.event.token).toBe('tok')
    expect(recaptchaBody.event.expectedAction).toBe('contact_submit')

    const mailgunBody = fetchMock.mock.calls[1][1]!.body as FormData

    expect(mailgunBody.get('to')).toBe('to@example.com')
    expect(mailgunBody.get('html')).not.toContain('<script>')
    expect(mailgunBody.get('html')).toContain('hello from a visitor')
  })

  it('passes the Mailgun failure status through', async () => {
    fetchMock.mockResolvedValueOnce(recaptchaResponse()).mockResolvedValueOnce({ status: 502 })

    const response = await POST(makeContext(validSubmission))

    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({ message: 'Failed to send email. Response#: 502' })
  })
})
