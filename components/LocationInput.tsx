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

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        name="location"
        value={value}
        onChange={handleChange}
        onBlur={() => setSuggestions([])}
        className={className}
        placeholder={placeholder}
        autoComplete="off"
      />
      {suggestions.length > 0 &&
        createPortal(
          <ul style={dropStyle} className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            {suggestions.map((loc) => (
              <li key={loc}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applySuggestion(loc)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2.5"
                >
                  <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {loc}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </>
  )
}
