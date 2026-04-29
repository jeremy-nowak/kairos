import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { deleteEvent } from '@/lib/db'

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  if (!(await verifySession(request))) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    await deleteEvent(params.id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
