import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { getEventLocations, deleteEventLocation } from '@/lib/db'

async function verifySession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('session')?.value
  if (!token) return false
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await verifySession(request))) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const locations = await getEventLocations()
    return NextResponse.json(locations)
  } catch {
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  if (!(await verifySession(request))) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const { location } = await request.json() as { location: string }
    if (!location) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    await deleteEventLocation(location)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
