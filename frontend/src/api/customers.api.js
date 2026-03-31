import { apiClient } from './client'

export const customersApi = {
  getList: (params) => apiClient.get('/api/customers', { params }),
  getById: (id) => apiClient.get(`/api/customers/${id}`),
  create: (data) => apiClient.post('/api/customers', data),
  update: (id, data) => apiClient.put(`/api/customers/${id}`, data),
}

export const paymentsApi = {
  getList: (params) => apiClient.get('/api/payments', { params }),
  getById: (id) => apiClient.get(`/api/payments/${id}`),
  create: (data) => apiClient.post('/api/payments', data),
  update: (id, data) => apiClient.put(`/api/payments/${id}`, data),
}
