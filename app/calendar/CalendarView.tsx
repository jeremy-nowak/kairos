'use client'

import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { Event } from '@/lib/db'
import { EventModal } from '@/components/EventModal'

interface CalendarViewProps {
  events: Event[]
}

function getUserColor(username: string) {
  switch (username.toLowerCase()) {
    case 'tatiana': return '#f43f5e'
    case 'jeremy':  return '#6366f1'
    default:        return '#8b5cf6'
  }
}

export function CalendarView({ events: initialEvents }: CalendarViewProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  function handleUpdate(updated: Event) {
    setEvents((prev) => prev.map((e) => e.id === updated.id ? updated : e))
  }

  const fcEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: `${event.date}T${event.start_time}`,
    end: `${event.date}T${event.end_time}`,
    color: getUserColor(event.created_by),
    extendedProps: { raw: event },
  }))

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
          buttonText={{ today: 'Auj.', month: 'Mois', week: 'Sem.', day: 'Jour' }}
          events={fcEvents}
          height="auto"
          eventDisplay="block"
          eventClick={(info) => setSelectedEvent(info.event.extendedProps.raw as Event)}
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
