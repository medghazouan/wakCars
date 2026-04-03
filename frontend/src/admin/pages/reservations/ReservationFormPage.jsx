import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { reservationsApi } from '@admin/api/reservations.api'
import { carsApi } from '@admin/api/cars.api'
import { locationsApi } from '@admin/api/locations.api'
import { customersApi } from '@admin/api/customers.api'
import { pageTransition } from '@admin/animations/variants'
import { Input } from '@admin/components/ui/Input'
import { Button } from '@admin/components/ui/Button'
import { Card } from '@admin/components/ui/Card'
import { BOOKING_SOURCE_OPTIONS } from '@admin/constants/bookingSource'
import {
  pickupReminder,
  returnReminder,
  overdueReturn,
  paymentIssue,
  customerInquiry,
  customerSupport,
} from '@admin/utils/whatsappLinks'

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

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { booking_source: 'WEBSITE' },
  })

  const [reassignCarId, setReassignCarId] = useState('')

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
    enabled: !isEdit,
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
    const c = reservation.customer
    setReassignCarId(String(reservation.car_id))
    reset({
      car_id: reservation.car_id,
      customer_id: reservation.customer_id ?? '',
      pickup_location_id: reservation.pickup_location_id,
      dropoff_location_id: reservation.dropoff_location_id,
      pickup_date: toDatetimeLocal(reservation.pickup_date),
      dropoff_date: toDatetimeLocal(reservation.dropoff_date),
      has_gps: reservation.has_gps,
      has_child_seat: reservation.has_child_seat,
      booking_source: reservation.booking_source || 'WEBSITE',
      ...(c && {
        cust_first_name: c.first_name ?? '',
        cust_last_name: c.last_name ?? '',
        cust_email: c.email ?? '',
        cust_phone: c.phone ?? '',
        cust_nationality: c.nationality ?? '',
        cust_licence_country: c.licence_country ?? '',
        cust_licence_number: c.licence_number ?? '',
        cust_passport_number: c.passport_number ?? '',
        cust_notes: c.notes ?? '',
      }),
    })
  }, [reservation, reset])

  const reassignMutation = useMutation({
    mutationFn: (car_id) => reservationsApi.reassign(id, car_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation', id] })
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Vehicle reassigned')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Could not reassign vehicle')
    },
  })

  const mutation = useMutation({
    mutationFn: async (vars) => {
      if (isEdit) {
        const { resPayload, customerPatch, customerId } = vars
        if (customerId && customerPatch) {
          await customersApi.update(customerId, customerPatch)
        }
        return reservationsApi.update(id, resPayload)
      }
      return reservationsApi.create(vars)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ['reservation', id] })
        if (variables?.customerId) {
          queryClient.invalidateQueries({ queryKey: ['customers'] })
          queryClient.invalidateQueries({
            queryKey: ['customer', String(variables.customerId)],
          })
        }
      }
      toast.success(isEdit ? 'Reservation updated' : 'Reservation created')
      navigate(adminPath('/reservations'))
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
      const resPayload = {
        pickup_date: pickup.toISOString(),
        dropoff_date: dropoff.toISOString(),
        pickup_location_id: Number(data.pickup_location_id),
        dropoff_location_id: Number(data.dropoff_location_id),
        has_gps: Boolean(data.has_gps),
        has_child_seat: Boolean(data.has_child_seat),
        booking_source: data.booking_source || 'WEBSITE',
      }
      const customerId = reservation.customer_id
      let customerPatch = null
      if (customerId && reservation.customer) {
        if (!data.cust_first_name?.trim() || !data.cust_last_name?.trim() || !data.cust_phone?.trim()) {
          toast.error('Customer first name, last name, and phone are required')
          return
        }
        customerPatch = {
          first_name: data.cust_first_name.trim(),
          last_name: data.cust_last_name.trim(),
          phone: data.cust_phone.trim(),
          nationality: data.cust_nationality?.trim() || null,
          licence_country: data.cust_licence_country?.trim() || null,
          licence_number: data.cust_licence_number?.trim() || null,
          passport_number: data.cust_passport_number?.trim() || null,
          notes: data.cust_notes?.trim() || null,
        }
        const em = data.cust_email?.trim()
        if (em) customerPatch.email = em
      }
      mutation.mutate({ resPayload, customerPatch, customerId })
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
      booking_source: data.booking_source || 'WEBSITE',
      ...(data.customer_id ? { customer_id: Number(data.customer_id) } : {}),
    })
  }

  const handleReassign = () => {
    if (!isEdit || !reservation) return
    const cid = Number(reassignCarId)
    if (!cid || cid === reservation.car_id) return
    reassignMutation.mutate(cid)
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
        <Button type="button" onClick={() => navigate(adminPath('/reservations'))}>
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
      className="mx-auto w-full min-w-0 max-w-3xl space-y-6 sm:space-y-8"
    >
      <div className="min-w-0">
        <h1 className="mb-2 text-2xl font-bold text-secondary sm:text-3xl">
          {isEdit ? `Edit reservation #${id}` : 'New reservation'}
        </h1>
        <p className="text-sm text-gray-400 sm:text-base">
          {isEdit
            ? 'Update booking details. Edits to the linked customer are saved to the Customers directory (you cannot switch to a different customer here).'
            : 'Create a booking for a guest or customer.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-6 p-4 sm:p-6">
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
            <div className="space-y-3 rounded-lg bg-gray-100 px-4 py-3 text-sm">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Vehicle</span>
                <p className="mt-1 font-semibold text-secondary">
                  {reservation.car.brand} {reservation.car.model} · {reservation.car.license_plate}
                </p>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50/80 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-900">
                  Reassign vehicle
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Select another available vehicle. Dates, options and total are recalculated on the server.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <select
                    value={reassignCarId}
                    onChange={(e) => setReassignCarId(e.target.value)}
                    className="flex h-10 min-w-[220px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {carsForSelect.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.brand} {car.model} · {car.license_plate}
                        {car.status && car.status !== 'AVAILABLE' ? ` (${car.status})` : ''}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="primary"
                    isLoading={reassignMutation.isPending}
                    disabled={Number(reassignCarId) === reservation.car_id}
                    onClick={handleReassign}
                  >
                    Apply reassignment
                  </Button>
                </div>
              </div>
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

          {!isEdit && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                Customer (optional)
              </label>
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
          )}

          {isEdit && reservation?.customer && (
            <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50/80 p-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Linked customer
                </span>
                <p className="mt-1 text-sm text-secondary">
                  Customer #{reservation.customer.id} — edit fields below; changes update the global customer record.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                    First name
                  </label>
                  <Input {...register('cust_first_name', { required: 'Required' })} error={errors.cust_first_name?.message} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                    Last name
                  </label>
                  <Input {...register('cust_last_name', { required: 'Required' })} error={errors.cust_last_name?.message} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Email</label>
                  <Input type="email" {...register('cust_email')} error={errors.cust_email?.message} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Phone</label>
                  <Input {...register('cust_phone', { required: 'Required' })} error={errors.cust_phone?.message} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                    Nationality
                  </label>
                  <Input {...register('cust_nationality')} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                    Licence country
                  </label>
                  <Input {...register('cust_licence_country')} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                    Licence number
                  </label>
                  <Input {...register('cust_licence_number')} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                    Passport number
                  </label>
                  <Input {...register('cust_passport_number')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Notes</label>
                <Input {...register('cust_notes')} />
              </div>
            </div>
          )}

          {isEdit && reservation && !reservation.customer && (
            <div className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-600">
              No linked customer on this reservation. Customer cannot be reassigned from this form.
            </div>
          )}

          {isEdit && reservation?.customer?.phone && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-900">
                WhatsApp — messages pré-remplis
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Ouvre une conversation avec le texte défini (même logique que le backend).
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={pickupReminder(reservation.customer, reservation)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-50"
                >
                  Veille · prise en charge
                </a>
                <a
                  href={returnReminder(reservation.customer, reservation)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-50"
                >
                  Jour J · retour
                </a>
                <a
                  href={overdueReturn(reservation.customer, reservation)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-50"
                >
                  Retour en retard
                </a>
                <a
                  href={paymentIssue(reservation.customer, reservation)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-50"
                >
                  Problème de paiement
                </a>
                <a
                  href={customerSupport(reservation.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-50"
                >
                  Aide réservation
                </a>
                <a
                  href={customerInquiry()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50"
                >
                  Demande d&apos;infos (vers l&apos;agence)
                </a>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
              Booking source
            </label>
            <select
              {...register('booking_source')}
              className="flex h-10 w-full max-w-md rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {BOOKING_SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" {...register('has_gps')} />
              GPS add-on
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" {...register('has_child_seat')} />
              Child seat
            </label>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end sm:gap-4">
            <Button variant="ghost" type="button" className="w-full sm:w-auto" onClick={() => navigate(adminPath('/reservations'))}>
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto" isLoading={mutation.isPending}>
              {isEdit ? 'Save changes' : 'Create reservation'}
            </Button>
          </div>
        </Card>
      </form>
    </motion.div>
  )
}
