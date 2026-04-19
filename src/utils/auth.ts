import type { AuthUser, UserRole } from '@/types/portfolio'

import { jwtVerify, SignJWT } from 'jose'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

import { connectToDatabase } from '@/utils/mongodb'

const { AUTH_JWT_SECRET, AUTH_COOKIE_NAME } = import.meta.env

if (!AUTH_JWT_SECRET) {
  console.error('Missing AUTH_JWT_SECRET env variable')
}

export const COOKIE_NAME = AUTH_COOKIE_NAME || 'portfolio_session'
export const TOKEN_TTL_SECONDS = 604800 // 7 days
export const REFRESH_THRESHOLD_SECONDS = 60 * 60 * 24 * 2 // <2 days left → refresh

const secretKey = () => new TextEncoder().encode(AUTH_JWT_SECRET)

type UserDoc = {
  _id: mongoose.Types.ObjectId
  email: string
  passwordHash: string
  role: UserRole
}

export async function findUserByEmail(email: string) {
  await connectToDatabase()
  const Collection = mongoose.connection.collection<UserDoc>('users')

  return Collection.findOne({ email: email.toLowerCase() })
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

export async function signToken(user: AuthUser) {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS)
    .sign(secretKey())
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey())

    if (!payload.sub || !payload.email || !payload.role) return null

    return {
      user: {
        id: payload.sub as string,
        email: payload.email as string,
        role: payload.role as UserRole
      } satisfies AuthUser,
      exp: payload.exp ?? 0
    }
  } catch {
    return null
  }
}

function readCookie(request: Request, name: string) {
  const header = request.headers.get('cookie')
  if (!header) return null

  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) return decodeURIComponent(rest.join('='))
  }

  return null
}

export async function getUserFromRequest(request: Request) {
  const token = readCookie(request, COOKIE_NAME)

  if (!token) {
    return { user: null, exp: 0, token: null as string | null }
  }

  const result = await verifyToken(token)

  if (!result) {
    return { user: null, exp: 0, token: null }
  }

  return { user: result.user, exp: result.exp, token }
}

export function buildSessionCookie(token: string) {
  const isProd = import.meta.env.PROD
  const attrs = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${TOKEN_TTL_SECONDS}`
  ]

  if (isProd) {
    attrs.push('Secure')
  }

  return attrs.join('; ')
}

export function buildClearCookie() {
  const isProd = import.meta.env.PROD
  const attrs = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0'
  ]

  if (isProd) {
    attrs.push('Secure')
  }

  return attrs.join('; ')
}
