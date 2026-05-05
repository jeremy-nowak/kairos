'use client'

import { useEffect, useState } from 'react'
import type { Event } from '@/lib/db'
import { EventModal } from '@/components/EventModal'

function getAccentColor(assignedTo: string | null): string | null {
  if (!assignedTo) return null
  const people = assignedTo.split(',').filter(Boolean)
  if (people.length >= 2) return '#8b5cf6'
  return people[0] === 'jeremy' ? '#6366f1' : '#f43f5e'
}

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

  if (loading) return <p className="text-white/30 text-sm text-center py-10">Chargement…</p>
  if (events.length === 0) return <p className="text-white/30 text-sm text-center py-10">Aucun événement pour l&apos;instant.</p>

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
            style={getAccentColor(event.assigned_to) ? {
              boxShadow: `inset 3px 0 0 ${getAccentColor(event.assigned_to)}, 0 4px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
            } : undefined}
            className="glass rounded-2xl p-4 cursor-pointer active:scale-[0.97] transition-all duration-150 hover:border-white/[0.14]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{event.title}</p>
                <p className="text-sm text-indigo-400 font-medium mt-0.5">{formatDate(event.date)}</p>
                <p className="text-sm text-white/40 mt-0.5">{event.start_time} – {event.end_time}</p>
                {event.location && <p className="text-sm text-white/30 mt-0.5 truncate">📍 {event.location}</p>}
                {event.description && <p className="text-sm text-white/40 mt-1 line-clamp-2">{event.description}</p>}
                {event.assigned_to && (
                  <div className="flex gap-1.5 flex-wrap mt-1.5">
                    {event.assigned_to.split(',').filter(Boolean).map((person) => (
                      <span key={person} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        person === 'jeremy' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        🎯 {person === 'jeremy' ? 'Jérémy' : 'Tatiana'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-xs text-white/20 shrink-0 mt-1">{event.created_by}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
