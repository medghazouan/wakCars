import api from './api'

export const reservationsService = {
  create: (data) => api.post('/reservations', data),
}

export default reservationsService
