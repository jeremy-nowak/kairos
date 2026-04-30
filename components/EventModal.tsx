'use client'

import { useState, ChangeEvent } from 'react'
import type { Event } from '@/lib/db'

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

function getUserColor(username: string) {
  switch (username.toLowerCase()) {
    case 'tatiana': return { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' }
    case 'jeremy':  return { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' }
    default:        return { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500' }
  }
}

function fmt(time: string) { return time.substring(0, 5) }

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Europe/Paris',
  })
}

interface Props {
  event: Event
  onClose: () => void
  onDelete: (id: string) => void
  onUpdate: (updated: Event) => void
}

const fieldClass = 'w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 text-base'

export function EventModal({ event, onClose, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: event.title,
    date: event.date,
    startTime: event.start_time.substring(0, 5),
    endTime: event.end_time.substring(0, 5),
    location: event.location ?? '',
    description: event.description ?? '',
  })

  const colors = getUserColor(event.created_by)

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    if (name === 'startTime') {
      const [h, m] = value.split(':').map(Number)
      const endTime = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      setForm((prev) => ({ ...prev, startTime: value, endTime }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/events/${event.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const updated = await res.json() as Event
      onUpdate(updated)
      onClose()
    }
    setSaving(false)
  }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 z-10 max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {editing ? 'Modifier l\'événement' : event.title}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition shrink-0">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {editing ? (
          /* ── Edit mode ── */
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Titre</label>
              <input name="title" value={form.title} onChange={handleChange} className={fieldClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className={fieldClass} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Début</label>
                <select name="startTime" value={form.startTime} onChange={handleChange} className={fieldClass}>
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Fin</label>
                <select name="endTime" value={form.endTime} onChange={handleChange} className={fieldClass}>
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Lieu</label>
              <input name="location" value={form.location} onChange={handleChange} className={fieldClass} placeholder="Adresse, Zoom…" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={2} className={`${fieldClass} resize-none`} placeholder="Notes…" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50">
                {saving ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        ) : (
          /* ── View mode ── */
          <>
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

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition disabled:opacity-40"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
