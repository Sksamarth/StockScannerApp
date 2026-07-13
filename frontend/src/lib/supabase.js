import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Supabase requires a valid JWT anon key (starts with eyJ)
// If key is missing or wrong format, app still loads — just DB calls will fail
const validKey = supabaseKey && supabaseKey.startsWith('eyJ')
  ? supabaseKey
  : null

export const supabase = validKey
  ? createClient(supabaseUrl, validKey)
  : null

export const isSupabaseReady = !!validKey
