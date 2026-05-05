import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { deleteEvent, updateEvent, upsertEventLocation } from '@/lib/db'

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  if (!(await verifySession(request))) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const body = await request.json() as Record<string, unknown>
    let assignedTo: string | null | undefined = undefined
    if ('assignedTo' in body) {
      if (Array.isArray(body.assignedTo)) {
        const valid = (body.assignedTo as unknown[]).filter(v => v === 'jeremy' || v === 'tatiana') as string[]
        assignedTo = valid.length > 0 ? valid.join(',') : null
      } else {
        assignedTo = null
      }
    }
    const [event] = await Promise.all([
      updateEvent(params.id, {
        title: typeof body.title === 'string' ? body.title : undefined,
        date: typeof body.date === 'string' ? body.date : undefined,
        startTime: typeof body.startTime === 'string' ? body.startTime : undefined,
        endTime: typeof body.endTime === 'string' ? body.endTime : undefined,
        description: typeof body.description === 'string' ? body.description : undefined,
        location: typeof body.location === 'string' ? body.location : undefined,
        assignedTo,
      }),
      typeof body.location === 'string' && body.location ? upsertEventLocation(body.location) : Promise.resolve(),
    ])
    return NextResponse.json(event)
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
    await deleteEvent(params.id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
