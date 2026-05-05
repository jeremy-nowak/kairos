import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { EventForm } from './EventForm'
import { SchedulePhoto } from './SchedulePhoto'

async function getUsername(): Promise<string> {
  const cookieStore = cookies()
  const token = cookieStore.get('session')?.value
  if (!token) redirect('/')

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    )
    return payload.username as string
  } catch {
    redirect('/')
  }
}

export default async function DashboardPage() {
  const username = await getUsername()

  return (
    <div className="relative min-h-screen">
      <Nav username={username} />

      <main className="relative z-10 max-w-lg mx-auto px-4 pt-6 pb-28 md:pb-10">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">Nouvel événement</h2>
            <p className="text-sm text-white/40 mt-1">Ajouté au calendrier partagé</p>
          </div>
          <SchedulePhoto />
        </div>
        <div className="glass rounded-3xl shadow-2xl shadow-black/30 p-5">
          <EventForm username={username} />
        </div>
      </main>
    </div>
  )
}
