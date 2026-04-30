'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ShoppingList } from '@/lib/shopping'

export function ShoppingLists() {
  const router = useRouter()
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newDate, setNewDate] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [offline, setOffline] = useState(false)

  useEffect(() => {
    fetch('/api/shopping')
      .then((r) => r.json())
      .then((data) => {
        const lists = Array.isArray(data) ? data : []
        setLists(lists)
        setLoading(false)
        localStorage.setItem('kairos_shopping_lists', JSON.stringify(lists))
      })
      .catch(() => {
        const cached = localStorage.getItem('kairos_shopping_lists')
        if (cached) setLists(JSON.parse(cached))
        setOffline(true)
        setLoading(false)
      })
  }, [])

  async function handleCreate() {
    if (!newName.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/shopping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), plannedDate: newDate || undefined }),
    })
    if (res.ok) {
      const list = await res.json() as ShoppingList
      setLists((prev) => [list, ...prev])
      setNewName('')
      setNewDate('')
      setShowForm(false)
    }
    setSubmitting(false)
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Supprimer cette liste et tous ses articles ?')) return
    setLists((prev) => prev.filter((l) => l.id !== id))
    await fetch(`/api/shopping/${id}`, { method: 'DELETE' })
  }

  if (loading) return <p className="text-gray-400 text-sm text-center py-10">Chargement…</p>

  return (
    <div className="space-y-4">
      {offline && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-medium text-amber-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M8.464 15.536a5 5 0 010-7.072M5.636 18.364a9 9 0 010-12.728" />
          </svg>
          Mode hors ligne — données mises en cache
        </div>
      )}
      <button
        onClick={() => setShowForm((v) => !v)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Nouvelle liste
      </button>

      {showForm && (
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-4 space-y-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Carrefour, Lidl, Amazon…"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-indigo-500 text-gray-500"
          />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
              Annuler
            </button>
            <button
              onClick={handleCreate}
              disabled={submitting || !newName.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {submitting ? '…' : 'Créer'}
            </button>
          </div>
        </div>
      )}

      {lists.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-10">Aucune liste pour l&apos;instant.</p>
      ) : (
        <ul className="space-y-3">
          {lists.map((list) => (
            <li
              key={list.id}
              onClick={() => router.push(`/shopping/${list.id}`)}
              className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{list.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {list.planned_date
                      ? new Date(`${list.planned_date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
                      : `par ${list.created_by}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <button
                  onClick={(e) => handleDelete(list.id, e)}
                  className="p-1.5 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
