'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface NavProps {
  username: string
}

function KairosIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ki-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4338ca" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#ki-g)" />
      <path d="M9 9L23 9L16 16L23 23L9 23L16 16Z" fill="none" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8.5 9H23.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M8.5 23H23.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M10.5 10.5L21.5 10.5L16 15.3Z" fill="white" fillOpacity="0.9" />
      <path d="M13 21.5L19 21.5L16 18.8Z" fill="white" fillOpacity="0.4" />
      <circle cx="16" cy="16" r="2.1" fill="white" />
    </svg>
  )
}

function PlusIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 transition-colors ${active ? 'text-indigo-400' : 'text-white/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 transition-colors ${active ? 'text-indigo-400' : 'text-white/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 transition-colors ${active ? 'text-indigo-400' : 'text-white/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  )
}

function CartIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 transition-colors ${active ? 'text-indigo-400' : 'text-white/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

const TABS = ['/dashboard', '/calendar', '/events', '/shopping']

function setNavDirection(targetHref: string, currentPath: string) {
  const from = TABS.indexOf(currentPath)
  const to   = TABS.indexOf(targetHref)
  if (from >= 0 && to >= 0 && to < from) {
    document.documentElement.dataset.navDir = 'back'
  } else {
    delete document.documentElement.dataset.navDir
  }
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
      <header className="hidden md:block glass-nav border-b border-white/[0.06] relative z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <KairosIcon size={28} />
              <span className="font-bold text-white text-lg tracking-tight">Kairos</span>
            </div>
            <nav className="flex items-center gap-1">
              {([
                { href: '/dashboard', label: 'Créer un événement' },
                { href: '/calendar',  label: 'Calendrier' },
                { href: '/events',    label: 'Événements' },
                { href: '/shopping',  label: 'Courses' },
              ] as const).map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setNavDirection(href, pathname)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    pathname === href
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-300">{initial}</span>
              </div>
              <span className="text-sm text-white/60 font-medium">{username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-white/30 hover:text-red-400 transition px-3 py-1.5 rounded-lg hover:bg-red-500/10"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile top bar ── */}
      <header className="md:hidden glass-nav border-b border-white/[0.06] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <KairosIcon size={24} />
          <span className="font-bold text-white tracking-tight">Kairos</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white/[0.07] rounded-full px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-indigo-500/40 flex items-center justify-center">
              <span className="text-xs font-bold text-indigo-300">{initial}</span>
            </div>
            <span className="text-sm font-medium text-white/70">{username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-red-500/10 transition"
            aria-label="Déconnexion"
          >
            <svg className="w-5 h-5 text-white/30 hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-white/[0.06] safe-area-bottom">
        <div className="grid grid-cols-4 w-full py-1">
          {([
            { href: '/dashboard', icon: <PlusIcon active={pathname === '/dashboard'} />, label: 'Créer' },
            { href: '/calendar',  icon: <CalendarIcon active={pathname === '/calendar'} />, label: 'Agenda' },
            { href: '/events',    icon: <ListIcon active={pathname === '/events'} />, label: 'Liste' },
            { href: '/shopping',  icon: <CartIcon active={pathname === '/shopping'} />, label: 'Courses' },
          ] as const).map(({ href, icon, label }) => (
            <Link key={href} href={href} onClick={() => setNavDirection(href, pathname)} className="flex flex-col items-center gap-0.5 py-1 group">
              <div className={`p-2 rounded-2xl transition-all ${pathname === href ? 'bg-indigo-500/20' : 'group-active:bg-white/[0.06]'}`}>
                {icon}
              </div>
              <span className={`text-xs font-semibold transition-colors ${pathname === href ? 'text-indigo-400' : 'text-white/30'}`}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
