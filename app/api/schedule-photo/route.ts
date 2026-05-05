import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { supabase } from '@/lib/supabase'

const BUCKET = 'schedule'
const FILE_PATH = 'planning'

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

// Proxy l'image directement — évite les URL signées éphémères côté client
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await verifySession(request))) {
    return new NextResponse(null, { status: 401 })
  }

  const { data, error } = await supabase.storage.from(BUCKET).download(FILE_PATH)

  if (error || !data) {
    return new NextResponse(null, { status: 404 })
  }

  const buffer = Buffer.from(await data.arrayBuffer())

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': data.type,
      'Cache-Control': 'private, no-cache',
    },
  })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await verifySession(request))) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('photo') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Le fichier doit être une image' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image trop volumineuse (max 10 Mo)' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(FILE_PATH, buffer, { contentType: file.type, upsert: true })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
