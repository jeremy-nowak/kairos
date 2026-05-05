'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export function LocationInput({ value, onChange, className, placeholder }: Props) {
  const [allLocations, setAllLocations] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({})
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/events/locations')
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setAllLocations(data as string[])
      })
      .catch(() => {})
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    onChange(val)

    if (val.length >= 1) {
      const filtered = allLocations
        .filter((l) => l.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 5)
      setSuggestions(filtered)
      if (filtered.length > 0 && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        const vh = window.visualViewport?.height ?? window.innerHeight
        const spaceBelow = vh - rect.bottom
        if (spaceBelow < 200) {
          setDropStyle({ position: 'fixed', left: rect.left, width: rect.width, bottom: vh - rect.top + 6, zIndex: 60 })
        } else {
          setDropStyle({ position: 'fixed', left: rect.left, width: rect.width, top: rect.bottom + 6, zIndex: 60 })
        }
      }
    } else {
      setSuggestions([])
    }
  }

  function applySuggestion(loc: string) {
    onChange(loc)
    setSuggestions([])
  }

  async function removeLocation(loc: string) {
    setAllLocations((prev) => prev.filter((l) => l !== loc))
    setSuggestions((prev) => prev.filter((l) => l !== loc))
    await fetch('/api/events/locations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: loc }),
    })
  }

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        name="location"
        value={value}
        onChange={handleChange}
        onFocus={() => setTimeout(() => {
          if (!inputRef.current) return
          const rect = inputRef.current.getBoundingClientRect()
          const vh = window.visualViewport?.height ?? window.innerHeight
          window.scrollBy({ top: rect.top - vh * 0.22, behavior: 'smooth' })
        }, 350)}
        onBlur={() => setTimeout(() => setSuggestions([]), 150)}
        className={className}
        placeholder={placeholder}
        autoComplete="off"
      />
      {suggestions.length > 0 &&
        createPortal(
          <ul style={dropStyle} className="glass-strong rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
            {suggestions.map((loc) => (
              <li key={loc} className="flex items-center border-b border-white/[0.06] last:border-0">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applySuggestion(loc)}
                  className="flex-1 text-left px-4 py-3 text-sm text-white/80 hover:bg-white/[0.06] flex items-center gap-2.5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {loc}
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => removeLocation(loc)}
                  className="px-3 py-3 text-white/20 hover:text-red-400 transition-colors shrink-0"
                  aria-label="Supprimer cette suggestion"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </>
  )
}
