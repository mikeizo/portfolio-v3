import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ locals }) =>
  new Response(JSON.stringify({ user: locals.user }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
