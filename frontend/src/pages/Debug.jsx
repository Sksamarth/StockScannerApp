import { useAuth } from '../context/AuthContext'
import { isSupabaseReady } from '../lib/supabase'

export default function Debug() {
  const { upstoxSession } = useAuth()
  const env = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '❌ missing',
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      ? '✅ set (' + import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY.substring(0, 20) + '...)'
      : '❌ missing',
    VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL || '❌ missing',
    supabaseReady: isSupabaseReady ? '✅ connected' : '❌ invalid key format (needs eyJ...)',
    upstoxSession: upstoxSession ? '✅ logged in as ' + upstoxSession.api_key : '❌ not logged in',
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Debug Info</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
        {Object.entries(env).map(([k, v]) => (
          <div key={k} className="flex gap-4">
            <span className="text-gray-400 text-sm w-64 flex-shrink-0">{k}</span>
            <span className="text-white text-sm font-mono">{v}</span>
          </div>
        ))}
      </div>
      <p className="text-gray-500 text-xs">
        If Supabase key shows ❌, go to Supabase → Project Settings → API → copy the <strong className="text-white">anon public</strong> key (starts with eyJ...)
      </p>
    </div>
  )
}
