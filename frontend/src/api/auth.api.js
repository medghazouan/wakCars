import { apiClient } from './client'

export const authApi = {
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  logout: () => apiClient.post('/api/auth/logout'),
  getMe: () => apiClient.get('/api/auth/me'),
}
