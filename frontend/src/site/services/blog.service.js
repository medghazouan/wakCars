import api from './api'

export const blogService = {
  getAll: (params = {}) => api.get('/blog', { params }),
  
  getBySlug: (slug) => api.get(`/blog/${slug}`),
}

export default blogService
