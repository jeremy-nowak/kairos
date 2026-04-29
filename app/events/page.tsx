import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { EventList } from './EventList'

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

export default async function EventsPage() {
  const username = await getUsername()

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav username={username} />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-28 md:pb-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Événements</h2>
          <p className="text-sm text-gray-500 mt-1">Tous les événements à venir</p>
        </div>
        <EventList />
      </main>
    </div>
  )
}
