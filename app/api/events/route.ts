import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { createEventSchema } from '@/lib/validators'
import { createEvent, getEvents, upsertEventLocation } from '@/lib/db'
import { sendDiscordNotification } from '@/lib/discord'
import { logger } from '@/lib/logger'

async function verifySession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('session')?.value
  if (!token) return false
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await verifySession(request))) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const events = await getEvents()
    return NextResponse.json(events)
  } catch {
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await verifySession(request))) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body: unknown = await request.json()
  const parsed = createEventSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const { title, date, startTime, endTime, description, location, username, assignedTo } = parsed.data

  const displayDate = new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Paris',
  })

  try {
    const upsertOps: Promise<unknown>[] = [
      createEvent({ title, date, startTime, endTime, description, location, createdBy: username, assignedTo }),
      sendDiscordNotification({ username, title, date: displayDate, startTime, endTime, description, location, assignedTo }),
    ]
    if (location) upsertOps.push(upsertEventLocation(location))
    await Promise.all(upsertOps)

    logger.info('Event created', { title, date, username })
    return NextResponse.json({ ok: true })
  } catch {
    logger.error('Failed to create event', { title, date, username })
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
