import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { categoriesApi } from '@admin/api/categories.api'
import { pageTransition } from '@admin/animations/variants'
import { Input } from '@admin/components/ui/Input'
import { Button } from '@admin/components/ui/Button'
import { Card } from '@admin/components/ui/Card'

function slugifyFr(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function CategoryFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      sort_order: 0,
      is_active: true,
    },
  })

  const nameFr = watch('name_fr')
  const slugField = watch('slug')

  const { data: catRes, isLoading } = useQuery({
    queryKey: ['category', id],
    queryFn: () => categoriesApi.getById(id),
    enabled: isEdit,
  })

  const category = catRes?.data

  useEffect(() => {
    if (!category) return
    reset({
      name_fr: category.name_fr,
      name_ar: category.name_ar,
      slug: category.slug,
      desc_fr: category.desc_fr || '',
      desc_ar: category.desc_ar || '',
      sort_order: category.sort_order ?? 0,
      is_active: Boolean(category.is_active),
    })
  }, [category, reset])

  const suggestedSlug = useMemo(() => slugifyFr(nameFr), [nameFr])

  const mutation = useMutation({
    mutationFn: (payload) => (isEdit ? categoriesApi.update(id, payload) : categoriesApi.create(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category', id] })
      toast.success(isEdit ? 'Catégorie mise à jour' : 'Catégorie créée')
      navigate(adminPath('/categories'))
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Enregistrement impossible'),
  })

  const onSubmit = (data) => {
    const slug = (data.slug?.trim() || slugifyFr(data.name_fr) || '').trim()
    if (!slug) {
      toast.error('Slug requis (remplissez le nom FR ou le slug)')
      return
    }
    const payload = {
      name_fr: data.name_fr.trim(),
      name_ar: data.name_ar.trim(),
      slug,
      desc_fr: data.desc_fr?.trim() || undefined,
      desc_ar: data.desc_ar?.trim() || undefined,
      sort_order: parseInt(data.sort_order, 10) || 0,
    }
    if (isEdit) payload.is_active = Boolean(data.is_active)
    mutation.mutate(payload)
  }

  if (isEdit && isLoading) {
    return <div className="p-8 text-center text-gray-500">Chargement…</div>
  }

  if (isEdit && !category) {
    return (
      <div className="p-8">
        <p className="mb-4 font-medium">Catégorie introuvable.</p>
        <Button type="button" onClick={() => navigate(adminPath('/categories'))}>
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
        <Link to={adminPath('/categories')} className="mb-2 inline-block text-sm font-medium text-gray-500 hover:text-primary">
          ← Catégories
        </Link>
        <h1 className="mb-2 text-2xl font-bold text-secondary sm:text-3xl">{isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h1>
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
                      message: 'Lettres minuscules, chiffres et tirets uniquement',
                    },
                  })}
                  placeholder={suggestedSlug || 'ex. suv-premium'}
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
                {slugField?.trim()
                  ? 'Slug personnalisé.'
                  : suggestedSlug
                    ? `Si vide à l’enregistrement : ${suggestedSlug}`
                    : 'Renseignez le nom FR pour générer le slug.'}
              </p>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Description (FR)</label>
              <textarea
                {...register('desc_fr')}
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Description (AR)</label>
              <textarea
                {...register('desc_ar')}
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
                dir="rtl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Ordre d’affichage</label>
              <Input type="number" min={0} {...register('sort_order', { valueAsNumber: true })} />
            </div>

            {isEdit ? (
              <label className="flex cursor-pointer items-center gap-2 self-end pt-2 text-sm text-gray-700 md:col-span-1">
                <input type="checkbox" className="rounded border-gray-300 text-primary" {...register('is_active')} />
                Catégorie active
              </label>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end sm:gap-3 sm:pt-6">
            <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => navigate(adminPath('/categories'))}>
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
