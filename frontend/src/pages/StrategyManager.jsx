import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Trash2, Download, Upload, Copy } from 'lucide-react'

const DEFAULT_TEMPLATE = `class MyStrategy:

    def scan(stock_data):

        # ============================
        # Write your strategy below
        # ============================

        close = stock_data['close']
        volume = stock_data['volume']

        # Example: EMA Crossover
        # if ema_9 > ema_21:
        #     return {"signal": "BUY", "reason": "EMA 9 crossed above EMA 21"}

        if YOUR_CONDITION:
            return {
                "signal": "BUY",
                "reason": "Your condition matched"
            }

        return None
`

const BUILTIN_TEMPLATES = {
  'EMA Crossover': `class EMACrossover:\n    def scan(stock_data):\n        ema9 = stock_data.get('ema_9')\n        ema21 = stock_data.get('ema_21')\n        if ema9 and ema21 and ema9 > ema21:\n            return {"signal": "BUY", "reason": "EMA 9 > EMA 21"}\n        return None\n`,
  'RSI Strategy': `class RSIStrategy:\n    def scan(stock_data):\n        rsi = stock_data.get('rsi')\n        if rsi and rsi < 30:\n            return {"signal": "BUY", "reason": "RSI oversold"}\n        if rsi and rsi > 70:\n            return {"signal": "SELL", "reason": "RSI overbought"}\n        return None\n`,
  'MACD Strategy': `class MACDStrategy:\n    def scan(stock_data):\n        macd = stock_data.get('macd')\n        signal = stock_data.get('macd_signal')\n        if macd and signal and macd > signal:\n            return {"signal": "BUY", "reason": "MACD crossover"}\n        return None\n`,
  'Volume Breakout': `class VolumeBreakout:\n    def scan(stock_data):\n        vol = stock_data.get('volume', 0)\n        avg_vol = stock_data.get('avg_volume', 1)\n        if vol > avg_vol * 2:\n            return {"signal": "BUY", "reason": "Volume 2x average"}\n        return None\n`,
  'Bollinger Bands': `class BollingerBands:\n    def scan(stock_data):\n        close = stock_data.get('close')\n        bb_upper = stock_data.get('bb_upper')\n        bb_lower = stock_data.get('bb_lower')\n        if close and bb_lower and close < bb_lower:\n            return {"signal": "BUY", "reason": "Price below lower Bollinger Band"}\n        if close and bb_upper and close > bb_upper:\n            return {"signal": "SELL", "reason": "Price above upper Bollinger Band"}\n        return None\n`,
  'Supertrend': `class Supertrend:\n    def scan(stock_data):\n        close = stock_data.get('close')\n        supertrend = stock_data.get('supertrend')\n        trend = stock_data.get('supertrend_direction')\n        if trend == 1:\n            return {"signal": "BUY", "reason": "Supertrend bullish"}\n        if trend == -1:\n            return {"signal": "SELL", "reason": "Supertrend bearish"}\n        return None\n`,
  'Opening Range Breakout': `class ORB:\n    def scan(stock_data):\n        close = stock_data.get('close')\n        orb_high = stock_data.get('orb_high')\n        orb_low = stock_data.get('orb_low')\n        if close and orb_high and close > orb_high:\n            return {"signal": "BUY", "reason": "Price broke above ORB high"}\n        if close and orb_low and close < orb_low:\n            return {"signal": "SELL", "reason": "Price broke below ORB low"}\n        return None\n`,
}

export default function StrategyManager() {
  const { upstoxSession } = useAuth()
  const [strategies, setStrategies] = useState([])
  const [selected, setSelected] = useState(null)
  const [code, setCode] = useState(DEFAULT_TEMPLATE)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const apiKey = upstoxSession?.api_key

  useEffect(() => { if (apiKey) fetchStrategies() }, [apiKey])

  const fetchStrategies = async () => {
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('api_key', apiKey)
      .order('created_at', { ascending: false })

    if (error) return toast.error('Failed to load: ' + error.message)
    setStrategies(data || [])
  }

  const newStrategy = () => {
    setSelected(null)
    setName('New Strategy')
    setCode(DEFAULT_TEMPLATE)
  }

  const loadStrategy = (s) => {
    setSelected(s)
    setName(s.name)
    setCode(s.code)
  }

  const save = async () => {
    if (!name.trim()) return toast.error('Enter a strategy name')
    if (!apiKey) return toast.error('Not connected to Upstox')
    setSaving(true)
    try {
      if (selected) {
        const { error } = await supabase
          .from('strategies')
          .update({ name, code, updated_at: new Date().toISOString() })
          .eq('id', selected.id)
          .eq('api_key', apiKey)
        if (error) throw error
        toast.success('Strategy updated')
      } else {
        const { data, error } = await supabase
          .from('strategies')
          .insert({ name, code, api_key: apiKey })
          .select()
          .single()
        if (error) throw error
        setSelected(data)
        toast.success('Strategy saved')
      }
      fetchStrategies()
    } catch (err) {
      toast.error('Save failed: ' + (err.message || 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const deleteStrategy = async (id) => {
    if (!confirm('Delete this strategy?')) return
    const { error } = await supabase
      .from('strategies')
      .delete()
      .eq('id', id)
      .eq('api_key', apiKey)
    if (error) return toast.error(error.message)
    toast.success('Deleted')
    if (selected?.id === id) newStrategy()
    fetchStrategies()
  }

  const duplicate = async (s) => {
    const { error } = await supabase
      .from('strategies')
      .insert({ name: s.name + ' (copy)', code: s.code, api_key: apiKey })
    if (error) return toast.error(error.message)
    fetchStrategies()
    toast.success('Duplicated')
  }

  const exportStrategy = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${name || 'strategy'}.py`
    a.click()
  }

  const importStrategy = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCode(ev.target.result)
      setName(file.name.replace('.py', '').replace('.json', ''))
      setSelected(null)
    }
    reader.readAsText(file)
  }

  return (
    <div className="p-6 h-full flex gap-4" style={{ height: 'calc(100vh - 48px)' }}>
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 space-y-3 overflow-y-auto">
        <button onClick={newStrategy} className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16} /> New Strategy
        </button>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
          <p className="text-gray-500 text-xs mb-2">Built-in Templates</p>
          {Object.keys(BUILTIN_TEMPLATES).map((t) => (
            <button key={t}
              onClick={() => { setCode(BUILTIN_TEMPLATES[t]); setName(t); setSelected(null) }}
              className="w-full text-left text-gray-300 hover:text-white hover:bg-gray-800 px-2 py-1.5 rounded text-sm">
              {t}
            </button>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
          <p className="text-gray-500 text-xs mb-2">My Strategies ({strategies.length})</p>
          {strategies.length === 0 && (
            <p className="text-gray-600 text-xs px-2">No strategies yet. Create one above.</p>
          )}
          {strategies.map((s) => (
            <div key={s.id}
              className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer ${selected?.id === s.id ? 'bg-blue-900' : 'hover:bg-gray-800'}`}>
              <span onClick={() => loadStrategy(s)} className="text-gray-300 text-sm truncate flex-1">{s.name}</span>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => duplicate(s)} className="text-gray-600 hover:text-blue-400 p-0.5"><Copy size={12} /></button>
                <button onClick={() => deleteStrategy(s.id)} className="text-gray-600 hover:text-red-400 p-0.5"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex items-center gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Strategy name"
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm flex-1 focus:outline-none focus:border-blue-500"
          />
          <button onClick={save} disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
            {saving ? 'Saving...' : selected ? 'Update' : 'Save'}
          </button>
          <button onClick={exportStrategy} title="Export" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg">
            <Download size={16} />
          </button>
          <label title="Import" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg cursor-pointer">
            <Upload size={16} />
            <input type="file" accept=".py,.json" onChange={importStrategy} className="hidden" />
          </label>
        </div>

        <div className="flex-1 rounded-xl overflow-hidden border border-gray-800">
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={(v) => setCode(v || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
            }}
          />
        </div>
      </div>
    </div>
  )
}
