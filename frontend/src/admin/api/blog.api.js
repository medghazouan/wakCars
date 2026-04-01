import { apiClient } from './client'

export const blogApi = {
  getList: (params) => apiClient.get('/api/blog', { params }),
  getById: (id) => apiClient.get(`/api/blog/${id}`),
  create: (data) => apiClient.post('/api/blog', data),
  update: (id, data) => apiClient.put(`/api/blog/${id}`, data),
  togglePublish: (id) => apiClient.patch(`/api/blog/${id}/publish`),
  delete: (id) => apiClient.delete(`/api/blog/${id}`),
}
