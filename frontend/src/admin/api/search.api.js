import { apiClient } from './client'

export const searchApi = {
  /** Quick suggestions: customers, cars, reservations (min 2 chars). */
  quick: (q) => apiClient.get('/api/search', { params: { q } }),
}
