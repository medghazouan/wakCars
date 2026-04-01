import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ImagePlus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { carsApi } from '@admin/api/cars.api'
import { categoriesApi } from '@admin/api/categories.api'
import { pageTransition } from '@admin/animations/variants'
import { Input } from '@admin/components/ui/Input'
import { Button } from '@admin/components/ui/Button'
import { Card } from '@admin/components/ui/Card'
import { cn } from '@admin/utils/cn'

function slugifyPreview(...parts) {
  return parts
    .filter((v) => v != null && String(v).trim() !== '')
    .map((v) =>
      String(v)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    )
    .filter(Boolean)
    .join('-')
}

export default function FleetFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = !!id
  const fileInputRef = useRef(null)
  const newImageFilesRef = useRef([])
  const [newImageFiles, setNewImageFiles] = useState([])
  newImageFilesRef.current = newImageFiles

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      deposit_amount: '0',
      status: 'AVAILABLE',
      transmission: 'MANUAL',
      fuel_type: 'DIESEL',
      seats: 5,
      doors: 4,
      is_active: true,
      is_featured: false,
    },
  })

  const brand = useWatch({ control, name: 'brand' })
  const model = useWatch({ control, name: 'model' })
  const year = useWatch({ control, name: 'year' })
  const licensePlate = useWatch({ control, name: 'license_plate' })
  const slugValue = useWatch({ control, name: 'slug' })

  const suggestedSlug = useMemo(
    () => slugifyPreview(brand, model, year, licensePlate),
    [brand, model, year, licensePlate]
  )

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getList({ limit: 100 }),
  })

  const { data: carData } = useQuery({
    queryKey: ['car', id],
    queryFn: () => carsApi.getById(id),
    enabled: isEdit,
  })

  useEffect(() => {
    if (carData?.data) {
      const c = carData.data
      reset({
        brand: c.brand,
        model: c.model,
        slug: c.slug,
        year: c.year,
        license_plate: c.license_plate,
        category_id: c.category_id,
        price_per_day: c.price_per_day != null ? String(c.price_per_day) : '',
        deposit_amount: c.deposit_amount != null ? String(c.deposit_amount) : '0',
        description_fr: c.description_fr || '',
        description_ar: c.description_ar || '',
        status: c.status || 'AVAILABLE',
        transmission: c.transmission || 'MANUAL',
        fuel_type: c.fuel_type || 'DIESEL',
        seats: c.seats ?? 5,
        doors: c.doors ?? 4,
        is_active: Boolean(c.is_active),
        is_featured: Boolean(c.is_featured),
      })
      setNewImageFiles([])
    }
  }, [carData, reset])

  const addFiles = (fileList) => {
    const accepted = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'))
    if (accepted.length === 0) return
    setNewImageFiles((prev) => {
      const room = Math.max(0, 10 - prev.length)
      const slice = accepted.slice(0, room)
      if (slice.length < accepted.length) {
        toast.error('Maximum 10 images per vehicle')
      }
      const next = [
        ...prev,
        ...slice.map((file) => ({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ]
      return next
    })
  }

  const removeNewImage = (itemId) => {
    setNewImageFiles((prev) => {
      const item = prev.find((i) => i.id === itemId)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((i) => i.id !== itemId)
    })
  }

  useEffect(() => {
    return () => {
      newImageFilesRef.current.forEach((i) => URL.revokeObjectURL(i.previewUrl))
    }
  }, [])

  const mutation = useMutation({
    mutationFn: async (values) => {
      const files = newImageFiles.map((i) => i.file)
      if (isEdit) {
        await carsApi.update(id, values)
        if (files.length === 0) return

        let cached = queryClient.getQueryData(['car', id])
        if (!cached?.data?.images?.length) {
          cached = await carsApi.getById(id)
        }
        const previousImages = cached?.data?.images || []
        for (const img of previousImages) {
          await carsApi.deleteImage(id, img.id)
        }

        const uploaded = await Promise.all(
          files.map((file) => carsApi.addImage(id, file, {}))
        )
        const firstNewId = uploaded[0]?.data?.id
        if (firstNewId != null) {
          await carsApi.setPrimaryImage(id, firstNewId)
        }
        return
      }
      await carsApi.create({ ...values, images: files })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] })
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['car', id] })
      toast.success(isEdit ? 'Vehicle updated successfully' : 'Vehicle added successfully')
      navigate(adminPath('/fleet'))
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to save vehicle')
    },
  })

  const onSubmit = (data) => {
    const slugTrimmed = data.slug?.trim()
    const payload = {
      brand: data.brand,
      model: data.model,
      year: data.year,
      license_plate: data.license_plate,
      category_id: data.category_id,
      price_per_day: data.price_per_day,
      deposit_amount: data.deposit_amount,
      description_fr: data.description_fr || undefined,
      description_ar: data.description_ar || undefined,
      status: data.status,
      transmission: data.transmission,
      fuel_type: data.fuel_type,
      seats: parseInt(data.seats, 10),
      doors: parseInt(data.doors, 10),
      is_active: Boolean(data.is_active),
      is_featured: Boolean(data.is_featured),
    }
    if (slugTrimmed) payload.slug = slugTrimmed
    mutation.mutate(payload)
  }

  const existingImages = carData?.data?.images || []

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          {isEdit && (
            <Link
              to={adminPath('/fleet')}
              className="mb-2 inline-block text-sm font-medium text-gray-500 hover:text-primary"
            >
              ← Back to fleet
            </Link>
          )}
          <h1 className="mb-2 text-3xl font-bold text-secondary">
            {isEdit ? `Edit vehicle` : 'Add New Vehicle'}
            {isEdit && id ? (
              <span className="ml-2 font-mono text-xl font-semibold text-gray-500">#{id}</span>
            ) : null}
          </h1>
          <p className="text-gray-400">
            {isEdit ? 'Update information and save changes below.' : 'Enter the vehicle details below.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Brand</label>
              <Input {...register('brand', { required: 'Brand is required' })} placeholder="e.g. Porsche" error={errors.brand?.message} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Model</label>
              <Input {...register('model', { required: 'Model is required' })} placeholder="e.g. 911 Carrera" error={errors.model?.message} />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                URL slug <span className="font-normal normal-case text-gray-400">(optional)</span>
              </label>
              <Input
                {...register('slug', {
                  pattern: {
                    value: /^[a-z0-9-]*$/,
                    message: 'Only lowercase letters, numbers, and hyphens',
                  },
                })}
                placeholder="e.g. porsche-911-2024-wak-911"
                error={errors.slug?.message}
              />
              <p className="text-xs text-gray-500 mt-1">
                {slugValue?.trim()
                  ? 'Custom slug will be used (server ensures it is unique).'
                  : suggestedSlug
                    ? `If left empty, the server will use: ${suggestedSlug}`
                    : 'Fill brand, model, year, and plate to preview the auto-generated slug.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">License Plate</label>
              <Input {...register('license_plate', { required: 'Required' })} placeholder="e.g. WAK-911" error={errors.license_plate?.message} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Year</label>
              <Input
                type="number"
                {...register('year', {
                  required: 'Year is required',
                  valueAsNumber: true,
                  min: { value: 1990, message: 'Min 1990' },
                  max: { value: new Date().getFullYear() + 1, message: 'Invalid year' },
                })}
                placeholder="e.g. 2023"
                error={errors.year?.message}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Category</label>
              <select
                {...register('category_id', { required: 'Select a category', valueAsNumber: true })}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">Select Category</option>
                {categoriesData?.data?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_fr}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="mt-1 text-xs text-danger">{errors.category_id.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Status</label>
              <select
                {...register('status')}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="AVAILABLE">Available</option>
                <option value="RENTED">Rented</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Transmission</label>
              <select
                {...register('transmission')}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="MANUAL">Manual</option>
                <option value="AUTOMATIC">Automatic</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Fuel type</label>
              <select
                {...register('fuel_type')}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="ESSENCE">Essence</option>
                <option value="DIESEL">Diesel</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ELECTRIC">Electric</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Seats</label>
              <Input
                type="number"
                {...register('seats', { valueAsNumber: true, min: 1, max: 20 })}
                min={1}
                max={20}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Doors</label>
              <Input
                type="number"
                {...register('doors', { valueAsNumber: true, min: 2, max: 6 })}
                min={2}
                max={6}
              />
            </div>

            <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:items-center">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" {...register('is_active')} />
                Active in fleet (visible for rental)
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" {...register('is_featured')} />
                Featured on site
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Price per Day (USD)</label>
              <Input
                type="number"
                step="0.01"
                {...register('price_per_day', { required: 'Required', min: 0 })}
                placeholder="e.g. 150"
                error={errors.price_per_day?.message}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Deposit (USD)</label>
              <Input
                type="number"
                step="0.01"
                {...register('deposit_amount', { required: 'Required', min: 0 })}
                placeholder="e.g. 500"
                error={errors.deposit_amount?.message}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest block">
              Vehicle pictures{' '}
              {!isEdit && (
                <span className="font-normal normal-case text-gray-400">(optional, up to 10)</span>
              )}
            </label>

            {isEdit && (
              <p className="text-xs text-gray-500">
                {existingImages.length > 0
                  ? 'Save without new files keeps these photos. If you add new photos, all previous images are removed and replaced with your new set; the first new file becomes the primary image.'
                  : 'No photos yet. Add images below (optional).'}
              </p>
            )}

            {isEdit && existingImages.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-3">
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative h-20 w-24 overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                    {img.is_primary && (
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                addFiles(e.dataTransfer.files)
              }}
              className={cn(
                'border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition-colors',
                'hover:border-primary/50 hover:bg-red-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files)
                  e.target.value = ''
                }}
              />
              <ImagePlus className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm font-medium text-secondary">Drop images here or click to browse</p>
              <p className="text-xs text-gray-500 mt-1">JPEG, PNG, or WebP — max 10 files, 5 MB each (server limit)</p>
            </div>

            {newImageFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {newImageFiles.map((item) => (
                  <div key={item.id} className="relative group aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(item.id)}
                      className="absolute top-1 right-1 w-8 h-8 rounded-full bg-neutral/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 flex gap-4 justify-end border-t border-gray-100">
            <Button variant="ghost" onClick={() => navigate(adminPath('/fleet'))} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={mutation.isPending}>
              Save Vehicle
            </Button>
          </div>
        </Card>
      </form>
    </motion.div>
  )
}
