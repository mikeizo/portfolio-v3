import type { APIRoute } from 'astro'

import { buildClearCookie } from '@/utils/auth'

export const POST: APIRoute = async () =>
  new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': buildClearCookie()
    }
  })
