import { apiClient } from './client'

export const dashboardApi = {
  getStats: () => apiClient.get('/api/dashboard'),
}
