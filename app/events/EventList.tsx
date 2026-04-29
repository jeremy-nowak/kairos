'use client'

import { useEffect, useState } from 'react'
import type { Event } from '@/lib/db'

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  })
}

export function EventList() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet événement ?')) return
    setDeletingId(id)
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== id))
    }
    setDeletingId(null)
  }

  if (loading) {
    return <p className="text-gray-400 text-sm text-center py-10">Chargement…</p>
  }

  if (events.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-10">Aucun événement pour l&apos;instant.</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {events.map((event) => (
        <li key={event.id} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{event.title}</p>
              <p className="text-sm text-indigo-600 font-medium mt-0.5">{formatDate(event.date)}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {event.start_time} – {event.end_time}
              </p>
              {event.location && (
                <p className="text-sm text-gray-400 mt-0.5 truncate">📍 {event.location}</p>
              )}
              {event.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-xs text-gray-300">{event.created_by}</span>
              <button
                onClick={() => handleDelete(event.id)}
                disabled={deletingId === event.id}
                className="p-1.5 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40"
                aria-label="Supprimer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
