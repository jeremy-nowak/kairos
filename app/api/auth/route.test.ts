import { POST } from './route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/db', () => ({
  isRateLimited: jest.fn().mockResolvedValue(false),
  recordLoginAttempt: jest.fn().mockResolvedValue(undefined),
}))

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/auth', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/auth', () => {
  it('returns 200 with valid credentials', async () => {
    const req = makeRequest({ username: 'Alice', password: 'password' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json() as { ok: boolean }
    expect(body.ok).toBe(true)
  })

  it('returns 401 with wrong password', async () => {
    const req = makeRequest({ username: 'Alice', password: 'wrong' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 with unknown user', async () => {
    const req = makeRequest({ username: 'Unknown', password: 'password' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 with missing fields', async () => {
    const req = makeRequest({ username: 'Alice' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 429 when rate limited', async () => {
    const { isRateLimited } = jest.requireMock('@/lib/db') as { isRateLimited: jest.Mock }
    isRateLimited.mockResolvedValueOnce(true)

    const req = makeRequest({ username: 'Alice', password: 'password' })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })
})
