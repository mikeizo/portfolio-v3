import { defineMiddleware } from 'astro:middleware'

import {
  buildSessionCookie,
  getUserFromRequest,
  REFRESH_THRESHOLD_SECONDS,
  signToken
} from '@/utils/auth'

const WRITE_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

function isProtectedPath(pathname: string) {
  if (pathname.startsWith('/api/auth/')) return false
  if (pathname.startsWith('/admin')) return true
  if (pathname.startsWith('/api/admin')) return true

  return false
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url, locals, redirect } = context
  const { user, exp, token } = await getUserFromRequest(request)
  locals.user = user

  const pathname = url.pathname

  if (isProtectedPath(pathname)) {
    if (!user) {
      if (pathname.startsWith('/api/'))
        return json(401, { error: 'Unauthorized' })
      return redirect(`/login?next=${encodeURIComponent(pathname)}`, 302)
    }

    if (
      pathname.startsWith('/api/admin') &&
      WRITE_METHODS.has(request.method) &&
      user.role !== 'admin'
    ) {
      return json(403, { error: 'Forbidden' })
    }
  }

  const response = await next()

  if (user && token && exp) {
    const secondsLeft = exp - Math.floor(Date.now() / 1000)
    if (secondsLeft > 0 && secondsLeft < REFRESH_THRESHOLD_SECONDS) {
      const fresh = await signToken(user)
      response.headers.append('Set-Cookie', buildSessionCookie(fresh))
    }
  }

  return response
})
