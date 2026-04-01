import { useQuery } from '@tanstack/react-query'
import { carsService, categoriesService } from '../services/cars.service'

export const useCars = (params = {}) => {
  return useQuery({
    queryKey: ['cars', params],
    queryFn: () => carsService.getAll(params),
  })
}

export const useFeaturedCars = () => {
  return useQuery({
    queryKey: ['cars', 'featured'],
    queryFn: () => carsService.getFeatured(),
  })
}

export const useCarBySlug = (slug) => {
  return useQuery({
    queryKey: ['car', slug],
    queryFn: () => carsService.getBySlug(slug),
    enabled: !!slug,
  })
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  })
}

export const useCarAvailability = (carId, from, to) => {
  return useQuery({
    queryKey: ['availability', carId, from, to],
    queryFn: () => carsService.checkAvailability(carId, from, to),
    enabled: !!carId && !!from && !!to,
  })
}

export default useCars
