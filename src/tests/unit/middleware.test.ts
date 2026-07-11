import type { AuthUser } from '@/types/portfolio'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { COOKIE_NAME, signToken } from '@/utils/auth'
import { SignJWT } from 'jose'
import { TEST_JWT_SECRET } from './fixtures'

vi.mock('astro:middleware', () => ({
  defineMiddleware: (fn: unknown) => fn
}))

const { onRequest } = await import('@/middleware')

type MiddlewareContext = Parameters<typeof onRequest>[0]

const admin: AuthUser = { id: '65f000000000000000000001', email: 'admin@x.com', role: 'admin' }
const guest: AuthUser = { id: '65f000000000000000000002', email: 'guest@x.com', role: 'guest' }

const secret = new TextEncoder().encode(TEST_JWT_SECRET)

const shortLivedToken = (user: AuthUser, secondsLeft: number) =>
  new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setExpirationTime(Math.floor(Date.now() / 1000) + secondsLeft)
    .sign(secret)

function makeContext(path: string, { method = 'GET', token }: { method?: string; token?: string }) {
  const request = new Request(`http://localhost:3030${path}`, {
    method,
    headers: token ? { cookie: `${COOKIE_NAME}=${token}` } : {}
  })

  return {
    request,
    url: new URL(request.url),
    locals: {} as { user: AuthUser | null },
    redirect: (location: string, status: number) =>
      new Response(null, { status, headers: { Location: location } })
  } as unknown as MiddlewareContext
}

const next = vi.fn<() => Promise<Response>>()

beforeEach(() => {
  next.mockReset()
  next.mockResolvedValue(new Response('ok'))
})

const run = (context: MiddlewareContext) => onRequest(context, next) as Promise<Response>

describe('unauthenticated requests', () => {
  it('redirects /admin pages to login with the next param', async () => {
    const response = await run(makeContext('/admin/work', {}))

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login?next=%2Fadmin%2Fwork')
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 JSON for /api/admin routes', async () => {
    const response = await run(makeContext('/api/admin/work', {}))

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('redirects when the session token is expired', async () => {
    const expired = await shortLivedToken(admin, -60)
    const response = await run(makeContext('/admin/work', { token: expired }))

    expect(response.status).toBe(302)
  })

  it('leaves public pages and /api/auth routes reachable', async () => {
    expect((await run(makeContext('/', {}))).status).toBe(200)
    expect((await run(makeContext('/api/auth/login', { method: 'POST' }))).status).toBe(200)
  })
})

describe('role gating on /api/admin writes', () => {
  it.each(['POST', 'PATCH', 'PUT', 'DELETE'])('guest %s gets 403', async (method) => {
    const token = await signToken(guest)
    const response = await run(makeContext('/api/admin/work', { method, token }))

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ error: 'Forbidden' })
    expect(next).not.toHaveBeenCalled()
  })

  it('guest GET passes through', async () => {
    const token = await signToken(guest)
    const context = makeContext('/api/admin/work', { token })
    const response = await run(context)

    expect(response.status).toBe(200)
    expect(context.locals.user).toEqual(guest)
  })

  it('admin writes pass through', async () => {
    const token = await signToken(admin)
    const response = await run(makeContext('/api/admin/work', { method: 'POST', token }))

    expect(response.status).toBe(200)
  })
})

describe('session refresh', () => {
  it('re-issues the cookie on protected paths when under 2 days remain', async () => {
    const token = await shortLivedToken(admin, 60 * 60 * 24) // 1 day left
    const response = await run(makeContext('/admin/work', { token }))

    expect(response.headers.get('Set-Cookie')).toContain(`${COOKIE_NAME}=`)
  })

  it('does not refresh a fresh token', async () => {
    const token = await signToken(admin) // full 7-day TTL
    const response = await run(makeContext('/admin/work', { token }))

    expect(response.headers.get('Set-Cookie')).toBeNull()
  })

  it('does not refresh on public paths, keeping them cacheable', async () => {
    const token = await shortLivedToken(admin, 60 * 60 * 24)
    const response = await run(makeContext('/', { token }))

    expect(response.headers.get('Set-Cookie')).toBeNull()
  })
})
