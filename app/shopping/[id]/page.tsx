import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { ItemList } from './ItemList'
import { getShoppingLists } from '@/lib/shopping'

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

export default async function ShoppingListPage({ params }: { params: { id: string } }) {
  const username = await getUsername()
  const lists = await getShoppingLists()
  const list = lists.find((l) => l.id === params.id)

  if (!list) redirect('/shopping')

  return (
    <div className="relative min-h-screen">
      <Nav username={username} />
      <main className="relative z-10 max-w-lg mx-auto px-4 pt-6 pb-28 md:pb-10">
        <div className="mb-6">
          <Link href="/shopping" className="flex items-center gap-1.5 text-sm text-indigo-400 font-medium mb-3 w-fit hover:text-indigo-300 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Mes listes
          </Link>
          <h2 className="text-2xl font-bold text-white">{list.name}</h2>
          <p className="text-sm text-white/40 mt-1">Liste de courses partagée</p>
        </div>
        <ItemList listId={params.id} listName={list.name} username={username} />
      </main>
    </div>
  )
}
