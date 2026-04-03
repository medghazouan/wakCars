import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { insuranceApi } from '@admin/api/insurance.api'
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

export default function InsuranceFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = Boolean(id)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm()

  const { data: policyRes, isLoading: loadingPolicy } = useQuery({
    queryKey: ['insurance', id],
    queryFn: () => insuranceApi.getById(id),
    enabled: isEdit,
  })

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getList({ limit: 200 }),
  })

  const { data: carsRes } = useQuery({
    queryKey: ['cars', 'for-insurance', selectedCategory],
    queryFn: () => carsApi.getList({
      limit: 200,
      is_active: true,
      ...(selectedCategory && { category_id: selectedCategory }),
    }),
    enabled: isEdit || selectedCategory !== null,
  })

  const policy = policyRes?.data
  const categories = categoriesRes?.data || []
  const cars = carsRes?.data || []

  useEffect(() => {
    if (isEdit && policy) {
      setSelectedCategory(policy.car?.category_id || null)
    }
  }, [policy, isEdit])

  const carsForSelect = isEdit && policy?.car
    ? (() => {
        const list = cars.filter((c) => c.id === policy.car_id)
        if (!list.length) {
          return [
            {
              id: policy.car_id,
              brand: policy.car.brand,
              model: policy.car.model,
              license_plate: policy.car.license_plate,
              category_id: policy.car.category_id,
            },
            ...cars,
          ]
        }
        return [...list, ...cars.filter((c) => c.id !== policy.car_id)]
      })()
    : cars

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (isEdit) {
        return insuranceApi.update(id, data)
      }
      return insuranceApi.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(isEdit ? 'Policy updated' : 'Policy created')
      navigate(adminPath('/insurance'))
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Could not save policy')
    },
  })

  useEffect(() => {
    if (!policy) return
    reset({
      car_id: policy.car_id,
      provider: policy.provider ?? '',
      policy_number: policy.policy_number ?? '',
      start_date: toDateInput(policy.start_date),
      expiry_date: toDateInput(policy.expiry_date),
      notes: policy.notes ?? '',
    })
  }, [policy, reset])

  const onSubmit = (data) => {
    saveMutation.mutate(data)
  }

  if (loadingPolicy) {
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
            {isEdit ? 'Edit Insurance Policy' : 'New Insurance Policy'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit
              ? 'Update the insurance policy details'
              : 'Add a new insurance policy for your fleet'}
          </p>
        </div>
        <Button
          variant="ghost"
          type="button"
          className="w-full shrink-0 sm:w-auto"
          onClick={() => navigate(adminPath('/insurance'))}
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

          {/* Insurance Provider */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">
              Insurance Provider <span className="text-danger">*</span>
            </label>
            <Input
              {...register('provider', { required: 'Provider is required' })}
              placeholder="e.g., AXA Insurance, SANAD"
              error={errors.provider?.message}
            />
          </div>

          {/* Policy Number */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">
              Policy Number <span className="text-danger">*</span>
            </label>
            <Input
              {...register('policy_number', { required: 'Policy number is required' })}
              placeholder="e.g., POL-2024-123456"
              error={errors.policy_number?.message}
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">
              Start Date <span className="text-danger">*</span>
            </label>
            <Input
              type="date"
              {...register('start_date', { required: 'Start date is required' })}
              error={errors.start_date?.message}
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">
              Expiry Date <span className="text-danger">*</span>
            </label>
            <Input
              type="date"
              {...register('expiry_date', { required: 'Expiry date is required' })}
              error={errors.expiry_date?.message}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">
              Notes
            </label>
            <textarea
              {...register('notes')}
              placeholder="Optional notes about this policy (coverage details, special conditions, etc.)"
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-secondary placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(adminPath('/insurance'))}
              className="w-full sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={saveMutation.isPending}
              className="w-full bg-primary text-white hover:bg-primary/90 sm:flex-1"
            >
              {isEdit ? 'Update Policy' : 'Create Policy'}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}
