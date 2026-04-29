import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { loginSchema } from '@/lib/validators'
import { isRateLimited, recordLoginAttempt } from '@/lib/db'
import { logger } from '@/lib/logger'

interface UserConfig {
  username: string
  password: string
}

function getUsers(): UserConfig[] {
  try {
    return JSON.parse(process.env.USERS_CONFIG ?? '[]') as UserConfig[]
  } catch {
    return []
  }
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request)

  const limited = await isRateLimited(ip)
  if (limited) {
    logger.warn('Rate limit reached', { ip })
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
      { status: 429 }
    )
  }

  const body: unknown = await request.json()
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const { username, password } = parsed.data
  const users = getUsers()
  const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase())

  if (!user) {
    await recordLoginAttempt(ip)
    return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    await recordLoginAttempt(ip)
    logger.warn('Failed login attempt', { ip, username })
    return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
  }

  const token = await new SignJWT({ username: user.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET!))

  const response = NextResponse.json({ ok: true })
  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  logger.info('User logged in', { username: user.username })
  return response
}
