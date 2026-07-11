import type { AuthUser } from '@/types/portfolio'

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildClearCookie,
  buildSessionCookie,
  COOKIE_NAME,
  getUserFromRequest,
  signToken,
  TOKEN_TTL_SECONDS,
  verifyPassword,
  verifyToken
} from '@/utils/auth'
import { SignJWT } from 'jose'
import { TEST_JWT_SECRET } from '../fixtures'

import bcrypt from 'bcryptjs'

const user: AuthUser = {
  id: '65f000000000000000000001',
  email: 'mike@example.com',
  role: 'admin'
}

const secret = new TextEncoder().encode(TEST_JWT_SECRET)
const wrongSecret = new TextEncoder().encode('a-completely-different-secret-32-bytes!!!')

const signWith = (key: Uint8Array, claims: Record<string, unknown>, exp: number) =>
  new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setExpirationTime(exp)
    .sign(key)

const futureExp = () => Math.floor(Date.now() / 1000) + 3600

describe('signToken / verifyToken', () => {
  it('round-trips the user and expires after the 7-day TTL', async () => {
    const token = await signToken(user)
    const result = await verifyToken(token)

    expect(result?.user).toEqual(user)

    const expectedExp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS

    expect(Math.abs((result?.exp ?? 0) - expectedExp)).toBeLessThanOrEqual(5)
  })

  it('rejects a tampered token', async () => {
    const token = await signToken(user)
    const [header, payload, sig] = token.split('.')
    const forged = JSON.parse(Buffer.from(payload, 'base64url').toString())

    forged.role = 'admin'
    forged.email = 'attacker@example.com'

    const tampered = [header, Buffer.from(JSON.stringify(forged)).toString('base64url'), sig].join(
      '.'
    )

    expect(await verifyToken(tampered)).toBeNull()
  })

  it('rejects a token signed with a different secret', async () => {
    const token = await signWith(wrongSecret, { email: user.email, role: user.role }, futureExp())

    expect(await verifyToken(token)).toBeNull()
  })

  it('rejects an expired token', async () => {
    const past = Math.floor(Date.now() / 1000) - 60
    const token = await signWith(secret, { email: user.email, role: user.role }, past)

    expect(await verifyToken(token)).toBeNull()
  })

  it('rejects tokens missing required claims', async () => {
    const noEmail = await signWith(secret, { role: user.role }, futureExp())
    const noRole = await signWith(secret, { email: user.email }, futureExp())

    expect(await verifyToken(noEmail)).toBeNull()
    expect(await verifyToken(noRole)).toBeNull()
  })
})

describe('verifyPassword', () => {
  it('accepts the original password and rejects others', async () => {
    const hash = await bcrypt.hash('correct horse', 4)

    expect(await verifyPassword('correct horse', hash)).toBe(true)
    expect(await verifyPassword('wrong horse', hash)).toBe(false)
  })
})

describe('getUserFromRequest', () => {
  const request = (cookie?: string) =>
    new Request('http://localhost/admin', {
      headers: cookie ? { cookie } : {}
    })

  it('returns no user when there is no cookie header', async () => {
    expect(await getUserFromRequest(request())).toEqual({ user: null, exp: 0, token: null })
  })

  it('returns no user when only unrelated cookies are present', async () => {
    expect(await getUserFromRequest(request('theme=dark; other=1'))).toEqual({
      user: null,
      exp: 0,
      token: null
    })
  })

  it('returns the user from a valid session cookie, even among other cookies', async () => {
    const token = await signToken(user)
    const result = await getUserFromRequest(request(`theme=dark; ${COOKIE_NAME}=${token}`))

    expect(result.user).toEqual(user)
    expect(result.token).toBe(token)
    expect(result.exp).toBeGreaterThan(Math.floor(Date.now() / 1000))
  })

  it('returns no user for a garbage token', async () => {
    expect(await getUserFromRequest(request(`${COOKIE_NAME}=garbage.token.here`))).toEqual({
      user: null,
      exp: 0,
      token: null
    })
  })
})

describe('session cookies', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('builds an httpOnly session cookie with the full TTL', () => {
    const cookie = buildSessionCookie('tok123')

    expect(cookie).toContain(`${COOKIE_NAME}=tok123`)
    expect(cookie).toContain('Path=/')
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=Lax')
    expect(cookie).toContain(`Max-Age=${TOKEN_TTL_SECONDS}`)
  })

  it('builds a clearing cookie with an empty value and Max-Age=0', () => {
    const cookie = buildClearCookie()

    expect(cookie).toContain(`${COOKIE_NAME}=;`)
    expect(cookie).toContain('Max-Age=0')
  })

  it('adds Secure only in production', () => {
    expect(buildSessionCookie('tok')).not.toContain('Secure')

    vi.stubEnv('PROD', true)

    expect(buildSessionCookie('tok')).toContain('Secure')
  })
})
