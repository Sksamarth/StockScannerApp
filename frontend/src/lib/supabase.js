import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xqnphexczolgckivujlq.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('Supabase key missing — check VITE_SUPABASE_PUBLISHABLE_KEY in .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
