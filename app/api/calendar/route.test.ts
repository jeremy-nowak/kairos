import { GET } from './route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/db', () => ({
  getEvents: jest.fn().mockResolvedValue([
    {
      id: 'abc-123',
      title: 'Test Event',
      date: '2025-06-15',
      start_time: '10:00',
      end_time: '11:00',
      description: 'A test',
      location: null,
      created_by: 'Alice',
      created_at: '2025-01-01T00:00:00Z',
    },
  ]),
}))

function makeRequest(token?: string): NextRequest {
  const url = `http://localhost/api/calendar${token ? `?token=${token}` : ''}`
  return new NextRequest(url)
}

describe('GET /api/calendar', () => {
  it('returns iCal content with valid token', async () => {
    const req = makeRequest('test-ical-secret')
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/calendar')
    const body = await res.text()
    expect(body).toContain('BEGIN:VCALENDAR')
    expect(body).toContain('Test Event')
  })

  it('returns 401 without token', async () => {
    const req = makeRequest()
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 with wrong token', async () => {
    const req = makeRequest('wrong-token')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })
})
