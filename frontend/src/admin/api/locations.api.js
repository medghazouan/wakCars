import { apiClient } from './client'

export const locationsApi = {
  getList: () => apiClient.get('/api/locations'),
  getById: (id) => apiClient.get(`/api/locations/${id}`),
  create: (data) => apiClient.post('/api/locations', data),
  update: (id, data) => apiClient.put(`/api/locations/${id}`, data),
  delete: (id) => apiClient.delete(`/api/locations/${id}`),
  addImage: (id, file) => {
    const fd = new FormData()
    fd.append('image', file)
    return apiClient.post(`/api/locations/${id}/images`, fd)
  },
  removeImage: (id, url) => apiClient.post(`/api/locations/${id}/images/remove`, { url }),
}
