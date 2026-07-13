import { useScanner } from '../context/ScannerContext'
import { useState } from 'react'

export default function Alerts() {
  const { alerts } = useScanner()
  const [filter, setFilter] = useState({ signal: 'ALL', search: '' })

  const filtered = alerts.filter((a) => {
    const matchSignal = filter.signal === 'ALL' || a.signal === filter.signal
    const matchSearch = a.symbol?.toLowerCase().includes(filter.search.toLowerCase())
    return matchSignal && matchSearch
  })

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Live Alerts</h1>

      <div className="flex gap-3 flex-wrap">
        <input
          placeholder="Search symbol..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm w-48 focus:outline-none focus:border-blue-500"
        />
        {['ALL', 'BUY', 'SELL'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter({ ...filter, signal: s })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter.signal === s
                ? s === 'BUY' ? 'bg-green-600 text-white' : s === 'SELL' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {s}
          </button>
        ))}
        <span className="text-gray-500 text-sm self-center">{filtered.length} alerts</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-gray-600 py-20">No alerts yet. Start the scanner to see live signals.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a, i) => (
            <div key={i} className={`bg-gray-900 border rounded-xl p-4 ${a.signal === 'BUY' ? 'border-green-800' : 'border-red-800'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-white font-bold text-lg">{a.symbol}</div>
                  <div className="text-gray-500 text-xs">{a.name}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${a.signal === 'BUY' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                  {a.signal}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Price</span><div className="text-white font-medium">₹{a.price}</div></div>
                <div><span className="text-gray-500">Change</span><div className={a.change >= 0 ? 'text-green-400' : 'text-red-400'}>{a.change}%</div></div>
                <div><span className="text-gray-500">Volume</span><div className="text-gray-300">{a.volume?.toLocaleString()}</div></div>
                <div><span className="text-gray-500">Timeframe</span><div className="text-gray-300">{a.timeframe}</div></div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between text-xs text-gray-500">
                <span>{a.strategy}</span>
                <span>{a.time ? new Date(a.time).toLocaleTimeString() : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
