import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { getShoppingLists, createShoppingList } from '@/lib/shopping'

async function getUsername(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('session')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
    return payload.username as string
  } catch {
    return null
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await getUsername(request))) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }
  try {
    const lists = await getShoppingLists()
    return NextResponse.json(lists)
  } catch (err) {
    return NextResponse.json({ error: JSON.stringify(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const username = await getUsername(request)
  if (!username) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  try {
    const { name, plannedDate } = await request.json() as { name: string; plannedDate?: string }
    const list = await createShoppingList(name, username, plannedDate)
    return NextResponse.json(list)
  } catch (err) {
    return NextResponse.json({ error: JSON.stringify(err) }, { status: 500 })
  }
}
