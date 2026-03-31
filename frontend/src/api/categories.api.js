import { apiClient } from './client'

export const categoriesApi = {
  getList: (params) => apiClient.get('/api/categories', { params }),
  getById: (id) => apiClient.get(`/api/categories/${id}`),
  create: (data) => apiClient.post('/api/categories', data),
  update: (id, data) => apiClient.put(`/api/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/api/categories/${id}`),
}
