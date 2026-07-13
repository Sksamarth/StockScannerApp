import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL })

api.interceptors.request.use((config) => {
  const session = JSON.parse(localStorage.getItem('upstox_session') || '{}')
  if (session.access_token) config.headers['x-access-token'] = session.access_token
  if (session.api_key) config.headers['x-api-key'] = session.api_key
  return config
})

export default api
