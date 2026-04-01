import api from './api'

export const getLocations = async () => {
  const response = await api.get('/locations')
  return response.data
}
