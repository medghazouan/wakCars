import { apiClient } from './client'

export const alertsApi = {
  getAlerts: () => apiClient.get('/api/alerts'),
}
