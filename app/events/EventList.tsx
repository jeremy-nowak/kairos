'use client'

import { useEffect, useState } from 'react'
import type { Event } from '@/lib/db'
import { EventModal } from '@/components/EventModal'

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Europe/Paris',
  })
}

export function EventList() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => { setEvents(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  function handleUpdate(updated: Event) {
    setEvents((prev) => prev.map((e) => e.id === updated.id ? updated : e))
  }

  if (loading) return <p className="text-gray-400 text-sm text-center py-10">Chargement…</p>
  if (events.length === 0) return <p className="text-gray-400 text-sm text-center py-10">Aucun événement pour l&apos;instant.</p>

  return (
    <>
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}

      <ul className="flex flex-col gap-3 stagger">
        {events.map((event) => (
          <li
            key={event.id}
            onClick={() => setSelectedEvent(event)}
            className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 cursor-pointer active:scale-[0.97] transition-all duration-150"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{event.title}</p>
                <p className="text-sm text-indigo-600 font-medium mt-0.5">{formatDate(event.date)}</p>
                <p className="text-sm text-gray-500 mt-0.5">{event.start_time} – {event.end_time}</p>
                {event.location && <p className="text-sm text-gray-400 mt-0.5 truncate">📍 {event.location}</p>}
                {event.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>}
              </div>
              <span className="text-xs text-gray-300 shrink-0 mt-1">{event.created_by}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
