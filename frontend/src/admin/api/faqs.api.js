import { apiClient } from './client'

export const faqsApi = {
  getList: (params) => apiClient.get('/api/faqs', { params }),
  getById: (id) => apiClient.get(`/api/faqs/${id}`),
  create: (data) => apiClient.post('/api/faqs', data),
  update: (id, data) => apiClient.put(`/api/faqs/${id}`, data),
  delete: (id) => apiClient.delete(`/api/faqs/${id}`),
}
