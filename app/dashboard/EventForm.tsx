'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { LocationInput } from '@/components/LocationInput'

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
  assignedTo: ('jeremy' | 'tatiana')[]
}

const fieldClass =
  'glass-input w-full px-4 py-3.5 rounded-2xl transition text-base'

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
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    title: '',
    date: localToday(),
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    assignedTo: [],
  })
  const [loading, setLoading] = useState(false)
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
    setError('')

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          username,
          assignedTo: form.assignedTo.length > 0 ? form.assignedTo : undefined,
        }),
      })

      if (res.ok) {
        router.push('/events')
      } else {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? 'Une erreur est survenue')
      }
    } catch {
      setError('Impossible de contacter le serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
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
        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
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
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
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
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
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
        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
          Lieu
        </label>
        <LocationInput
          value={form.location}
          onChange={(val) => setForm((prev) => ({ ...prev, location: val }))}
          className={fieldClass}
          placeholder="Adresse, Zoom, téléphone…"
        />
      </div>

      {/* Assigné à */}
      <div>
        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
          Assigné à
        </label>
        <div className="flex gap-2">
          {(['jeremy', 'tatiana'] as const).map((person) => {
            const label = person === 'jeremy' ? 'Jérémy' : 'Tatiana'
            const isSelected = form.assignedTo.includes(person)
            const colorClass = person === 'jeremy'
              ? isSelected
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-transparent text-indigo-400 border-indigo-500/30 hover:border-indigo-500/60'
              : isSelected
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-transparent text-rose-400 border-rose-500/30 hover:border-rose-500/60'
            return (
              <button
                key={person}
                type="button"
                onClick={() => setForm((prev) => {
                  const has = prev.assignedTo.includes(person)
                  return { ...prev, assignedTo: has ? prev.assignedTo.filter(p => p !== person) : [...prev.assignedTo, person] }
                })}
                className={`flex-1 py-2.5 rounded-2xl border-2 font-semibold text-sm transition-all ${colorClass}`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
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
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/40 text-base"
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
