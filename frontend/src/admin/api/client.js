import axios from 'axios'
import { adminPath } from '@admin/adminPaths'
import { useAuth } from '@admin/hooks/useAuth'

/**
 * Dev: leave VITE_API unset — requests go to the Vite origin and `/api` is proxied to Express (vite.config.js).
 * Prod: set VITE_API_URL to your API origin, e.g. https://api.yourdomain.com (no trailing slash).
 */
const apiBase = import.meta.env.VITE_API_URL ?? ''

/** One in-flight refresh so parallel 401s don’t rotate the refresh cookie multiple times. */
let refreshPromise = null

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${apiBase}/api/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        const accessToken = res.data?.data?.accessToken
        if (!accessToken) {
          throw new Error('Refresh response missing accessToken')
        }
        useAuth.getState().setToken(accessToken)
        return accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export const apiClient = axios.create({
  baseURL: apiBase,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const accessToken = await refreshAccessToken()
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        useAuth.getState().clearAuth()
        window.location.href = adminPath('/login')
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
