import { apiClient } from './client'

function buildCarFormData(data) {
  const fd = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (key === 'images' && Array.isArray(value)) {
      value.forEach((file) => fd.append('images', file))
      return
    }
    fd.append(key, typeof value === 'boolean' ? String(value) : String(value))
  })
  return fd
}

export const carsApi = {
  getList: (params) => apiClient.get('/api/cars', { params }),
  getById: (id) => apiClient.get(`/api/cars/${id}`),
  create: (data) => {
    const body = data instanceof FormData ? data : buildCarFormData(data)
    return apiClient.post('/api/cars', body)
  },
  update: (id, data) => apiClient.put(`/api/cars/${id}`, data),
  updateStatus: (id, status) => apiClient.patch(`/api/cars/${id}/status`, { status }),
  delete: (id) => apiClient.delete(`/api/cars/${id}`),
  addImage: (id, file, data = {}) => {
    const formData = new FormData()
    formData.append('image', file)
    if (data.alt_fr) formData.append('alt_fr', data.alt_fr)
    if (data.alt_ar) formData.append('alt_ar', data.alt_ar)
    return apiClient.post(`/api/cars/${id}/images`, formData)
  },
  deleteImage: (id, imageId) => apiClient.delete(`/api/cars/${id}/images/${imageId}`),
  setPrimaryImage: (id, imageId) => apiClient.patch(`/api/cars/${id}/images/${imageId}/primary`),
}
