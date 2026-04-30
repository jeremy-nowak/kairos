'use client'

import { useEffect, useRef, useState, ChangeEvent, FormEvent } from 'react'
import Image from 'next/image'
import type { ShoppingItem, CatalogItem } from '@/lib/shopping'

interface Props {
  username: string
}

const fieldClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 text-base placeholder:text-gray-400'

export function ShoppingList({ username }: Props) {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<CatalogItem[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({ store: '', product: '', quantity: '1' })

  useEffect(() => {
    Promise.all([
      fetch('/api/shopping').then((r) => r.json()),
      fetch('/api/shopping/catalog').then((r) => r.json()),
    ]).then(([items, catalog]) => {
      setItems(Array.isArray(items) ? items : [])
      setCatalog(Array.isArray(catalog) ? catalog : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    if (name === 'product') {
      if (value.length >= 1) {
        const matches = catalog.filter((c) =>
          c.product.toLowerCase().includes(value.toLowerCase())
        )
        setSuggestions(matches.slice(0, 5))
      } else {
        setSuggestions([])
      }
    }
  }

  function applySuggestion(item: CatalogItem) {
    setForm({ product: item.product, store: item.store, quantity: item.quantity })
    setSuggestions([])
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
    else setPreview(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSuggestions([])

    const fd = new FormData()
    fd.append('store', form.store)
    fd.append('product', form.product)
    fd.append('quantity', form.quantity)
    const file = fileRef.current?.files?.[0]
    if (file) fd.append('photo', file)

    const res = await fetch('/api/shopping', { method: 'POST', body: fd })
    if (res.ok) {
      const item = await res.json() as ShoppingItem
      setItems((prev) => [...prev, item])
      // Update local catalog
      setCatalog((prev) => {
        const existing = prev.find((c) => c.product === form.product)
        if (existing) {
          return prev.map((c) => c.product === form.product
            ? { ...c, store: form.store, quantity: form.quantity, used_count: c.used_count + 1 }
            : c
          )
        }
        return [...prev, { id: item.id, product: form.product, store: form.store, quantity: form.quantity, used_count: 1 }]
      })
      setForm({ store: '', product: '', quantity: '1' })
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      setShowForm(false)
    }
    setSubmitting(false)
  }

  async function handleToggle(item: ShoppingItem) {
    const newDone = !item.done
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, done: newDone } : i))
    await fetch(`/api/shopping/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: newDone }),
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet article ?')) return
    setItems((prev) => prev.filter((i) => i.id !== id))
    await fetch(`/api/shopping/${id}`, { method: 'DELETE' })
  }

  const grouped = items.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    if (!acc[item.store]) acc[item.store] = []
    acc[item.store].push(item)
    return acc
  }, {})

  const pending = items.filter((i) => !i.done).length

  return (
    <div className="space-y-6">
      {items.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{pending} article{pending !== 1 ? 's' : ''} restant{pending !== 1 ? 's' : ''}</span>
          {pending === 0 && <span className="text-sm text-emerald-600 font-semibold">✅ Tout acheté !</span>}
        </div>
      )}

      <button
        onClick={() => { setShowForm((v) => !v); setSuggestions([]) }}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Ajouter un article
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm ring-1 ring-gray-100 p-5 space-y-3">

          {/* Product with autocomplete */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Produit *</label>
            <input
              name="product"
              value={form.product}
              onChange={handleChange}
              onBlur={() => setTimeout(() => setSuggestions([]), 150)}
              required
              className={fieldClass}
              placeholder="Lait, pain, shampoing…"
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white rounded-2xl shadow-lg ring-1 ring-gray-100 overflow-hidden max-h-48 overflow-y-auto">
                {suggestions.map((s) => (
                  <li
                    key={s.id}
                    onMouseDown={() => applySuggestion(s)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-indigo-50 cursor-pointer transition"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{s.product}</p>
                      <p className="text-xs text-gray-400">{s.store} · qté {s.quantity}</p>
                    </div>
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Magasin *</label>
            <input name="store" value={form.store} onChange={handleChange} required className={fieldClass} placeholder="Carrefour, Lidl, Amazon…" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Quantité</label>
            <input name="quantity" value={form.quantity} onChange={handleChange} className={fieldClass} placeholder="1" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Photo</label>
            <label className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 transition">
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-gray-400">{preview ? 'Photo sélectionnée' : 'Prendre / choisir une photo'}</span>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
            </label>
            {preview && (
              <div className="mt-2 relative w-20 h-20">
                <Image src={preview} alt="preview" fill className="object-cover rounded-xl" />
                <button type="button" onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = '' }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-2xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50">
              {submitting ? 'Ajout…' : 'Ajouter'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-10">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-10">Aucun article pour l&apos;instant.</p>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([store, storeItems]) => (
            <section key={store}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                🛒 {store} · {storeItems.filter((i) => !i.done).length}/{storeItems.length}
              </p>
              <ul className="space-y-2">
                {storeItems.map((item) => (
                  <li key={item.id} className={`bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-3 flex items-center gap-3 transition-opacity ${item.done ? 'opacity-50' : ''}`}>
                    <button onClick={() => handleToggle(item)} className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${item.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-indigo-400'}`}>
                      {item.done && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    {item.photo_url && (
                      <div className="relative w-12 h-12 shrink-0">
                        <Image src={item.photo_url} alt={item.product} fill className="object-cover rounded-xl" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-gray-900 text-sm ${item.done ? 'line-through' : ''}`}>{item.product}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Qté : {item.quantity} · {item.created_by}</p>
                    </div>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
