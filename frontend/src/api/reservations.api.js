import { apiClient } from './client'

export const reservationsApi = {
  getList: (params) => apiClient.get('/api/reservations', { params }),
  getById: (id) => apiClient.get(`/api/reservations/${id}`),
  create: (data) => apiClient.post('/api/reservations', data),
  update: (id, data) => apiClient.put(`/api/reservations/${id}`, data),
  updateStatus: (id, status) => apiClient.patch(`/api/reservations/${id}/status`, { status }),
  reassign: (id, car_id) => apiClient.patch(`/api/reservations/${id}/reassign`, { car_id }),
  confirm: (id) => apiClient.patch(`/api/reservations/${id}/confirm`),
}
