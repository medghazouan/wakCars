import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ImagePlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { blogApi } from '@admin/api/blog.api'
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

export default function BlogFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const coverInputRef = useRef(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(null)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      is_published: false,
      is_featured: false,
    },
  })

  const titleFr = watch('title_fr')

  const { data: postRes, isLoading } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => blogApi.getById(id),
    enabled: isEdit,
  })

  const post = postRes?.data

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(coverFile)
    setCoverPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [coverFile])

  useEffect(() => {
    if (!post) return
    reset({
      slug_fr: post.slug_fr,
      slug_ar: post.slug_ar,
      title_fr: post.title_fr,
      title_ar: post.title_ar,
      excerpt_fr: post.excerpt_fr || '',
      excerpt_ar: post.excerpt_ar || '',
      content_fr: post.content_fr,
      content_ar: post.content_ar,
      cover_alt: post.cover_alt || '',
      meta_title_fr: post.meta_title_fr || '',
      meta_title_ar: post.meta_title_ar || '',
      meta_desc_fr: post.meta_desc_fr || '',
      meta_desc_ar: post.meta_desc_ar || '',
      category: post.category || '',
      tags: post.tags || '',
      is_published: post.is_published,
      is_featured: post.is_featured,
    })
    setCoverFile(null)
  }, [post, reset])

  const saveMutation = useMutation({
    mutationFn: async ({ fields, file }) => {
      if (isEdit) {
        await blogApi.update(id, fields)
        if (file) await blogApi.uploadCover(id, file)
        return
      }
      const res = await blogApi.create(fields)
      // apiClient interceptor returns response body: { success, data: post }
      const newId = res?.data?.id
      if (file != null && newId != null) {
        await blogApi.uploadCover(newId, file)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog'] })
      toast.success(isEdit ? 'Article mis à jour' : 'Article créé')
      navigate(adminPath('/blog'))
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur'),
  })

  const onSubmit = (data) => {
    saveMutation.mutate({
      file: coverFile,
      fields: {
        slug_fr: data.slug_fr.trim(),
        slug_ar: data.slug_ar.trim(),
        title_fr: data.title_fr.trim(),
        title_ar: data.title_ar.trim(),
        excerpt_fr: data.excerpt_fr?.trim() || undefined,
        excerpt_ar: data.excerpt_ar?.trim() || undefined,
        content_fr: data.content_fr.trim(),
        content_ar: data.content_ar.trim(),
        cover_alt: data.cover_alt?.trim() || undefined,
        meta_title_fr: data.meta_title_fr?.trim() || undefined,
        meta_title_ar: data.meta_title_ar?.trim() || undefined,
        meta_desc_fr: data.meta_desc_fr?.trim() || undefined,
        meta_desc_ar: data.meta_desc_ar?.trim() || undefined,
        category: data.category?.trim() || undefined,
        tags: data.tags?.trim() || undefined,
        is_published: Boolean(data.is_published),
        is_featured: Boolean(data.is_featured),
      },
    })
  }

  const pickCover = (fileList) => {
    const f = fileList?.[0]
    if (!f || !f.type.startsWith('image/')) return
    setCoverFile(f)
  }

  const clearPendingCover = () => {
    setCoverFile(null)
  }

  const displayCoverSrc = coverPreviewUrl || post?.cover_image || ''

  if (isEdit && isLoading) {
    return <div className="p-8 text-center text-gray-500">Chargement…</div>
  }

  if (isEdit && !post) {
    return (
      <div className="p-8">
        <p className="mb-4 font-medium">Article introuvable.</p>
        <Button type="button" onClick={() => navigate(adminPath('/blog'))}>
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
      className="mx-auto min-w-0 w-full max-w-5xl space-y-8"
    >
      <div className="min-w-0">
        <h1 className="mb-2 text-2xl font-bold text-secondary sm:text-3xl">{isEdit ? 'Modifier l’article' : 'Nouvel article'}</h1>
        <p className="text-gray-500">Contenu bilingue aligné sur le site public.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-8 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Slug FR *</label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <Input className="min-w-0 flex-1" {...register('slug_fr', { required: 'Requis' })} error={errors.slug_fr?.message} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full shrink-0 sm:w-auto"
                  onClick={() => setValue('slug_fr', slugifyFr(titleFr))}
                >
                  Auto
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Slug AR *</label>
              <Input {...register('slug_ar', { required: 'Requis' })} error={errors.slug_ar?.message} dir="rtl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Titre FR *</label>
              <Input {...register('title_fr', { required: 'Requis' })} error={errors.title_fr?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Titre AR *</label>
              <Input {...register('title_ar', { required: 'Requis' })} error={errors.title_ar?.message} dir="rtl" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Extrait FR</label>
              <textarea {...register('excerpt_fr')} rows={3} className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Extrait AR</label>
              <textarea {...register('excerpt_ar')} rows={3} className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm" dir="rtl" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Contenu FR *</label>
              <textarea
                {...register('content_fr', { required: 'Requis' })}
                rows={12}
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Contenu AR *</label>
              <textarea
                {...register('content_ar', { required: 'Requis' })}
                rows={12}
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 font-mono text-sm"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3 md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                Image de couverture
              </label>
              <p className="text-xs text-gray-500">JPEG, PNG ou WebP (max 5 Mo). Envoyée sur Cloudinary comme pour les véhicules.</p>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  pickCover(e.target.files)
                  e.target.value = ''
                }}
              />

              {displayCoverSrc ? (
                <div className="relative inline-block max-w-md">
                  <div className="aspect-[16/10] max-h-52 w-full max-w-md overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                    <img src={displayCoverSrc} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {coverFile ? (
                      <Button type="button" variant="outline" size="sm" onClick={clearPendingCover}>
                        Annuler le nouveau fichier
                      </Button>
                    ) : null}
                    <Button type="button" variant="outline" size="sm" onClick={() => coverInputRef.current?.click()}>
                      {displayCoverSrc && !coverFile ? 'Remplacer l’image' : 'Choisir une image'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      coverInputRef.current?.click()
                    }
                  }}
                  onClick={() => coverInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    pickCover(e.dataTransfer.files)
                  }}
                  className={cn(
                    'cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition-colors',
                    'hover:border-primary/50 hover:bg-red-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                  )}
                >
                  <ImagePlus className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm font-medium text-secondary">Glissez une image ou cliquez</p>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Alt image</label>
              <Input {...register('cover_alt')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Catégorie</label>
              <Input {...register('category')} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Tags</label>
              <Input {...register('tags')} placeholder="JSON ou texte libre" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Meta title FR</label>
              <Input {...register('meta_title_fr')} maxLength={70} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Meta title AR</label>
              <Input {...register('meta_title_ar')} maxLength={70} dir="rtl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Meta desc FR</label>
              <Input {...register('meta_desc_fr')} maxLength={165} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Meta desc AR</label>
              <Input {...register('meta_desc_ar')} maxLength={165} dir="rtl" />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="rounded border-gray-300 text-primary" {...register('is_published')} />
              Publié
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="rounded border-gray-300 text-primary" {...register('is_featured')} />
              À la une
            </label>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end sm:gap-3 sm:pt-6">
            <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => navigate(adminPath('/blog'))}>
              Annuler
            </Button>
            <Button type="submit" className="w-full sm:w-auto" isLoading={saveMutation.isPending}>
              Enregistrer
            </Button>
          </div>
        </Card>
      </form>
    </motion.div>
  )
}
