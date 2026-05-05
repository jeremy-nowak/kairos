'use client'

import { useState, useRef } from 'react'

type Status = 'loading' | 'loaded' | 'empty'

export function SchedulePhoto() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>('loading')
  const [imgKey, setImgKey] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleOpen() {
    setOpen(true)
    setStatus('loading')
    setError('')
  }

  function handleClose() {
    setOpen(false)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const form = new FormData()
    form.append('photo', file)

    try {
      const res = await fetch('/api/schedule-photo', { method: 'POST', body: form })
      const data = await res.json() as { ok?: boolean; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Une erreur est survenue')
      } else {
        setStatus('loading')
        setImgKey((k) => k + 1)
      }
    } catch {
      setError('Impossible de contacter le serveur')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition shrink-0"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6M3 21h18M3 10l9-7 9 7" />
        </svg>
        Mon planning
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={handleClose}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Planning professionnel</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition disabled:opacity-50"
                >
                  {uploading ? 'Upload…' : status === 'loaded' ? 'Remplacer' : 'Ajouter une photo'}
                </button>
                <button onClick={handleClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">⚠️ {error}</p>
              )}

              {/* L'image est proxiée par /api/schedule-photo — pas d'URL signée éphémère côté client */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={imgKey}
                src="/api/schedule-photo"
                alt="Planning professionnel"
                onLoad={() => setStatus('loaded')}
                onError={() => setStatus('empty')}
                className={`w-full rounded-2xl object-contain max-h-[60vh] ${status === 'loaded' ? 'block' : 'hidden'}`}
              />

              {status === 'loading' && (
                <div className="flex items-center justify-center py-20">
                  <svg className="animate-spin h-7 w-7 text-indigo-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}

              {status === 'empty' && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition text-gray-400 hover:text-indigo-500"
                >
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-sm font-medium">Déposer une photo de planning</span>
                  <span className="text-xs">JPG, PNG, HEIC — max 10 Mo</span>
                </button>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}
    </>
  )
}
