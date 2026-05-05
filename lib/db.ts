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
  assigned_to: string | null
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
  assignedTo?: string | null
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
      assigned_to: input.assignedTo ?? null,
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

export async function updateEvent(id: string, input: Partial<CreateEventInput>): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .update({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.date !== undefined && { date: input.date }),
      ...(input.startTime !== undefined && { start_time: input.startTime }),
      ...(input.endTime !== undefined && { end_time: input.endTime }),
      ...(input.description !== undefined && { description: input.description ?? null }),
      ...(input.location !== undefined && { location: input.location ?? null }),
      ...(input.assignedTo !== undefined && { assigned_to: input.assignedTo ?? null }),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Event
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

// Event location catalog

export async function getEventLocations(): Promise<string[]> {
  const { data, error } = await supabase
    .from('event_locations')
    .select('location')
    .order('used_count', { ascending: false })
    .limit(50)

  if (error) throw error
  return (data ?? []).map((row: { location: string }) => row.location)
}

export async function deleteEventLocation(location: string): Promise<void> {
  const { error } = await supabase.from('event_locations').delete().eq('location', location)
  if (error) throw error
}

export async function upsertEventLocation(location: string): Promise<void> {
  if (!location.trim()) return

  const { data } = await supabase
    .from('event_locations')
    .select('id, used_count')
    .eq('location', location)
    .single()

  if (data) {
    await supabase
      .from('event_locations')
      .update({ used_count: data.used_count + 1, updated_at: new Date().toISOString() })
      .eq('id', data.id)
  } else {
    await supabase.from('event_locations').insert({ location })
  }
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
