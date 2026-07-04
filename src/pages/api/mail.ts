import type { APIRoute } from 'astro'
import type { ContactType } from '@/types/portfolio'

import { fetchData } from '@/utils/mongodb'
import { validateForm } from '@/utils/validation'

import sanitizeHtml from 'sanitize-html'

/**
 * Sends a contact form message via Mailgun API using environment credentials.
 * Constructs an HTML email containing the submitted contact details and
 * sends it to the configured recipient.
 *
 * @param data - ContactType object containing name, email, phone, and message fields.
 * @returns A Promise resolving to the HTTP status code of the API response.
 */
export const POST: APIRoute = async ({ request }) => {
  const data = await request.json()
  const { recaptchaToken, ...formData } = data
  const { isValidForm } = validateForm(formData)

  if (!isValidForm) {
    return new Response(JSON.stringify({ message: 'Unable to send email. Invalid form.' }), {
      status: 400
    })
  }

  const { valid } = await verifyRecaptcha(recaptchaToken)

  if (!valid) {
    return new Response(JSON.stringify({ message: 'reCAPTCHA verification failed.' }), {
      status: 403
    })
  }

  const sendResponse = await sendMessage(formData)

  if (sendResponse === 200) {
    return new Response(
      JSON.stringify({
        message: 'Success! Your message has been sent'
      }),
      { status: 200 }
    )
  }

  return new Response(
    JSON.stringify({
      message: `Failed to send email. Response#: ${sendResponse}`
    }),
    {
      status: sendResponse
    }
  )
}

async function verifyRecaptcha(
  token: string | undefined
): Promise<{ valid: boolean; score: number; reason?: string }> {
  if (!token) return { valid: false, score: 0, reason: 'missing token' }

  const env = import.meta.env
  const projectId = env.RECAPTCHA_PROJECT_ID
  const apiKey = env.RECAPTCHA_API_KEY
  const siteKey = env.PUBLIC_RECAPTCHA_SITE_KEY
  const threshold = 0.5
  const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      event: {
        token,
        siteKey,
        expectedAction: 'contact_submit'
      }
    })
  })

  const result = await response.json()

  if (!response.ok) {
    return {
      valid: false,
      score: 0,
      reason: `assessment HTTP ${response.status}`
    }
  }

  const tokenValid = result.tokenProperties?.valid === true
  const actionMatch = result.tokenProperties?.action === 'contact_submit'
  const score = result.riskAnalysis?.score ?? 0

  if (!tokenValid) {
    return {
      valid: false,
      score,
      reason: result.tokenProperties?.invalidReason
    }
  }
  if (!actionMatch) {
    return { valid: false, score, reason: 'action mismatch' }
  }
  if (score < threshold) {
    return { valid: false, score, reason: 'score below threshold' }
  }

  return { valid: true, score }
}

/**
 * Sends a contact form message using the provided data.
 * Formats the message as HTML and submits it to the Mailgun API
 * using credentials from environment variables.
 *
 * @param data - ContactType containing name, email, phone, and message fields
 * @returns Promise<Response> resolving to the full fetch response from Mailgun
 */
async function sendMessage(data: ContactType) {
  const [settings] = (await fetchData('settings')) ?? []
  const env = import.meta.env
  const sendTo = settings.email
  const apiUrl = env.MAILGUN_URL
  const apiKey = env.MAILGUN_KEY
  const { name, email, phone, message } = data

  const html = `
  <strong>Name:</strong> ${sanitizeHtml(name)}<br>
  <strong>Email:</strong> ${sanitizeHtml(email)}<br>
  <strong>Phone:</strong> ${sanitizeHtml(phone)}<br>
  <strong>Message:</strong> ${sanitizeHtml(message)}`

  const form = new FormData()
  form.append('from', 'no-reply@miketropea.com')
  form.append('to', sendTo)
  form.append('subject', 'Website Contact Form - MikeTropea.com')
  form.append('html', html)

  const responseCode = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`api:${apiKey}`).toString('base64')
    },
    body: form
  }).then((response) => response.status)

  return responseCode
}
