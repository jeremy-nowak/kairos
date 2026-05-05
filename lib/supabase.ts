import { createClient } from '@supabase/supabase-js'

// During build, env vars may be absent — use placeholders so module init doesn't throw.
// Real values must be set in Vercel environment variables for runtime to work.
export const supabase = createClient(
  process.env.SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder'
)
