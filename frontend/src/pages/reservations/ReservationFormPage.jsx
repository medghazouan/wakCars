import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { reservationsApi } from '@/api/reservations.api'
import { carsApi } from '@/api/cars.api'
import { locationsApi } from '@/api/locations.api'
import { customersApi } from '@/api/customers.api'
import { pageTransition } from '@/animations/variants'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

function toDatetimeLocal(iso) {
  if (!iso) return ''
  const d = typeof iso === 'string' ? parseISO(iso) : new Date(iso)
  return format(d, "yyyy-MM-dd'T'HH:mm")
}

export default function ReservationFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = Boolean(id)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: reservationRes, isLoading: loadingReservation } = useQuery({
    queryKey: ['reservation', id],
    queryFn: () => reservationsApi.getById(id),
    enabled: isEdit,
  })

  const { data: carsRes } = useQuery({
    queryKey: ['cars', 'for-reservation'],
    queryFn: () => carsApi.getList({ limit: 200, is_active: true }),
  })

  const { data: locationsRes } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsApi.getList(),
  })

  const { data: customersRes } = useQuery({
    queryKey: ['customers', 'dropdown'],
    queryFn: () => customersApi.getList({ limit: 200 }),
  })

  const reservation = reservationRes?.data
  const cars = carsRes?.data || []
  const locations = locationsRes?.data || []
  const customers = customersRes?.data || []

  const carsForSelect = isEdit && reservation?.car
    ? (() => {
        const list = cars.filter((c) => c.status === 'AVAILABLE' || c.id === reservation.car_id)
        const hasCurrent = list.some((c) => c.id === reservation.car_id)
        if (!hasCurrent) {
          return [
            {
              id: reservation.car_id,
              brand: reservation.car.brand,
              model: reservation.car.model,
              license_plate: reservation.car.license_plate,
              status: reservation.car.status,
            },
            ...list,
          ]
        }
        return list
      })()
    : cars.filter((c) => c.status === 'AVAILABLE')

  useEffect(() => {
    if (!reservation) return
    reset({
      car_id: reservation.car_id,
      customer_id: reservation.customer_id ?? '',
      pickup_location_id: reservation.pickup_location_id,
      dropoff_location_id: reservation.dropoff_location_id,
      pickup_date: toDatetimeLocal(reservation.pickup_date),
      dropoff_date: toDatetimeLocal(reservation.dropoff_date),
      has_gps: reservation.has_gps,
      has_child_seat: reservation.has_child_seat,
    })
  }, [reservation, reset])

  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (isEdit) {
        return reservationsApi.update(id, payload)
      }
      return reservationsApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['reservation', id] })
      toast.success(isEdit ? 'Reservation updated' : 'Reservation created')
      navigate('/reservations')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to save reservation')
    },
  })

  const onSubmit = (data) => {
    const pickup = new Date(data.pickup_date)
    const dropoff = new Date(data.dropoff_date)
    if (dropoff <= pickup) {
      toast.error('Return date must be after pickup date')
      return
    }

    if (isEdit) {
      mutation.mutate({
        pickup_date: pickup.toISOString(),
        dropoff_date: dropoff.toISOString(),
        pickup_location_id: Number(data.pickup_location_id),
        dropoff_location_id: Number(data.dropoff_location_id),
        has_gps: Boolean(data.has_gps),
        has_child_seat: Boolean(data.has_child_seat),
        ...(data.customer_id ? { customer_id: Number(data.customer_id) } : {}),
      })
      return
    }

    mutation.mutate({
      car_id: Number(data.car_id),
      pickup_location_id: Number(data.pickup_location_id),
      dropoff_location_id: Number(data.dropoff_location_id),
      pickup_date: pickup.toISOString(),
      dropoff_date: dropoff.toISOString(),
      has_gps: Boolean(data.has_gps),
      has_child_seat: Boolean(data.has_child_seat),
      ...(data.customer_id ? { customer_id: Number(data.customer_id) } : {}),
    })
  }

  if (isEdit && loadingReservation) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-gray-500 text-center">Loading reservation…</div>
    )
  }

  if (isEdit && !reservation) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <p className="text-secondary font-medium mb-4">Reservation not found.</p>
        <Button type="button" onClick={() => navigate('/reservations')}>
          Back to list
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-secondary mb-2">
          {isEdit ? `Edit reservation #${id}` : 'New reservation'}
        </h1>
        <p className="text-gray-400">
          {isEdit ? 'Update dates, locations, options, or linked customer.' : 'Create a booking for a guest or customer.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6 space-y-6">
          {!isEdit && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Vehicle</label>
              <select
                {...register('car_id', { required: 'Select a vehicle' })}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">Select available vehicle</option>
                {carsForSelect.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.brand} {car.model} · {car.license_plate}
                    {car.status && car.status !== 'AVAILABLE' ? ` (${car.status})` : ''}
                  </option>
                ))}
              </select>
              {errors.car_id && <p className="text-xs text-danger mt-1">{errors.car_id.message}</p>}
            </div>
          )}

          {isEdit && reservation?.car && (
            <div className="rounded-lg bg-gray-100 px-4 py-3 text-sm">
              <span className="text-gray-500 uppercase text-[10px] font-semibold tracking-wider">Vehicle</span>
              <p className="font-semibold text-secondary mt-1">
                {reservation.car.brand} {reservation.car.model} · {reservation.car.license_plate}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                To assign a different car, use Reassign from the API or add a control that calls PATCH /reassign.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Pickup location</label>
              <select
                {...register('pickup_location_id', { required: 'Required', valueAsNumber: true })}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">Select</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name_fr}
                  </option>
                ))}
              </select>
              {errors.pickup_location_id && <p className="text-xs text-danger">{errors.pickup_location_id.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Drop-off location</label>
              <select
                {...register('dropoff_location_id', { required: 'Required', valueAsNumber: true })}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">Select</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name_fr}
                  </option>
                ))}
              </select>
              {errors.dropoff_location_id && <p className="text-xs text-danger">{errors.dropoff_location_id.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Pickup date & time</label>
              <Input
                type="datetime-local"
                {...register('pickup_date', { required: 'Required' })}
                error={errors.pickup_date?.message}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Return date & time</label>
              <Input
                type="datetime-local"
                {...register('dropoff_date', { required: 'Required' })}
                error={errors.dropoff_date?.message}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Customer (optional)</label>
            <select
              {...register('customer_id')}
              className="flex h-10 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="">Guest / no linked customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name} · {c.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" {...register('has_gps')} />
              GPS add-on
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" {...register('has_child_seat')} />
              Child seat
            </label>
          </div>

          <div className="pt-6 flex gap-4 justify-end border-t border-gray-100">
            <Button variant="ghost" type="button" onClick={() => navigate('/reservations')}>
              Cancel
            </Button>
            <Button type="submit" isLoading={mutation.isPending}>
              {isEdit ? 'Save changes' : 'Create reservation'}
            </Button>
          </div>
        </Card>
      </form>
    </motion.div>
  )
}
