import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL })

api.interceptors.request.use((config) => {
  const session = JSON.parse(localStorage.getItem('upstox_session') || '{}')
  
  // Always send both tokens
  if (session.access_token) {
    config.headers['x-access-token'] = session.access_token
  }
  if (session.api_key) {
    config.headers['x-api-key'] = session.api_key
  } else {
    // Fallback: use a placeholder if not found
    config.headers['x-api-key'] = 'default-key'
  }
  
  return config
})

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    return Promise.reject(error)
  }
)

export default api
