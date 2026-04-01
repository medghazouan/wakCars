import { apiClient } from './client'

export const damagesApi = {
  getList: (params) => apiClient.get('/api/damages', { params }),
  getById: (id) => apiClient.get(`/api/damages/${id}`),
  /** @param {FormData} formData — fields + optional `images` files */
  create: (formData) => apiClient.post('/api/damages', formData),
  update: (id, data) => apiClient.put(`/api/damages/${id}`, data),
  addImage: (id, file) => {
    const fd = new FormData()
    fd.append('image', file)
    return apiClient.post(`/api/damages/${id}/images`, fd)
  },
  deleteImage: (id, imageId) => apiClient.delete(`/api/damages/${id}/images/${imageId}`),
  notifyCustomer: (id) => apiClient.patch(`/api/damages/${id}/notify`),
}
