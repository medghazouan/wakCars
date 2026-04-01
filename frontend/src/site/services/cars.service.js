import api from './api'

export const carsService = {
  getAll: (params = {}) => api.get('/cars', { params }),
  
  getFeatured: () => api.get('/cars/featured'),
  
  getBySlug: (slug) => api.get(`/cars/${slug}`),
  
  checkAvailability: (carId, from, to) => 
    api.get('/cars/check-availability', { params: { car_id: carId, from, to } }),
}

export const categoriesService = {
  getAll: () => api.get('/categories'),
}

export default carsService
