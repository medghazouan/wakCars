import { apiClient } from './client'

export const locationsApi = {
  getList: () => apiClient.get('/api/locations'),
}
