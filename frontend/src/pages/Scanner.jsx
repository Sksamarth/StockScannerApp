import { useState, useEffect } from 'react'
import api from '../lib/api'
import { useScanner } from '../context/ScannerContext'
import toast from 'react-hot-toast'

const MARKET_CATEGORIES = [
  'Nifty 50', 'Nifty Next 50', 'Nifty 100', 'Nifty 200', 'Nifty 500',
  'Bank Nifty', 'Large Cap', 'Mid Cap', 'Small Cap', 'All NSE', 'Sensex', 'BSE Stocks'
]
const TIMEFRAMES = ['5min', '15min', '30min', '1day']
const INTERVALS = [
  { label: '30 sec', value: 30 }, { label: '1 min', value: 60 },
  { label: '2 min', value: 120 }, { label: '5 min', value: 300 },
  { label: '10 min', value: 600 }, { label: 'Custom', value: 0 }
]

export default function Scanner() {
  const { status, stats, start, pause, resume, stop } = useScanner()
  const [strategies, setStrategies] = useState([])
  const [config, setConfig] = useState({ market: 'Nifty 50', timeframe: '15min', interval: 60, strategy_id: '' })
  const [customInterval, setCustomInterval] = useState(60)
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedStrategyName, setSelectedStrategyName] = useState('')

  // Load strategies and saved config on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch all strategies
        const strategiesRes = await api.get('/strategies')
        if (Array.isArray(strategiesRes.data)) {
          setStrategies(strategiesRes.data)
        } else {
          setStrategies([])
        }

        // Load saved config
        const configRes = await api.get('/scanner/config')
        if (configRes.data) {
          const savedConfig = {
            market: configRes.data.market || 'Nifty 50',
            timeframe: configRes.data.timeframe || '15min',
            interval: configRes.data.interval || 60,
            strategy_id: configRes.data.strategy_id || ''
          }
          setConfig(savedConfig)
          setCustomInterval(savedConfig.interval === 0 ? 60 : savedConfig.interval)
          
          // Find and set strategy name
          if (savedConfig.strategy_id && Array.isArray(strategiesRes.data)) {
            const selected = strategiesRes.data.find(s => s.id === savedConfig.strategy_id)
            if (selected) {
              setSelectedStrategyName(selected.name)
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
        setStrategies([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (status !== 'running') return
    const interval = config.interval || customInterval
    setCountdown(interval)
    const t = setInterval(() => setCountdown((c) => (c <= 1 ? interval : c - 1)), 1000)
    return () => clearInterval(t)
  }, [status, config.interval])

  // Save config when strategy changes
  const handleStrategyChange = async (strategyId) => {
    setConfig({ ...config, strategy_id: strategyId })
    
    // Find strategy name
    if (strategyId && Array.isArray(strategies)) {
      const selected = strategies.find(s => s.id === strategyId)
      if (selected) {
        setSelectedStrategyName(selected.name)
      }
    } else {
      setSelectedStrategyName('')
    }

    // Save to backend
    try {
      await api.post('/scanner/config', {
        market: config.market,
        timeframe: config.timeframe,
        interval: config.interval,
        strategy_id: strategyId
      })
      toast.success('Strategy saved!')
    } catch (error) {
      console.error('Error saving strategy:', error)
      toast.error('Failed to save strategy')
    }
  }

  // Save config when market changes
  const handleMarketChange = async (market) => {
    setConfig({ ...config, market })
    try {
      await api.post('/scanner/config', {
        market,
        timeframe: config.timeframe,
        interval: config.interval,
        strategy_id: config.strategy_id
      })
    } catch (error) {
      console.error('Error saving market:', error)
    }
  }

  // Save config when timeframe changes
  const handleTimeframeChange = async (timeframe) => {
    setConfig({ ...config, timeframe })
    try {
      await api.post('/scanner/config', {
        market: config.market,
        timeframe,
        interval: config.interval,
        strategy_id: config.strategy_id
      })
    } catch (error) {
      console.error('Error saving timeframe:', error)
    }
  }

  // Save config when interval changes
  const handleIntervalChange = async (interval) => {
    setConfig({ ...config, interval })
    try {
      await api.post('/scanner/config', {
        market: config.market,
        timeframe: config.timeframe,
        interval,
        strategy_id: config.strategy_id
      })
    } catch (error) {
      console.error('Error saving interval:', error)
    }
  }

  const handleStart = () => {
    if (!config.strategy_id) return toast.error('Select a strategy first')
    const interval = config.interval === 0 ? customInterval : config.interval
    start({ ...config, interval })
  }

  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const isStopped = status === 'stopped'

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white">Live Scanner</h1>
        <div className="text-gray-400">Loading configuration...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Live Scanner</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Config Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-white font-semibold">Scanner Configuration</h2>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Strategy</label>
            <div className="space-y-2">
              <select
                value={config.strategy_id}
                onChange={(e) => handleStrategyChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">-- Select Strategy --</option>
                {Array.isArray(strategies) && strategies.filter(Boolean).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {selectedStrategyName && (
                <div className="text-xs text-green-400 bg-green-900 bg-opacity-30 px-2 py-1 rounded">
                  ✓ Selected: {selectedStrategyName}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Market Category</label>
            <select
              value={config.market}
              onChange={(e) => handleMarketChange(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              {MARKET_CATEGORIES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Timeframe</label>
            <div className="flex gap-2 flex-wrap">
              {TIMEFRAMES.map((t) => (
                <button key={t} onClick={() => handleTimeframeChange(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${config.timeframe === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Scan Interval</label>
            <div className="flex gap-2 flex-wrap">
              {INTERVALS.map((i) => (
                <button key={i.value} onClick={() => handleIntervalChange(i.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${config.interval === i.value ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  {i.label}
                </button>
              ))}
            </div>
            {config.interval === 0 && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  value={customInterval}
                  onChange={(e) => setCustomInterval(Number(e.target.value))}
                  min={10}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm w-24"
                />
                <span className="text-gray-400 text-sm">seconds</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-white font-semibold">Scanner Status</h2>

          <div className="space-y-3">
            {[
              { label: 'Status', value: (status || 'STOPPED').toUpperCase(), color: isRunning ? 'text-green-400' : isPaused ? 'text-yellow-400' : 'text-gray-500' },
              { label: 'Stocks Scanned', value: stats?.scanned ?? 0 },
              { label: 'Signals Found', value: stats?.matched ?? 0 },
              { label: 'Last Scan', value: (stats?.lastScan && !isNaN(new Date(stats.lastScan).getTime())) ? new Date(stats.lastScan).toLocaleTimeString() : '--' },
              { label: 'Next Scan In', value: isRunning ? `${countdown}s` : '--' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400 text-sm">{label}</span>
                <span className={`font-medium ${color || 'text-white'}`}>{value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            {isStopped && <button onClick={handleStart} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium">▶ Start</button>}
            {isRunning && <button onClick={pause} className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg font-medium">⏸ Pause</button>}
            {isPaused && <button onClick={() => resume(config)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">▶ Resume</button>}
            {!isStopped && <button onClick={stop} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium">⏹ Stop</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
