import { useState } from 'react'
import { useScanner } from '../context/ScannerContext'
import { useAuth } from '../context/AuthContext'
import { Activity, TrendingUp, Clock, BarChart2, Wifi, WifiOff, Play, Pause, Square, LogOut } from 'lucide-react'

const MARKET_CATEGORIES = ['Nifty 50','Nifty Next 50','Nifty 100','Nifty 200','Nifty 500','Bank Nifty','Large Cap','Mid Cap','Small Cap','All NSE','Sensex','BSE Stocks']
const TIMEFRAMES = ['5min','15min','30min','1day']
const INTERVALS = [{ label: '30s', value: 30 },{ label: '1m', value: 60 },{ label: '2m', value: 120 },{ label: '5m', value: 300 },{ label: '10m', value: 600 }]

export default function Dashboard() {
  const { status, stats, alerts, start, pause, resume, stop } = useScanner()
  const { upstoxSession, clearUpstoxSession } = useAuth()
  const [config, setConfig] = useState({ market: 'Nifty 50', timeframe: '15min', interval: 60 })

  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const isStopped = status === 'stopped'

  const marketOpen = () => {
    const now = new Date()
    const mins = now.getHours() * 60 + now.getMinutes()
    return mins >= 555 && mins <= 930
  }

  const profile = upstoxSession?.profile

  return (
    <div className="p-4 md:p-6 space-y-5 main-content">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">{profile?.name || profile?.email || upstoxSession?.api_key?.slice(0,12) + '...'}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${marketOpen() ? 'text-green-400' : 'text-red-400'}`}
            style={{ background: marketOpen() ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${marketOpen() ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            {marketOpen() ? <Wifi size={12} /> : <WifiOff size={12} />}
            {marketOpen() ? 'Market Open' : 'Market Closed'}
          </span>
          <button onClick={clearUpstoxSession} className="btn-ghost p-2 rounded-xl" title="Disconnect">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Scanner', value: (status || 'STOPPED').toUpperCase(), icon: Activity, color: isRunning ? '#10b981' : isPaused ? '#f59e0b' : '#6b7280', bg: isRunning ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)' },
          { label: 'Scanned', value: stats?.scanned ?? 0, icon: BarChart2, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Signals', value: stats?.matched ?? 0, icon: TrendingUp, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
          { label: 'Last Scan', value: stats?.lastScan ? new Date(stats.lastScan).toLocaleTimeString() : '--', icon: Clock, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <div className="text-xl font-bold" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Config + Controls */}
      <div className="card p-5 space-y-4">
        <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Scanner Config</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-gray-500 text-xs mb-2 block">Market</label>
            <select value={config.market} onChange={(e) => setConfig({ ...config, market: e.target.value })} className="input">
              {MARKET_CATEGORIES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-2 block">Timeframe</label>
            <div className="flex gap-2">
              {TIMEFRAMES.map((t) => (
                <button key={t} onClick={() => setConfig({ ...config, timeframe: t })}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${config.timeframe === t ? 'text-white' : 'btn-ghost'}`}
                  style={config.timeframe === t ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-2 block">Interval</label>
            <div className="flex gap-2">
              {INTERVALS.map((i) => (
                <button key={i.value} onClick={() => setConfig({ ...config, interval: i.value })}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${config.interval === i.value ? 'text-white' : 'btn-ghost'}`}
                  style={config.interval === i.value ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}>
                  {i.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 pt-2">
          {isStopped && <button onClick={() => start(config)} className="btn-success flex items-center gap-2"><Play size={15} /> Start Scanner</button>}
          {isRunning && <button onClick={pause} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}><Pause size={15} /> Pause</button>}
          {isPaused && <button onClick={() => resume(config)} className="btn-primary flex items-center gap-2"><Play size={15} /> Resume</button>}
          {!isStopped && <button onClick={stop} className="btn-danger flex items-center gap-2"><Square size={15} /> Stop</button>}
        </div>
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Recent Signals</h2>
            <span className="text-xs text-gray-500">{alerts.length} total</span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {alerts.slice(0, 15).map((a, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3">
                  <span className={a.signal === 'BUY' ? 'badge-buy' : 'badge-sell'}>{a.signal}</span>
                  <div>
                    <span className="text-white font-semibold text-sm">{a.symbol}</span>
                    <span className="text-gray-600 text-xs ml-2">{a.timeframe}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm font-medium">₹{a.price}</div>
                  <div className={`text-xs ${a.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{a.change > 0 ? '+' : ''}{a.change}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
