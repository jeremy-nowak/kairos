'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { Event } from '@/lib/db'

interface CalendarViewProps {
  events: Event[]
}

function getUserColor(username: string): { fc: string; bg: string; text: string; dot: string } {
  switch (username.toLowerCase()) {
    case 'tatiana':
      return { fc: '#f43f5e', bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' }
    case 'jeremy':
      return { fc: '#6366f1', bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' }
    default:
      return { fc: '#8b5cf6', bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500' }
  }
}

function fmt(time: string) {
  return time.substring(0, 5)
}

function relativeDay(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  if (dateStr === today) return "Aujourd'hui"
  if (dateStr === tomorrowStr) return 'Demain'

  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function MobileEventList({ events }: { events: Event[] }) {
  const today = new Date().toISOString().split('T')[0]
  const upcoming = events.filter((e) => e.date >= today)
  const past = events.filter((e) => e.date < today).reverse().slice(0, 5)

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-gray-500 font-medium">Aucun événement</p>
        <p className="text-gray-400 text-sm mt-1">Crée le premier depuis l'onglet +</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <section>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
            À venir · {upcoming.length}
          </p>
          <div className="space-y-3">
            {upcoming.map((event) => {
              const colors = getUserColor(event.created_by)
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-gray-100 flex gap-3 active:scale-[0.98] transition-transform"
                >
                  <div className={`w-1.5 rounded-full flex-shrink-0 ${colors.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900 leading-tight">{event.title}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${colors.bg} ${colors.text}`}>
                        {event.created_by}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 capitalize">{relativeDay(event.date)}</p>
                    <p className="text-sm font-semibold text-indigo-600 mt-0.5">
                      {fmt(event.start_time)} – {fmt(event.end_time)}
                    </p>
                    {event.location && (
                      <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {upcoming.length === 0 && (
        <div className="text-center py-8">
          <p className="text-4xl mb-2">✅</p>
          <p className="text-gray-500 font-medium">Rien à venir</p>
        </div>
      )}

      {past.length > 0 && (
        <section>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
            Passés
          </p>
          <div className="space-y-2">
            {past.map((event) => (
              <div key={event.id} className="bg-white/60 rounded-xl px-4 py-3 ring-1 ring-gray-100 flex items-center justify-between gap-3 opacity-60">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-600 truncate">{event.title}</p>
                  <p className="text-xs text-gray-400 capitalize">{relativeDay(event.date)}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {fmt(event.start_time)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export function CalendarView({ events }: CalendarViewProps) {
  const fcEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: `${event.date}T${event.start_time}`,
    end: `${event.date}T${event.end_time}`,
    color: getUserColor(event.created_by).fc,
    extendedProps: {
      description: event.description,
      location: event.location,
      createdBy: event.created_by,
    },
  }))

  return (
    <>
      {/* Mobile list view */}
      <div className="md:hidden">
        <MobileEventList events={events} />
      </div>

      {/* Desktop calendar grid */}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm ring-1 ring-gray-100 p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="fr"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          buttonText={{
            today: "Aujourd'hui",
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour',
          }}
          events={fcEvents}
          height="auto"
          eventDisplay="block"
          eventContent={(arg) => (
            <div className="px-1.5 py-0.5 text-xs truncate font-medium">
              <span className="opacity-80">{arg.timeText} </span>
              {arg.event.title}
            </div>
          )}
        />
      </div>
    </>
  )
}
