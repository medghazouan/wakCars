import axios from 'axios'

/** Public marketing API (no JWT). Backend: /api/public/* — proxied in dev via Vite. */
function publicApiBase() {
  const raw = import.meta.env.VITE_API_URL
  if (raw != null && String(raw).trim() !== '') {
    return `${String(raw).replace(/\/$/, '')}/api/public`
  }
  return '/api/public'
}

const api = axios.create({
  baseURL: publicApiBase(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const d = error.response?.data
    const message = d?.error || d?.message || 'Une erreur est survenue'
    console.error('API Error:', message)
    return Promise.reject(error)
  }
)

export default api
