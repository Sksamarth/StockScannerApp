import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Login() {
  const { saveUpstoxSession } = useAuth()
  const [form, setForm] = useState({ api_key: '', api_secret: '', access_token: '', redirect_url: '' })
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('token')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleTokenLogin = async (e) => {
    e.preventDefault()
    if (!form.api_key.trim()) return toast.error('Enter your API Key')
    if (!form.access_token.trim()) return toast.error('Enter your Access Token')
    setLoading(true)
    try {
      // Validate directly against Upstox API — no backend needed
      const res = await axios.get('https://api.upstox.com/v2/user/profile', {
        headers: {
          Authorization: `Bearer ${form.access_token.trim()}`,
          Accept: 'application/json',
        },
      })
      const profile = res.data?.data || {}
      saveUpstoxSession({
        api_key: form.api_key.trim(),
        api_secret: form.api_secret.trim(),
        access_token: form.access_token.trim(),
        profile,
      })
      toast.success(`Connected! Welcome ${profile.name || profile.email || ''}`)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Invalid credentials'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = () => {
    if (!form.api_key.trim()) return toast.error('Enter your API Key first')
    if (!form.redirect_url.trim()) return toast.error('Enter your Redirect URL')
    const url = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${form.api_key.trim()}&redirect_uri=${encodeURIComponent(form.redirect_url.trim())}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📈</div>
          <h1 className="text-2xl font-bold text-white">StockScanner</h1>
          <p className="text-gray-400 text-sm mt-1">NSE / BSE Live Scanner</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 bg-gray-800 p-1 rounded-lg">
          {['token', 'oauth'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === m ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {m === 'token' ? '🔑 Access Token' : '🔐 OAuth Login'}
            </button>
          ))}
        </div>

        <form onSubmit={handleTokenLogin} className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Upstox API Key *</label>
            <input
              name="api_key"
              placeholder="Enter your API Key"
              value={form.api_key}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          {mode === 'token' ? (
            <>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">API Secret (optional)</label>
                <input
                  name="api_secret"
                  placeholder="Enter your API Secret"
                  value={form.api_secret}
                  onChange={handleChange}
                  type="password"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Access Token *</label>
                <textarea
                  name="access_token"
                  placeholder="Paste your Access Token here"
                  value={form.access_token}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm resize-none font-mono text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? '⏳ Validating...' : '🚀 Connect Upstox'}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Redirect URL *</label>
                <input
                  name="redirect_url"
                  placeholder="e.g. https://yourapp.vercel.app"
                  value={form.redirect_url}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleOAuth}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                🔐 Login with Upstox OAuth
              </button>
            </>
          )}
        </form>

        {/* Help */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg text-xs text-gray-500 space-y-1">
          <p className="text-gray-400 font-medium mb-2">How to get Access Token:</p>
          <p>1. Go to <a href="https://developer.upstox.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">developer.upstox.com</a></p>
          <p>2. Create an App → get API Key</p>
          <p>3. Login via OAuth → copy Access Token</p>
          <p className="text-yellow-600 mt-2">⚠ Token expires daily at midnight</p>
        </div>

        <p className="text-gray-700 text-xs text-center mt-4">
          Credentials stored locally only. Never shared.
        </p>
      </div>
    </div>
  )
}
