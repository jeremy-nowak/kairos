import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { ShoppingLists } from './ShoppingLists'

async function getUsername(): Promise<string> {
  const cookieStore = cookies()
  const token = cookieStore.get('session')?.value
  if (!token) redirect('/')
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
    return payload.username as string
  } catch {
    redirect('/')
  }
}

export default async function ShoppingPage() {
  const username = await getUsername()

  return (
    <div className="relative min-h-screen">
      <Nav username={username} />
      <main className="relative z-10 max-w-lg mx-auto px-4 pt-6 pb-28 md:pb-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Courses</h2>
          <p className="text-sm text-white/40 mt-1">Mes listes de courses</p>
        </div>
        <ShoppingLists />
      </main>
    </div>
  )
}
