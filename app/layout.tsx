import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { PageTransition } from '@/components/PageTransition'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kairos',
  description: 'Calendrier partagé avec notifications Discord',
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen bg-[#0b0c11]`}>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}
