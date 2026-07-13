import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Trash2 } from 'lucide-react'

export default function AlertHistory() {
  const { upstoxSession } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ signal: 'ALL', search: '' })

  const apiKey = upstoxSession?.api_key

  useEffect(() => { if (apiKey) fetchHistory() }, [apiKey])

  const fetchHistory = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('api_key', apiKey)
      .order('created_at', { ascending: false })
      .limit(500)

    if (!error) setHistory(data || [])
    setLoading(false)
  }

  const clearHistory = async () => {
    if (!confirm('Clear all alert history?')) return
    await supabase.from('alerts').delete().eq('api_key', apiKey)
    setHistory([])
  }

  const filtered = history.filter((a) => {
    const matchSignal = filter.signal === 'ALL' || a.signal === filter.signal
    const matchSearch = a.symbol?.toLowerCase().includes(filter.search.toLowerCase())
    return matchSignal && matchSearch
  })

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Alert History</h1>
        <button onClick={clearHistory} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm bg-red-900/30 px-3 py-1.5 rounded-lg">
          <Trash2 size={14} /> Clear All
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          placeholder="Search symbol..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm w-48 focus:outline-none focus:border-blue-500"
        />
        {['ALL', 'BUY', 'SELL'].map((s) => (
          <button key={s} onClick={() => setFilter({ ...filter, signal: s })}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter.signal === s
              ? s === 'BUY' ? 'bg-green-600 text-white' : s === 'SELL' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {s}
          </button>
        ))}
        <span className="text-gray-500 text-sm self-center">{filtered.length} records</span>
      </div>

      {loading ? (
        <div className="text-center text-gray-600 py-20">Loading history...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-600 py-20">No alert history found.</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
                {['Symbol', 'Signal', 'Price', 'Timeframe', 'Reason', 'Time'].map((h) => (
                  <th key={h} className="text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{a.symbol}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${a.signal === 'BUY' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                      {a.signal}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">₹{a.price}</td>
                  <td className="px-4 py-3 text-gray-400">{a.timeframe}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{a.reason}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(a.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
