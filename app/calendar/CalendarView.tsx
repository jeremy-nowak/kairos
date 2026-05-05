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

function getEventColor(event: Event): string {
  if (event.assigned_to) {
    const people = event.assigned_to.split(',').filter(Boolean)
    if (people.length >= 2) return '#8b5cf6'       // les deux → violet
    if (people[0] === 'jeremy')  return '#6366f1'  // Jérémy → indigo
    if (people[0] === 'tatiana') return '#f43f5e'  // Tatiana → rose
  }
  switch (event.created_by.toLowerCase()) {
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
    color: getEventColor(event),
    extendedProps: { raw: event },
  }))

  function getAssigneeLabel(assignedTo: string | null): string | null {
    if (!assignedTo) return null
    const people = assignedTo.split(',').filter(Boolean)
    if (people.length === 0) return null
    const initials = people.map(p => p === 'jeremy' ? 'J' : 'T').join('&')
    return `🎯 ${initials}`
  }

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

      <div className="glass rounded-3xl shadow-2xl shadow-black/30 p-3 md:p-6">
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
          eventContent={(arg) => {
            const raw = arg.event.extendedProps.raw as Event
            const assigneeLabel = getAssigneeLabel(raw.assigned_to)
            return (
              <div className="px-1 py-0.5 text-xs truncate font-medium cursor-pointer flex items-center gap-1">
                {assigneeLabel && <span className="shrink-0">{assigneeLabel}</span>}
                <span className="truncate">{arg.event.title}</span>
              </div>
            )
          }}
        />
      </div>
    </>
  )
}
