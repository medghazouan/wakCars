import { apiClient } from './client'

export const blogApi = {
  getList: (params) => apiClient.get('/api/blog', { params }),
  getById: (id) => apiClient.get(`/api/blog/${id}`),
  create: (data) => apiClient.post('/api/blog', data),
  update: (id, data) => apiClient.put(`/api/blog/${id}`, data),
  togglePublish: (id) => apiClient.patch(`/api/blog/${id}/publish`),
  delete: (id) => apiClient.delete(`/api/blog/${id}`),
  /** Upload cover thumbnail to Cloudinary and set `cover_image` on the post (same flow as car photos). */
  uploadCover: (id, file) => {
    const fd = new FormData()
    fd.append('cover', file)
    return apiClient.post(`/api/blog/${id}/cover`, fd)
  },
}
