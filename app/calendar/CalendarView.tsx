'use client'

import { useState } from 'react'
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

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  })
}

interface EventModalProps {
  event: Event
  onClose: () => void
  onDelete: (id: string) => void
}

function EventModal({ event, onClose, onDelete }: EventModalProps) {
  const [deleting, setDeleting] = useState(false)
  const colors = getUserColor(event.created_by)

  async function handleDelete() {
    if (!confirm('Supprimer cet événement ?')) return
    setDeleting(true)
    const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' })
    if (res.ok) {
      onDelete(event.id)
      onClose()
    }
    setDeleting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">{event.title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition shrink-0">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-700 capitalize">{formatDate(event.date)}</span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-700">{fmt(event.start_time)} – {fmt(event.end_time)}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-gray-700">{event.location}</span>
            </div>
          )}

          {event.description && (
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h8" />
              </svg>
              <span className="text-sm text-gray-700">{event.description}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full shrink-0 ${colors.dot}`} />
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
              {event.created_by}
            </span>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition disabled:opacity-40"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {deleting ? 'Suppression…' : 'Supprimer'}
        </button>
      </div>
    </div>
  )
}


export function CalendarView({ events: initialEvents }: CalendarViewProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const fcEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: `${event.date}T${event.start_time}`,
    end: `${event.date}T${event.end_time}`,
    color: getUserColor(event.created_by).fc,
    extendedProps: { raw: event },
  }))

  return (
    <>
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDelete}
        />
      )}

      <div className="bg-white rounded-3xl shadow-sm ring-1 ring-gray-100 p-3 md:p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="fr"
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: 'today',
          }}
          buttonText={{
            today: "Auj.",
            month: 'Mois',
            week: 'Sem.',
            day: 'Jour',
          }}
          events={fcEvents}
          height="auto"
          eventDisplay="block"
          eventClick={(info) => {
            setSelectedEvent(info.event.extendedProps.raw as Event)
          }}
          eventContent={(arg) => (
            <div className="px-1 py-0.5 text-xs truncate font-medium cursor-pointer">
              {arg.event.title}
            </div>
          )}
        />
      </div>
    </>
  )
}
