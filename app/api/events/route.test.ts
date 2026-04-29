import { POST } from './route'
import { NextRequest } from 'next/server'
import { SignJWT } from 'jose'

jest.mock('@/lib/db', () => ({
  createEvent: jest.fn().mockResolvedValue({ id: 'test-id' }),
}))

jest.mock('@/lib/discord', () => ({
  sendDiscordNotification: jest.fn().mockResolvedValue(undefined),
}))

async function makeSessionToken(): Promise<string> {
  return new SignJWT({ username: 'Alice' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET!))
}

function makeRequest(body: unknown, token?: string): NextRequest {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Cookie'] = `session=${token}`
  return new NextRequest('http://localhost/api/events', {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  })
}

const validPayload = {
  title: 'Réunion',
  date: '2025-06-15',
  startTime: '10:00',
  endTime: '11:00',
  username: 'Alice',
}

describe('POST /api/events', () => {
  it('returns 401 without session', async () => {
    const req = makeRequest(validPayload)
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('creates event with valid session and payload', async () => {
    const token = await makeSessionToken()
    const req = makeRequest(validPayload, token)
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('returns 400 with missing required fields', async () => {
    const token = await makeSessionToken()
    const req = makeRequest({ title: 'Test' }, token)
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 500 when db throws', async () => {
    const { createEvent } = jest.requireMock('@/lib/db') as { createEvent: jest.Mock }
    createEvent.mockRejectedValueOnce(new Error('DB error'))

    const token = await makeSessionToken()
    const req = makeRequest(validPayload, token)
    const res = await POST(req)
    expect(res.status).toBe(500)
    const body = await res.json() as { error: string }
    expect(body.error).toBe('Une erreur est survenue')
  })
})
