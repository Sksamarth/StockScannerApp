import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Settings() {
  const { upstoxSession, saveUpstoxSession, clearUpstoxSession } = useAuth()
  const [form, setForm] = useState({
    api_key: upstoxSession?.api_key || '',
    api_secret: upstoxSession?.api_secret || '',
    access_token: upstoxSession?.access_token || '',
  })
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')

  const updateCredentials = () => {
    saveUpstoxSession({ ...upstoxSession, ...form })
    toast.success('Credentials updated')
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Upstox API */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-white font-semibold">Upstox API Credentials</h2>
        {['api_key', 'api_secret', 'access_token'].map((field) => (
          <div key={field}>
            <label className="text-gray-400 text-xs mb-1 block capitalize">{field.replace('_', ' ')}</label>
            <input
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              type={field === 'access_token' ? 'password' : 'text'}
            />
          </div>
        ))}
        <div className="flex gap-3">
          <button onClick={updateCredentials} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm">Update</button>
          <button onClick={clearUpstoxSession} className="bg-red-900 hover:bg-red-800 text-red-400 px-5 py-2 rounded-lg text-sm">Disconnect</button>
        </div>
      </div>

      {/* Theme */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-3">Appearance</h2>
        <div className="flex gap-3">
          {['dark', 'light'].map((t) => (
            <button
              key={t}
              onClick={() => { setTheme(t); localStorage.setItem('theme', t) }}
              className={`px-5 py-2 rounded-lg text-sm capitalize ${theme === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              {t} Mode
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-3">Notifications</h2>
        <button
          onClick={() => Notification.requestPermission().then(p => toast.success(`Permission: ${p}`))}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2 rounded-lg text-sm"
        >
          Enable Browser Notifications
        </button>
      </div>
    </div>
  )
}
