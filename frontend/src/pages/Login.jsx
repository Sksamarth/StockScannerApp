import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Login() {
  const { saveUpstoxSession } = useAuth()
  const [form, setForm] = useState({ api_key: '', api_secret: '', access_token: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!form.api_key.trim()) return toast.error('Enter your API Key')
    if (!form.access_token.trim()) return toast.error('Enter your Access Token')
    setLoading(true)
    try {
      const res = await axios.get('https://api.upstox.com/v2/user/profile', {
        headers: { Authorization: `Bearer ${form.access_token.trim()}`, Accept: 'application/json' },
      })
      saveUpstoxSession({ ...form, profile: res.data?.data || {} })
      toast.success('Connected to Upstox!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(ellipse at top, #1a1a3e 0%, #0a0a0f 60%)' }}>
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl mb-4" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>📈</div>
          <h1 className="text-3xl font-bold text-white">StockScanner</h1>
          <p className="text-gray-500 mt-1">NSE / BSE Live Market Scanner</p>
        </div>

        {/* Card */}
        <div className="card-glow p-8">
          <h2 className="text-white font-semibold text-lg mb-6">Connect Upstox Account</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs font-medium mb-2 block uppercase tracking-wide">API Key</label>
              <input name="api_key" value={form.api_key} onChange={handleChange}
                placeholder="Enter your Upstox API Key"
                className="input" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium mb-2 block uppercase tracking-wide">API Secret <span className="text-gray-600 normal-case">(optional)</span></label>
              <input name="api_secret" value={form.api_secret} onChange={handleChange} type="password"
                placeholder="Enter your API Secret"
                className="input" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium mb-2 block uppercase tracking-wide">Access Token</label>
              <textarea name="access_token" value={form.access_token} onChange={handleChange}
                placeholder="Paste your Access Token here..."
                rows={4}
                className="input resize-none font-mono text-xs" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? '⏳ Connecting...' : '🚀 Connect Upstox'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 rounded-xl text-xs space-y-2" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <p className="text-indigo-400 font-semibold">How to get Access Token:</p>
            <p className="text-gray-500">1. Go to <a href="https://developer.upstox.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">developer.upstox.com</a> → Create App</p>
            <p className="text-gray-500">2. Complete OAuth login → copy Access Token</p>
            <p className="text-yellow-600">⚠ Token expires daily at midnight IST</p>
          </div>
        </div>

        <p className="text-center text-gray-700 text-xs mt-4">Credentials stored locally · Never shared</p>
      </div>
    </div>
  )
}
