import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function Login() {
  const { saveUpstoxSession } = useAuth()
  const [form, setForm] = useState({ api_key: '', api_secret: '', access_token: '', redirect_url: '' })
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('token') // token | oauth

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleTokenLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/validate', form)
      saveUpstoxSession({ ...form, profile: res.data.profile })
      toast.success('Connected to Upstox!')
    } catch {
      toast.error('Invalid credentials. Please check and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = () => {
    if (!form.api_key || !form.redirect_url) return toast.error('Enter API Key and Redirect URL')
    const url = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${form.api_key}&redirect_uri=${encodeURIComponent(form.redirect_url)}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📈</div>
          <h1 className="text-2xl font-bold text-white">StockScanner</h1>
          <p className="text-gray-400 text-sm mt-1">Connect your Upstox account</p>
        </div>

        <div className="flex gap-2 mb-6">
          {['token', 'oauth'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {m === 'token' ? 'Access Token' : 'OAuth Login'}
            </button>
          ))}
        </div>

        <form onSubmit={handleTokenLogin} className="space-y-4">
          <input
            name="api_key"
            placeholder="Upstox API Key *"
            value={form.api_key}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          {mode === 'token' ? (
            <>
              <input
                name="api_secret"
                placeholder="API Secret"
                value={form.api_secret}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <input
                name="access_token"
                placeholder="Access Token *"
                value={form.access_token}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? 'Validating...' : 'Connect Upstox'}
              </button>
            </>
          ) : (
            <>
              <input
                name="redirect_url"
                placeholder="Redirect URL (from Upstox App settings)"
                value={form.redirect_url}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleOAuth}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Login with Upstox OAuth
              </button>
            </>
          )}
        </form>

        <p className="text-gray-600 text-xs text-center mt-6">
          Your credentials are stored locally and never shared.
        </p>
      </div>
    </div>
  )
}
