import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(200),
})

export const createEventSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format heure invalide'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format heure invalide'),
  description: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
  username: z.string().min(1).max(50),
})

export type LoginInput = z.infer<typeof loginSchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
