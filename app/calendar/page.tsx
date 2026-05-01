import { cookies, headers } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getEvents } from '@/lib/db'
import type { Event } from '@/lib/db'
import { Nav } from '@/components/Nav'

const CalendarView = dynamic(
  () => import('./CalendarView').then((m) => ({ default: m.CalendarView })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-24">
        <svg className="animate-spin h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    ),
  }
)

async function getUsername(): Promise<string> {
  const cookieStore = cookies()
  const token = cookieStore.get('session')?.value
  if (!token) redirect('/')

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    )
    return payload.username as string
  } catch {
    redirect('/')
  }
}

export default async function CalendarPage() {
  const [username, events] = await Promise.all([getUsername(), getEvents()])
  const host = headers().get('host') ?? 'moncerveau.vercel.app'
  const icalUrl = `webcal://${host}/api/calendar?token=${process.env.ICAL_SECRET}`

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav username={username} />

      <main className="max-w-6xl mx-auto px-4 pt-6 pb-28 md:pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Agenda</h2>
            <p className="text-sm text-gray-500 mt-1">{events.length} événement{events.length !== 1 ? 's' : ''}</p>
          </div>
          <a
            href={icalUrl}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            iCal
          </a>
        </div>

        <CalendarView events={events as Event[]} />
      </main>
    </div>
  )
}
