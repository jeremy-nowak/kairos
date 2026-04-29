'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface NavProps {
  username: string
}

function PlusIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 transition-colors ${active ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 transition-colors ${active ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 transition-colors ${active ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  )
}

export function Nav({ username }: NavProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const initial = username[0]?.toUpperCase() ?? '?'

  return (
    <>
      {/* ── Desktop top nav ── */}
      <header className="hidden md:block bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📅</span>
              <span className="font-bold text-gray-900 text-lg">Kairos</span>
            </div>
            <nav className="flex items-center gap-1">
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  pathname === '/dashboard'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Créer un événement
              </Link>
              <Link
                href="/calendar"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  pathname === '/calendar'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Calendrier
              </Link>
              <Link
                href="/events"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  pathname === '/events'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Événements
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-700">{initial}</span>
              </div>
              <span className="text-sm text-gray-600 font-medium">{username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-500 transition px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile top bar ── */}
      <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <span className="font-bold text-gray-900">Kairos</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{initial}</span>
            </div>
            <span className="text-sm font-medium text-gray-700">{username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-red-50 transition"
            aria-label="Déconnexion"
          >
            <svg className="w-5 h-5 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-bottom">
        <div className="flex items-center justify-around px-4 py-2">
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-0.5 py-1 px-6 group"
          >
            <div className={`p-2 rounded-2xl transition-all ${pathname === '/dashboard' ? 'bg-indigo-50' : 'group-active:bg-gray-100'}`}>
              <PlusIcon active={pathname === '/dashboard'} />
            </div>
            <span className={`text-xs font-semibold transition-colors ${pathname === '/dashboard' ? 'text-indigo-600' : 'text-gray-400'}`}>
              Créer
            </span>
          </Link>

          <Link
            href="/calendar"
            className="flex flex-col items-center gap-0.5 py-1 px-4 group"
          >
            <div className={`p-2 rounded-2xl transition-all ${pathname === '/calendar' ? 'bg-indigo-50' : 'group-active:bg-gray-100'}`}>
              <CalendarIcon active={pathname === '/calendar'} />
            </div>
            <span className={`text-xs font-semibold transition-colors ${pathname === '/calendar' ? 'text-indigo-600' : 'text-gray-400'}`}>
              Agenda
            </span>
          </Link>

          <Link
            href="/events"
            className="flex flex-col items-center gap-0.5 py-1 px-4 group"
          >
            <div className={`p-2 rounded-2xl transition-all ${pathname === '/events' ? 'bg-indigo-50' : 'group-active:bg-gray-100'}`}>
              <ListIcon active={pathname === '/events'} />
            </div>
            <span className={`text-xs font-semibold transition-colors ${pathname === '/events' ? 'text-indigo-600' : 'text-gray-400'}`}>
              Liste
            </span>
          </Link>
        </div>
      </nav>
    </>
  )
}
