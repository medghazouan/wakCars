import { apiClient } from './client'

export const damagesApi = {
  getList: (params) => apiClient.get('/api/damages', { params }),
  getById: (id) => apiClient.get(`/api/damages/${id}`),
  create: (data) => apiClient.post('/api/damages', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => apiClient.put(`/api/damages/${id}`, data),
  addImage: (id, file) => {
    const formData = new FormData()
    formData.append('image', file)
    return apiClient.post(`/api/damages/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  deleteImage: (id, imageId) => apiClient.delete(`/api/damages/${id}/images/${imageId}`),
  notify: (id) => apiClient.patch(`/api/damages/${id}/notify`),
}

export const blogApi = {
  getList: (params) => apiClient.get('/api/blog', { params }),
  getById: (id) => apiClient.get(`/api/blog/${id}`),
  create: (data) => apiClient.post('/api/blog', data),
  update: (id, data) => apiClient.put(`/api/blog/${id}`, data),
  publish: (id, is_published) => apiClient.patch(`/api/blog/${id}/publish`, { is_published }),
  delete: (id) => apiClient.delete(`/api/blog/${id}`),
}

export const faqsApi = {
  getList: (params) => apiClient.get('/api/faqs', { params }),
  getById: (id) => apiClient.get(`/api/faqs/${id}`),
  create: (data) => apiClient.post('/api/faqs', data),
  update: (id, data) => apiClient.put(`/api/faqs/${id}`, data),
  delete: (id) => apiClient.delete(`/api/faqs/${id}`),
}
