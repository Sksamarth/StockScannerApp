import { useScanner } from '../context/ScannerContext'
import { useState } from 'react'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'

export default function Alerts() {
  const { alerts } = useScanner()
  const [filter, setFilter] = useState({ signal: 'ALL', search: '' })

  const filtered = alerts.filter((a) => {
    const matchSignal = filter.signal === 'ALL' || a.signal === filter.signal
    const matchSearch = a.symbol?.toLowerCase().includes(filter.search.toLowerCase())
    return matchSignal && matchSearch
  })

  return (
    <div className="p-4 md:p-6 space-y-5 main-content">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Live Alerts</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time BUY / SELL signals</p>
        </div>
        {alerts.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
            <div className="pulse-dot bg-green-400" />
            Live
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input placeholder="Search symbol..." value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="input pl-9 w-44" />
        </div>
        <div className="flex gap-2">
          {['ALL', 'BUY', 'SELL'].map((s) => (
            <button key={s} onClick={() => setFilter({ ...filter, signal: s })}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filter.signal === s
                ? s === 'BUY' ? 'text-green-400' : s === 'SELL' ? 'text-red-400' : 'text-indigo-400'
                : 'btn-ghost'}`}
              style={filter.signal === s ? {
                background: s === 'BUY' ? 'rgba(16,185,129,0.15)' : s === 'SELL' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                border: `1px solid ${s === 'BUY' ? 'rgba(16,185,129,0.3)' : s === 'SELL' ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}`
              } : {}}>
              {s}
            </button>
          ))}
        </div>
        <span className="text-gray-600 text-xs ml-auto">{filtered.length} signals</span>
      </div>

      {/* Alerts Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">📡</div>
          <p className="text-gray-500 font-medium">No alerts yet</p>
          <p className="text-gray-700 text-sm mt-1">Start the scanner to see live signals</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((a, i) => (
            <div key={i} className={a.signal === 'BUY' ? 'alert-card-buy' : 'alert-card-sell'}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-white font-bold text-lg leading-tight">{a.symbol}</div>
                  <div className="text-gray-600 text-xs mt-0.5">{a.strategy || 'EMA Strategy'}</div>
                </div>
                <span className={a.signal === 'BUY' ? 'badge-buy' : 'badge-sell'}>{a.signal}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-0.5">
                  <div className="text-gray-600 text-xs">Price</div>
                  <div className="text-white font-semibold">₹{a.price}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-gray-600 text-xs">Change</div>
                  <div className={`font-semibold flex items-center gap-1 ${a.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {a.change >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {a.change > 0 ? '+' : ''}{a.change}%
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-gray-600 text-xs">Volume</div>
                  <div className="text-gray-300">{a.volume?.toLocaleString() || '--'}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-gray-600 text-xs">Timeframe</div>
                  <div className="text-gray-300">{a.timeframe}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 flex justify-between items-center text-xs text-gray-600" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span>{a.reason || '--'}</span>
                <span>{a.time ? new Date(a.time).toLocaleTimeString() : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
