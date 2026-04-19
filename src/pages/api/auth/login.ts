import type { APIRoute } from 'astro'

import {
  buildSessionCookie,
  findUserByEmail,
  signToken,
  verifyPassword
} from '@/utils/auth'

const json = (
  status: number,
  body: Record<string, unknown>,
  extra?: HeadersInit
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...(extra || {}) }
  })

export const POST: APIRoute = async ({ request }) => {
  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return json(400, { error: 'Invalid body' })
  }

  const email = body.email?.trim().toLowerCase()
  const password = body.password

  if (!email || !password) {
    return json(400, { error: 'Email and password are required' })
  }

  const doc = await findUserByEmail(email)
  if (!doc) {
    return json(401, { error: 'Invalid credentials' })
  }

  const ok = await verifyPassword(password, doc.passwordHash)
  if (!ok) {
    return json(401, { error: 'Invalid credentials' })
  }

  const user = {
    id: doc._id.toString(),
    email: doc.email,
    role: doc.role
  }
  const token = await signToken(user)

  return json(200, { user }, { 'Set-Cookie': buildSessionCookie(token) })
}
