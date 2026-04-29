import { supabase } from './supabase'

export interface Event {
  id: string
  title: string
  date: string
  start_time: string
  end_time: string
  description: string | null
  location: string | null
  created_by: string
  created_at: string
}

export interface CreateEventInput {
  title: string
  date: string
  startTime: string
  endTime: string
  description?: string
  location?: string
  createdBy: string
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: input.title,
      date: input.date,
      start_time: input.startTime,
      end_time: input.endTime,
      description: input.description ?? null,
      location: input.location ?? null,
      created_by: input.createdBy,
    })
    .select()
    .single()

  if (error) throw error
  return data as Event
}

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) throw error
  return (data ?? []) as Event[]
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

// Rate limiting helpers

const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export async function isRateLimited(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
  const { count, error } = await supabase
    .from('login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', since)

  if (error) return false
  return (count ?? 0) >= RATE_LIMIT_MAX
}

export async function recordLoginAttempt(ip: string): Promise<void> {
  await supabase.from('login_attempts').insert({ ip })
}
