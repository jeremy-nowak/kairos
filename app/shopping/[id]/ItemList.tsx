'use client'

import React, { useEffect, useRef, useState, ChangeEvent, FormEvent } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import type { ShoppingItem, CatalogItem } from '@/lib/shopping'

interface Props {
  listId: string
  listName: string
  username: string
}

const fieldClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 text-base placeholder:text-gray-400'

export function ItemList({ listId, listName, username }: Props) {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<CatalogItem[]>([])
  const [suggestionStyle, setSuggestionStyle] = useState<React.CSSProperties>({})
  const [lightbox, setLightbox] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const productInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ product: '', quantity: '1' })

  useEffect(() => {
    Promise.all([
      fetch(`/api/shopping/${listId}`).then((r) => r.json()),
      fetch('/api/shopping/catalog').then((r) => r.json()),
    ]).then(([fetchedItems, fetchedCatalog]) => {
      const itemList = Array.isArray(fetchedItems) ? fetchedItems : []
      const catalogList = Array.isArray(fetchedCatalog) ? fetchedCatalog : []
      setItems(itemList)
      setCatalog(catalogList)
      setLoading(false)
      localStorage.setItem(`kairos_items_${listId}`, JSON.stringify(itemList))
      localStorage.setItem('kairos_catalog', JSON.stringify(catalogList))
    }).catch(() => {
      const cachedItems = localStorage.getItem(`kairos_items_${listId}`)
      const cachedCatalog = localStorage.getItem('kairos_catalog')
      if (cachedItems) setItems(JSON.parse(cachedItems))
      if (cachedCatalog) setCatalog(JSON.parse(cachedCatalog))
      setOffline(true)
      setLoading(false)
    })
  }, [listId])

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    if (name === 'product' && value.length >= 1) {
      const filtered = catalog.filter((c) => c.product.toLowerCase().includes(value.toLowerCase())).slice(0, 4)
      setSuggestions(filtered)
      if (filtered.length > 0 && productInputRef.current) {
        const rect = productInputRef.current.getBoundingClientRect()
        const vh = window.visualViewport?.height ?? window.innerHeight
        const spaceBelow = vh - rect.bottom
        if (spaceBelow < 200) {
          setSuggestionStyle({ position: 'fixed', left: rect.left, width: rect.width, bottom: vh - rect.top + 6, zIndex: 60 })
        } else {
          setSuggestionStyle({ position: 'fixed', left: rect.left, width: rect.width, top: rect.bottom + 6, zIndex: 60 })
        }
      }
    } else if (name === 'product') {
      setSuggestions([])
    }
  }

  function applySuggestion(item: CatalogItem) {
    setForm({ product: item.product, quantity: item.quantity })
    setSuggestions([])
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSuggestions([])

    const fd = new FormData()
    fd.append('product', form.product)
    fd.append('quantity', form.quantity)
    const file = fileRef.current?.files?.[0]
    if (file) fd.append('photo', file)

    const res = await fetch(`/api/shopping/${listId}`, { method: 'POST', body: fd })
    if (res.ok) {
      const item = await res.json() as ShoppingItem
      setItems((prev) => [...prev, item])
      setForm({ product: '', quantity: '1' })
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      setShowForm(false)
    }
    setSubmitting(false)
  }

  async function handleToggle(item: ShoppingItem) {
    const newDone = !item.done
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, done: newDone } : i))
    await fetch(`/api/shopping/${listId}/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: newDone }),
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet article ?')) return
    setItems((prev) => prev.filter((i) => i.id !== id))
    await fetch(`/api/shopping/${listId}/items/${id}`, { method: 'DELETE' })
  }

  const pending = items.filter((i) => !i.done).length
  const done = items.filter((i) => i.done)
  const todo = items.filter((i) => !i.done)

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
      {items.length > 0 && (
        <p className="text-sm text-gray-500">
          {pending === 0 ? '✅ Tout acheté !' : `${pending} article${pending > 1 ? 's' : ''} restant${pending > 1 ? 's' : ''}`}
        </p>
      )}

      <button
        onClick={() => { setShowForm((v) => !v); setSuggestions([]) }}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Ajouter un produit
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl ring-1 ring-gray-100 shadow-sm p-5 space-y-3 animate-slide-down">
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Produit *</label>
            <input
              ref={productInputRef}
              name="product"
              value={form.product}
              onChange={handleChange}
              onFocus={() => setTimeout(() => productInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350)}
              onBlur={() => setTimeout(() => setSuggestions([]), 150)}
              required
              className={fieldClass}
              placeholder="Lait, pain, shampoing…"
              autoComplete="off"
            />
            {suggestions.length > 0 && createPortal(
              <ul style={suggestionStyle} className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-200 overflow-hidden">
                {suggestions.map((s) => (
                  <li
                    key={s.id}
                    onMouseDown={() => applySuggestion(s)}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-indigo-50 active:bg-indigo-100 cursor-pointer transition border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{s.product}</p>
                      <p className="text-xs text-gray-400">qté habituelle : {s.quantity}</p>
                    </div>
                    <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </li>
                ))}
              </ul>,
              document.body
            )}
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

      {items.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-10">Aucun produit dans cette liste.</p>
      ) : (
        <div className="space-y-5">
          {todo.length > 0 && (
            <ul className="space-y-2 stagger">
              {todo.map((item) => (
                <li key={item.id} className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-3 flex items-center gap-3 transition-opacity duration-200 select-none">
                  <button onClick={() => handleToggle(item)} className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-indigo-400 shrink-0 transition" />
                  {item.photo_url && (
                    <button onClick={() => setLightbox(item.photo_url)} className="relative w-12 h-12 shrink-0 focus:outline-none">
                      <Image src={item.photo_url} alt={item.product} fill className="object-cover rounded-xl" />
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{item.product}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Qté : {item.quantity}</p>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {done.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-2 px-1">Achetés</p>
              <ul className="space-y-2">
                {done.map((item) => (
                  <li key={item.id} className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-3 flex items-center gap-3 opacity-50 transition-opacity duration-200 select-none">
                    <button onClick={() => handleToggle(item)} className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-emerald-500 shrink-0 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    {item.photo_url && (
                      <button onClick={() => setLightbox(item.photo_url)} className="relative w-12 h-12 shrink-0 focus:outline-none">
                        <Image src={item.photo_url} alt={item.product} fill className="object-cover rounded-xl" />
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-500 text-sm line-through">{item.product}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Qté : {item.quantity}</p>
                    </div>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {lightbox && createPortal(
        <div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <div className="relative animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox}
              alt="photo produit"
              className="block max-w-[92vw] max-h-[88vh] w-auto h-auto rounded-2xl"
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
