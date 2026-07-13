import { useScanner } from '../context/ScannerContext'
import { useAuth } from '../context/AuthContext'
import { Activity, TrendingUp, Clock, BarChart2, Wifi, WifiOff } from 'lucide-react'

const MARKET_CATEGORIES = [
  'Nifty 50', 'Nifty Next 50', 'Nifty 100', 'Nifty 200', 'Nifty 500',
  'Bank Nifty', 'Large Cap', 'Mid Cap', 'Small Cap', 'All NSE', 'Sensex', 'BSE Stocks'
]
const TIMEFRAMES = ['5min', '15min', '30min', '1day']
const INTERVALS = [
  { label: '30 sec', value: 30 }, { label: '1 min', value: 60 },
  { label: '2 min', value: 120 }, { label: '5 min', value: 300 },
  { label: '10 min', value: 600 }
]

import { useState } from 'react'

export default function Dashboard() {
  const { status, stats, alerts, start, pause, resume, stop } = useScanner()
  const { upstoxSession, clearUpstoxSession } = useAuth()
  const [config, setConfig] = useState({ market: 'Nifty 50', timeframe: '15min', interval: 60, strategy: '' })

  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const isStopped = status === 'stopped'

  const marketOpen = () => {
    const now = new Date()
    const h = now.getHours(), m = now.getMinutes()
    const mins = h * 60 + m
    return mins >= 555 && mins <= 930 // 9:15 to 15:30
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm">
            Connected as: <span className="text-blue-400">{upstoxSession?.profile?.email || upstoxSession?.api_key}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full ${marketOpen() ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
            {marketOpen() ? <Wifi size={14} /> : <WifiOff size={14} />}
            Market {marketOpen() ? 'Open' : 'Closed'}
          </span>
          <button onClick={clearUpstoxSession} className="text-gray-500 hover:text-red-400 text-sm">Disconnect</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Activity, label: 'Status', value: status.toUpperCase(), color: isRunning ? 'text-green-400' : isPaused ? 'text-yellow-400' : 'text-gray-400' },
          { icon: BarChart2, label: 'Scanned', value: stats.scanned, color: 'text-blue-400' },
          { icon: TrendingUp, label: 'Matched', value: stats.matched, color: 'text-purple-400' },
          { icon: Clock, label: 'Last Scan', value: stats.lastScan ? new Date(stats.lastScan).toLocaleTimeString() : '--', color: 'text-gray-300' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Icon size={14} /> {label}
            </div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Config */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Market Category</label>
          <select
            value={config.market}
            onChange={(e) => setConfig({ ...config, market: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          >
            {MARKET_CATEGORIES.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Timeframe</label>
          <select
            value={config.timeframe}
            onChange={(e) => setConfig({ ...config, timeframe: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          >
            {TIMEFRAMES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Scan Interval</label>
          <select
            value={config.interval}
            onChange={(e) => setConfig({ ...config, interval: Number(e.target.value) })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          >
            {INTERVALS.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {isStopped && (
          <button onClick={() => start(config)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
            ▶ Start
          </button>
        )}
        {isRunning && (
          <button onClick={pause} className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium">
            ⏸ Pause
          </button>
        )}
        {isPaused && (
          <button onClick={() => resume(config)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
            ▶ Resume
          </button>
        )}
        {!isStopped && (
          <button onClick={stop} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium">
            ⏹ Stop
          </button>
        )}
      </div>

      {/* Recent Alerts Preview */}
      {alerts.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Recent Alerts</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alerts.slice(0, 10).map((a, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2">
                <div>
                  <span className="text-white font-medium">{a.symbol}</span>
                  <span className="text-gray-400 text-xs ml-2">{a.timeframe}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-300 text-sm">₹{a.price}</span>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${a.signal === 'BUY' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                    {a.signal}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
