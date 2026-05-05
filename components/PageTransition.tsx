'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    delete document.documentElement.dataset.navDir
  }, [pathname])

  return <>{children}</>
}
