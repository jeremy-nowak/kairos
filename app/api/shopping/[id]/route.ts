import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { toggleShoppingItem, deleteShoppingItem } from '@/lib/shopping'

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  if (!(await verifySession(request))) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }
  try {
    const { done } = await request.json() as { done: boolean }
    await toggleShoppingItem(params.id, done)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
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
    await deleteShoppingItem(params.id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
