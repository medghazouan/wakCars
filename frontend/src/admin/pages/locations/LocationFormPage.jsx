import { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ImagePlus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { locationsApi } from '@admin/api/locations.api'
import { pageTransition } from '@admin/animations/variants'
import { Input } from '@admin/components/ui/Input'
import { Button } from '@admin/components/ui/Button'
import { Card } from '@admin/components/ui/Card'
import { cn } from '@admin/utils/cn'

function slugifyFr(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalizeImages(images) {
  if (!images) return []
  if (Array.isArray(images)) return images.filter((u) => typeof u === 'string' && u.trim())
  if (typeof images === 'string') {
    try {
      const j = JSON.parse(images)
      return Array.isArray(j) ? j.filter((u) => typeof u === 'string' && u.trim()) : []
    } catch {
      return []
    }
  }
  return []
}

export default function LocationFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const newFilesRef = useRef([])
  const [newFiles, setNewFiles] = useState([])
  const [removedUrls, setRemovedUrls] = useState([])
  newFilesRef.current = newFiles

  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm({
    defaultValues: { city: 'Marrakech' },
  })

  const nameFr = useWatch({ control, name: 'name_fr' })
  const slugValue = useWatch({ control, name: 'slug' })

  const suggestedSlug = useMemo(() => slugifyFr(nameFr), [nameFr])

  const { data: locRes, isLoading } = useQuery({
    queryKey: ['location', id],
    queryFn: () => locationsApi.getById(id),
    enabled: isEdit,
  })

  const location = locRes?.data
  const initialUrls = useMemo(() => normalizeImages(location?.images), [location?.images])

  useEffect(() => {
    if (!location) return
    reset({
      name_fr: location.name_fr,
      name_ar: location.name_ar,
      slug: location.slug,
      address_fr: location.address_fr,
      address_ar: location.address_ar,
      city: location.city || 'Marrakech',
    })
    setRemovedUrls([])
    setNewFiles([])
  }, [location, reset])

  useEffect(() => {
    return () => {
      newFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
  }, [newFiles])

  const addFiles = (fileList) => {
    const accepted = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'))
    if (accepted.length === 0) return
    setNewFiles((prev) => {
      const room = Math.max(0, 20 - prev.length - Math.max(0, initialUrls.length - removedUrls.length))
      const slice = accepted.slice(0, room)
      if (slice.length < accepted.length) toast.error('Maximum 20 images par lieu')
      return [
        ...prev,
        ...slice.map((file) => ({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ]
    })
  }

  const removeNewFile = (itemId) => {
    setNewFiles((prev) => {
      const item = prev.find((i) => i.id === itemId)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((i) => i.id !== itemId)
    })
  }

  const mutation = useMutation({
    mutationFn: async ({ fields, files, edit }) => {
      if (edit) {
        await locationsApi.update(id, fields)
        for (const f of files) {
          await locationsApi.addImage(id, f)
        }
        return
      }
      const res = await locationsApi.create(fields)
      const locId = res?.data?.id
      if (!locId) throw new Error('Réponse serveur invalide')
      for (const f of files) {
        await locationsApi.addImage(locId, f)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['location', id] })
      toast.success(isEdit ? 'Lieu mis à jour' : 'Lieu créé')
      navigate(adminPath('/locations'))
    },
    onError: (err) => toast.error(err.response?.data?.error || err.message || 'Enregistrement impossible'),
  })

  const onSubmit = (data) => {
    const slug = (data.slug?.trim() || slugifyFr(data.name_fr) || '').trim()
    if (!slug) {
      toast.error('Slug requis')
      return
    }
    const remaining = initialUrls.filter((u) => !removedUrls.includes(u))
    const fields = {
      name_fr: data.name_fr.trim(),
      name_ar: data.name_ar.trim(),
      slug,
      address_fr: data.address_fr.trim(),
      address_ar: data.address_ar.trim(),
      city: data.city?.trim() || 'Marrakech',
    }
    if (isEdit) {
      fields.images = remaining
    }
    const files = newFiles.map((x) => x.file)
    mutation.mutate({ fields, files, edit: isEdit })
  }

  const visibleExisting = initialUrls.filter((u) => !removedUrls.includes(u))

  if (isEdit && isLoading) {
    return <div className="p-8 text-center text-gray-500">Chargement…</div>
  }

  if (isEdit && !location) {
    return (
      <div className="p-8">
        <p className="mb-4 font-medium">Lieu introuvable.</p>
        <Button type="button" onClick={() => navigate(adminPath('/locations'))}>
          Retour
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
      className="mx-auto min-w-0 w-full max-w-3xl space-y-6 sm:space-y-8"
    >
      <div className="min-w-0">
        <Link to={adminPath('/locations')} className="mb-2 inline-block text-sm font-medium text-gray-500 hover:text-primary">
          ← Lieux
        </Link>
        <h1 className="mb-2 text-2xl font-bold text-secondary sm:text-3xl">{isEdit ? 'Modifier le lieu' : 'Nouveau lieu'}</h1>
        <p className="text-sm text-gray-500">Photos : JPEG, PNG ou WebP — upload vers le cloud après enregistrement.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Nom (FR) *</label>
              <Input {...register('name_fr', { required: 'Requis' })} error={errors.name_fr?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Nom (AR) *</label>
              <Input {...register('name_ar', { required: 'Requis' })} error={errors.name_ar?.message} dir="rtl" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Slug *</label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <Input
                  className="min-w-0 flex-1 font-mono text-sm"
                  {...register('slug', {
                    pattern: {
                      value: /^[a-z0-9-]+$/,
                      message: 'Lettres minuscules, chiffres et tirets',
                    },
                  })}
                  placeholder={suggestedSlug || 'ex. aeroport-menara'}
                  error={errors.slug?.message}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full shrink-0 sm:w-auto"
                  onClick={() => setValue('slug', suggestedSlug, { shouldValidate: true })}
                >
                  Auto (FR)
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                {slugValue?.trim() ? 'Slug personnalisé.' : suggestedSlug ? `Si vide : ${suggestedSlug}` : 'Renseignez le nom FR.'}
              </p>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Adresse (FR) *</label>
              <Input {...register('address_fr', { required: 'Requis' })} error={errors.address_fr?.message} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Adresse (AR) *</label>
              <Input {...register('address_ar', { required: 'Requis' })} error={errors.address_ar?.message} dir="rtl" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Ville</label>
              <Input {...register('city')} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 block">Photos du lieu</label>
            {visibleExisting.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {visibleExisting.map((url) => (
                  <div key={url} className="relative h-24 w-32 overflow-hidden rounded-lg border border-gray-200">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      className="absolute end-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                      aria-label="Retirer"
                      onClick={() => setRemovedUrls((p) => [...p, url])}
                    >
                      <X size={14} />
                    </button>
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
                'cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition-colors',
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
              <ImagePlus className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="text-sm font-medium text-secondary">Glissez des images ou cliquez</p>
              <p className="mt-1 text-xs text-gray-500">Ajoutées après enregistrement (cloud). Max 20 au total.</p>
            </div>

            {newFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {newFiles.map((item) => (
                  <div key={item.id} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                    <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewFile(item.id)}
                      className="absolute end-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-neutral/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Retirer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end sm:gap-3 sm:pt-6">
            <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => navigate(adminPath('/locations'))}>
              Annuler
            </Button>
            <Button type="submit" className="w-full sm:w-auto" isLoading={mutation.isPending}>
              Enregistrer
            </Button>
          </div>
        </Card>
      </form>
    </motion.div>
  )
}
