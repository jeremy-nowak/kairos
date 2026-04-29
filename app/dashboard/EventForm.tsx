'use client'

import { useState, FormEvent, ChangeEvent } from 'react'

interface EventFormProps {
  username: string
}

interface FormState {
  title: string
  date: string
  startTime: string
  endTime: string
  description: string
  location: string
}

const fieldClass =
  'w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 text-base placeholder:text-gray-400'

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

function localToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addOneHour(time: string): string {
  const [h, m] = time.split(':').map(Number)
  return `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function EventForm({ username }: EventFormProps) {
  const [form, setForm] = useState<FormState>({
    title: '',
    date: localToday(),
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    if (name === 'startTime') {
      setForm((prev) => ({ ...prev, startTime: value, endTime: addOneHour(value) }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError('')

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, username }),
    })

    if (res.ok) {
      setSuccess(true)
      setForm((prev) => ({ ...prev, title: '', description: '', location: '' }))
      setTimeout(() => setSuccess(false), 4000)
    } else {
      const data = (await res.json()) as { error?: string }
      setError(data.error ?? 'Une erreur est survenue')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-4 rounded-2xl flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-semibold text-sm">Événement créé !</p>
            <p className="text-xs text-emerald-600 mt-0.5">Notification Discord envoyée</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Titre *
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className={fieldClass}
          placeholder="Réunion, anniversaire, sortie…"
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Date *
        </label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          className={fieldClass}
        />
      </div>

      {/* Time row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Début *
          </label>
          <select
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            required
            className={fieldClass}
          >
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Fin *
          </label>
          <select
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            required
            className={fieldClass}
          >
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Lieu
        </label>
        <input
          type="text"
          name="location"
          value={form.location}
          onChange={handleChange}
          className={fieldClass}
          placeholder="Adresse, Zoom, téléphone…"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className={`${fieldClass} resize-none`}
          placeholder="Notes, ordre du jour…"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 text-base"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Création en cours…
          </span>
        ) : (
          '＋ Créer l\'événement'
        )}
      </button>
    </form>
  )
}
