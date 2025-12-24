// NOTE: This must remain 'false' for dynamic endpoints.
export const prerender = false

import type { APIRoute } from 'astro'
import type { ContactType } from '@/types/portfolio'

import { getDataFeed } from '@/utils/apiFeed'
import sanitizeHtml from 'sanitize-html'
import { validateForm } from '@/utils/validation'

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
  const { isValidForm } = validateForm(data)

  if (isValidForm) {
    const sendResponse = await sendMessage(data)

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

  return new Response(
    JSON.stringify({ message: 'Unable to send email. Invalid form.' }),
    { status: 400 }
  )
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
  const [settings] = await getDataFeed('settings')
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
