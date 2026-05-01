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

    const vtimezone = [
      'BEGIN:VTIMEZONE',
      'TZID:Europe/Paris',
      'BEGIN:DAYLIGHT',
      'TZOFFSETFROM:+0100',
      'TZOFFSETTO:+0200',
      'TZNAME:CEST',
      'DTSTART:19700329T020000',
      'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3',
      'END:DAYLIGHT',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:+0200',
      'TZOFFSETTO:+0100',
      'TZNAME:CET',
      'DTSTART:19701025T030000',
      'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10',
      'END:STANDARD',
      'END:VTIMEZONE',
    ].join('\r\n')

    const ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Kairos//Kairos//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Kairos',
      'X-WR-TIMEZONE:Europe/Paris',
      vtimezone,
      vevents,
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n')

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
