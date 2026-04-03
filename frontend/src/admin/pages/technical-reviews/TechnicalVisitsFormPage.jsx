import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { technicalVisitsApi } from '@admin/api/insurance.api'
import { carsApi } from '@admin/api/cars.api'
import { categoriesApi } from '@admin/api/categories.api'
import { pageTransition } from '@admin/animations/variants'
import { Input } from '@admin/components/ui/Input'
import { Button } from '@admin/components/ui/Button'
import { Card } from '@admin/components/ui/Card'

function toDateInput(iso) {
  if (!iso) return ''
  const d = typeof iso === 'string' ? parseISO(iso) : new Date(iso)
  return format(d, 'yyyy-MM-dd')
}

export default function TechnicalVisitsFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = Boolean(id)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm()

  const { data: visitRes, isLoading: loadingVisit } = useQuery({
    queryKey: ['technical-visit', id],
    queryFn: () => technicalVisitsApi.getById(id),
    enabled: isEdit,
  })

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getList({ limit: 200 }),
  })

  const { data: carsRes } = useQuery({
    queryKey: ['cars', 'for-technical', selectedCategory],
    queryFn: () => carsApi.getList({
      limit: 200,
      is_active: true,
      ...(selectedCategory && { category_id: selectedCategory }),
    }),
    enabled: isEdit || selectedCategory !== null,
  })

  const visit = visitRes?.data
  const categories = categoriesRes?.data || []
  const cars = carsRes?.data || []

  useEffect(() => {
    if (isEdit && visit) {
      setSelectedCategory(visit.car?.category_id || null)
    }
  }, [visit, isEdit])

  const carsForSelect = isEdit && visit?.car
    ? (() => {
        const list = cars.filter((c) => c.id === visit.car_id)
        if (!list.length) {
          return [
            {
              id: visit.car_id,
              brand: visit.car.brand,
              model: visit.car.model,
              license_plate: visit.car.license_plate,
              category_id: visit.car.category_id,
            },
            ...cars,
          ]
        }
        return [...list, ...cars.filter((c) => c.id !== visit.car_id)]
      })()
    : cars

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (isEdit) {
        return technicalVisitsApi.update(id, data)
      }
      return technicalVisitsApi.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-visits'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(isEdit ? 'Visit updated' : 'Visit created')
      navigate(adminPath('/technical-reviews'))
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Could not save visit')
    },
  })

  useEffect(() => {
    if (!visit) return
    reset({
      car_id: visit.car_id,
      visit_date: toDateInput(visit.visit_date),
      expiration_date: toDateInput(visit.expiration_date),
      cost: visit.cost ?? '',
    })
  }, [visit, reset])

  const onSubmit = (data) => {
    saveMutation.mutate(data)
  }

  if (loadingVisit) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        className="mx-auto w-full min-w-0 max-w-2xl space-y-6 py-4 sm:py-6"
      >
        <div className="h-96 rounded-lg bg-gray-100 animate-pulse" />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="mx-auto w-full min-w-0 max-w-2xl space-y-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-secondary sm:text-3xl">
            {isEdit ? 'Edit Technical Visit' : 'New Technical Visit'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit
              ? 'Update the technical visit details'
              : 'Log a new technical inspection or maintenance visit'}
          </p>
        </div>
        <Button
          variant="ghost"
          type="button"
          className="w-full shrink-0 sm:w-auto"
          onClick={() => navigate(adminPath('/technical-reviews'))}
        >
          Cancel
        </Button>
      </div>

      <Card className="space-y-6 p-4 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">
              Vehicle Category <span className="text-danger">*</span>
            </label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => {
                setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            >
              <option value="">Select a category first</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_en || cat.name_fr || `Category ${cat.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Selection */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">
              Vehicle <span className="text-danger">*</span>
            </label>
            <select
              {...register('car_id', { required: 'Vehicle is required' })}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
              disabled={!selectedCategory && !isEdit}
            >
              <option value="">
                {!selectedCategory && !isEdit
                  ? 'Select a category first'
                  : 'Select a vehicle'}
              </option>
              {carsForSelect.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.brand} {car.model} ({car.license_plate})
                </option>
              ))}
            </select>
            {errors.car_id && (
              <p className="text-xs text-danger mt-1">{errors.car_id.message}</p>
            )}
          </div>

          {/* Visit Date */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">
              Visit Date <span className="text-danger">*</span>
            </label>
            <Input
              type="date"
              {...register('visit_date', { required: 'Visit date is required' })}
              error={errors.visit_date?.message}
            />
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">
              Expiration Date
            </label>
            <Input
              type="date"
              {...register('expiration_date')}
              error={errors.expiration_date?.message}
            />
            <p className="text-xs text-gray-500 mt-1">Optional - Leave empty for visits with no expiration</p>
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">
              Cost
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('cost', {
                min: { value: 0, message: 'Cost must be positive' },
              })}
              error={errors.cost?.message}
            />
            <p className="text-xs text-gray-500 mt-1">Optional - Service or inspection cost</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(adminPath('/technical-reviews'))}
              className="w-full sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={saveMutation.isPending}
              className="w-full bg-primary text-white hover:bg-primary/90 sm:flex-1"
            >
              {isEdit ? 'Update Visit' : 'Create Visit'}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}
