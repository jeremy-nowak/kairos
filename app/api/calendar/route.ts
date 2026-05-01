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

    const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'

    const vevents = events
      .map((event) => {
        const lines = [
          'BEGIN:VEVENT',
          `UID:${event.id}@kairos`,
          `DTSTAMP:${now}`,
          `DTSTART:${toIcalDateTime(event.date, event.start_time)}`,
          `DTEND:${toIcalDateTime(event.date, event.end_time)}`,
          `SUMMARY:${escapeIcal(event.title)}`,
        ]
        if (event.description) lines.push(`DESCRIPTION:${escapeIcal(event.description)}`)
        if (event.location) lines.push(`LOCATION:${escapeIcal(event.location)}`)
        lines.push('END:VEVENT')
        return lines.join('\r\n')
      })
      .join('\r\n')

    const ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Kairos//Kairos//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Kairos',
      vevents,
      'END:VCALENDAR',
      '',
    ].join('\r\n')

    return new NextResponse(ical, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="kairos.ics"',
        'Cache-Control': 'no-cache',
      },
    })
  } catch {
    logger.error('Failed to generate iCal feed')
    return new NextResponse('Une erreur est survenue', { status: 500 })
  }
}
