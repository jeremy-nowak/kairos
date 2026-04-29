import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/db'
import { logger } from '@/lib/logger'

function escapeIcal(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function toIcalDateTime(date: string, time: string): string {
  // Format: YYYYMMDDTHHMMSS
  return `${date.replace(/-/g, '')}T${time.replace(/:/g, '')}00`
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.nextUrl.searchParams.get('token')

  if (!token || token !== process.env.ICAL_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const events = await getEvents()

    const vevents = events
      .map((event) => {
        const lines = [
          'BEGIN:VEVENT',
          `UID:${event.id}@eventping`,
          `DTSTAMP:${new Date(event.created_at).toISOString().replace(/[-:.]/g, '').slice(0, 15)}Z`,
          `DTSTART;TZID=Europe/Paris:${toIcalDateTime(event.date, event.start_time)}`,
          `DTEND;TZID=Europe/Paris:${toIcalDateTime(event.date, event.end_time)}`,
          `SUMMARY:${escapeIcal(event.title)}`,
        ]
        if (event.description) lines.push(`DESCRIPTION:${escapeIcal(event.description)}`)
        if (event.location) lines.push(`LOCATION:${escapeIcal(event.location)}`)
        lines.push(`X-CREATED-BY:${escapeIcal(event.created_by)}`)
        lines.push('END:VEVENT')
        return lines.join('\r\n')
      })
      .join('\r\n')

    const ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EventPing//EventPing//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:EventPing',
      'X-WR-TIMEZONE:Europe/Paris',
      vevents,
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n')

    return new NextResponse(ical, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="eventping.ics"',
        'Cache-Control': 'no-cache',
      },
    })
  } catch {
    logger.error('Failed to generate iCal feed')
    return new NextResponse('Une erreur est survenue', { status: 500 })
  }
}
