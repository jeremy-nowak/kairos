'use client'

import { usePathname } from 'next/navigation'
import { useLayoutEffect, useRef } from 'react'

const TABS = ['/dashboard', '/calendar', '/events', '/shopping']

function tabIndex(path: string): number {
  return TABS.findIndex((t) => path === t)
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const prevPathRef = useRef<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const prev = prevPathRef.current
    prevPathRef.current = pathname
    if (!prev || prev === pathname) return

    const el = containerRef.current
    if (!el) return

    const prevIdx = tabIndex(prev)
    const currIdx = tabIndex(pathname)

    const cls =
      prevIdx >= 0 && currIdx >= 0
        ? currIdx > prevIdx
          ? 'page-from-right'
          : 'page-from-left'
        : 'page-fade'

    el.classList.remove('page-from-right', 'page-from-left', 'page-fade')
    void el.offsetHeight // force reflow pour relancer l'animation
    el.classList.add(cls)
  }, [pathname])

  return <div ref={containerRef}>{children}</div>
}
