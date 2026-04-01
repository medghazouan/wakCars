import { useMutation } from '@tanstack/react-query'
import { reservationsService } from '../services/reservations.service'

export const useCreateReservation = () => {
  return useMutation({
    mutationFn: (data) => reservationsService.create(data),
  })
}

export default useCreateReservation
