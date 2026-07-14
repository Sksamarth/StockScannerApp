import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Key, Bell, Moon, Sun, LogOut, RefreshCw } from 'lucide-react'

export default function Settings() {
  const { upstoxSession, saveUpstoxSession, clearUpstoxSession } = useAuth()
  const [form, setForm] = useState({
    api_key: upstoxSession?.api_key || '',
    api_secret: upstoxSession?.api_secret || '',
    access_token: upstoxSession?.access_token || '',
  })
  const [theme, setTheme] = useState('dark')

  const updateCredentials = () => {
    saveUpstoxSession({ ...upstoxSession, ...form })
    toast.success('Credentials updated')
  }

  const enableNotifications = () => {
    if (typeof window === 'undefined' || !('Notification' in window) || typeof Notification.requestPermission !== 'function') {
      return toast.error('Notifications are not supported in this browser.')
    }
    Notification.requestPermission()
      .then((p) => {
        if (p === 'granted') toast.success('Notifications enabled!')
        else toast.error('Permission denied')
      })
      .catch((e) => {
        toast.error('Failed to request notifications: ' + e.message)
      })
  }

  return (
    <div className="p-4 md:p-6 space-y-5 main-content max-w-2xl">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      {/* API Credentials */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <Key size={15} className="text-indigo-400" />
          </div>
          <h2 className="text-white font-semibold">Upstox API Credentials</h2>
        </div>
        {[
          { key: 'api_key', label: 'API Key', type: 'text' },
          { key: 'api_secret', label: 'API Secret', type: 'password' },
          { key: 'access_token', label: 'Access Token', type: 'password' },
        ].map(({ key, label, type }) => (
          <div key={key}>
            <label className="text-gray-500 text-xs mb-2 block uppercase tracking-wide">{label}</label>
            <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="input" />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button onClick={updateCredentials} className="btn-primary flex items-center gap-2"><RefreshCw size={14} /> Update</button>
          <button onClick={clearUpstoxSession} className="btn-danger flex items-center gap-2"><LogOut size={14} /> Disconnect</button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <Bell size={15} className="text-yellow-400" />
          </div>
          <h2 className="text-white font-semibold">Notifications</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-300 text-sm">Browser Push Notifications</p>
            <p className="text-gray-600 text-xs mt-0.5">Get alerts even when tab is in background</p>
          </div>
          <button onClick={enableNotifications} className="btn-ghost text-xs">Enable</button>
        </div>
      </div>

      {/* Theme */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
            <Moon size={15} className="text-purple-400" />
          </div>
          <h2 className="text-white font-semibold">Appearance</h2>
        </div>
        <div className="flex gap-3">
          {[{ v: 'dark', icon: Moon, label: 'Dark' }, { v: 'light', icon: Sun, label: 'Light' }].map(({ v, icon: Icon, label }) => (
            <button key={v} onClick={() => setTheme(v)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${theme === v ? 'text-indigo-400' : 'btn-ghost'}`}
              style={theme === v ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' } : {}}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* App Info */}
      <div className="card p-5">
        <h2 className="text-white font-semibold mb-3">App Info</h2>
        <div className="space-y-2 text-sm">
          {[
            ['Version', 'v1.0.0'],
            ['Platform', 'Web + Android (Capacitor)'],
            ['Database', 'Supabase (PostgreSQL)'],
            ['Broker API', 'Upstox v2'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-gray-500">{k}</span>
              <span className="text-gray-300">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
