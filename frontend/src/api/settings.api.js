import { apiClient } from './client'

export const settingsApi = {
  getAll: () => apiClient.get('/api/settings'),
  getByKey: (key) => apiClient.get(`/api/settings/${key}`),
  updateByKey: (key, data) => apiClient.put(`/api/settings/${key}`, data),
  create: (data) => apiClient.post('/api/settings', data),
}

export const reportsApi = {
  getRevenue: (params) => apiClient.get('/api/reports/revenue', { params }),
  getUtilization: (params) => apiClient.get('/api/reports/utilization', { params }),
  getReservations: (params) => apiClient.get('/api/reports/reservations', { params }),
  exportReport: (params) => apiClient.get('/api/reports/export', { params, responseType: 'blob' }),
}
