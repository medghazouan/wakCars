import { apiClient } from './client'

export const insuranceApi = {
  getList: (params) => apiClient.get('/api/insurance', { params }),
  getById: (id) => apiClient.get(`/api/insurance/${id}`),
  create: (data) => apiClient.post('/api/insurance', data),
  update: (id, data) => apiClient.put(`/api/insurance/${id}`, data),
  delete: (id) => apiClient.delete(`/api/insurance/${id}`),
}

export const technicalVisitsApi = {
  getList: (params) => apiClient.get('/api/technical-visits', { params }),
  getById: (id) => apiClient.get(`/api/technical-visits/${id}`),
  create: (data) => apiClient.post('/api/technical-visits', data),
  update: (id, data) => apiClient.put(`/api/technical-visits/${id}`, data),
  delete: (id) => apiClient.delete(`/api/technical-visits/${id}`),
}
