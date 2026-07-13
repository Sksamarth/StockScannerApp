import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xqnphexczolgckivujlq.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
export const isSupabaseReady = true
