import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { getShoppingItems, createShoppingItem, uploadShoppingPhoto, upsertCatalogItem } from '@/lib/shopping'

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
    const items = await getShoppingItems()
    return NextResponse.json(items)
  } catch {
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const username = await getUsername(request)
  if (!username) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const store = formData.get('store') as string
    const product = formData.get('product') as string
    const quantity = formData.get('quantity') as string
    const photo = formData.get('photo') as File | null

    let photo_url: string | undefined
    if (photo && photo.size > 0) {
      const ext = photo.name.split('.').pop() ?? 'jpg'
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      photo_url = await uploadShoppingPhoto(photo, filename)
    }

    const [item] = await Promise.all([
      createShoppingItem({ store, product, quantity, photo_url, createdBy: username }),
      upsertCatalogItem(product, store, quantity),
    ])

    return NextResponse.json(item)
  } catch {
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
