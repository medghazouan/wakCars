import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { faqsApi } from '@admin/api/faqs.api'
import { FAQ_CATEGORIES } from '@admin/constants/faqCategories'
import { pageTransition } from '@admin/animations/variants'
import { Input } from '@admin/components/ui/Input'
import { Button } from '@admin/components/ui/Button'
import { Card } from '@admin/components/ui/Card'

export default function FaqFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { sort_order: 0, is_published: true },
  })

  const { data: faqRes, isLoading } = useQuery({
    queryKey: ['faq', id],
    queryFn: () => faqsApi.getById(id),
    enabled: isEdit,
  })

  const faq = faqRes?.data

  useEffect(() => {
    if (!faq) return
    reset({
      question_fr: faq.question_fr,
      question_ar: faq.question_ar,
      answer_fr: faq.answer_fr,
      answer_ar: faq.answer_ar,
      category: faq.category,
      sort_order: faq.sort_order,
      is_published: faq.is_published,
    })
  }, [faq, reset])

  const saveMutation = useMutation({
    mutationFn: (payload) => (isEdit ? faqsApi.update(id, payload) : faqsApi.create(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] })
      toast.success(isEdit ? 'FAQ mise à jour' : 'FAQ créée')
      navigate(adminPath('/faqs'))
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur'),
  })

  const onSubmit = (data) => {
    saveMutation.mutate({
      question_fr: data.question_fr.trim(),
      question_ar: data.question_ar.trim(),
      answer_fr: data.answer_fr.trim(),
      answer_ar: data.answer_ar.trim(),
      category: data.category,
      sort_order: parseInt(data.sort_order, 10) || 0,
      is_published: Boolean(data.is_published),
    })
  }

  if (isEdit && isLoading) {
    return <div className="p-8 text-center text-gray-500">Chargement…</div>
  }

  if (isEdit && !faq) {
    return (
      <div className="p-8">
        <p className="mb-4 font-medium">FAQ introuvable.</p>
        <Button type="button" onClick={() => navigate(adminPath('/faqs'))}>
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
      className="mx-auto min-w-0 w-full max-w-4xl space-y-8"
    >
      <div className="min-w-0">
        <h1 className="mb-2 text-2xl font-bold text-secondary sm:text-3xl">{isEdit ? 'Modifier la FAQ' : 'Nouvelle FAQ'}</h1>
        <p className="text-gray-500">Les catégories sont fixes pour rester alignées avec le site.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Catégorie *</label>
              <select
                {...register('category', { required: 'Requis' })}
                className="flex h-10 w-full max-w-md rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {FAQ_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-danger">{errors.category.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Question FR *</label>
              <Input {...register('question_fr', { required: 'Requis' })} error={errors.question_fr?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Question AR *</label>
              <Input {...register('question_ar', { required: 'Requis' })} error={errors.question_ar?.message} dir="rtl" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Réponse FR *</label>
              <textarea
                {...register('answer_fr', { required: 'Requis' })}
                rows={6}
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Réponse AR *</label>
              <textarea
                {...register('answer_ar', { required: 'Requis' })}
                rows={6}
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
                dir="rtl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Ordre</label>
              <Input type="number" {...register('sort_order')} min={0} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" className="rounded border-gray-300 text-primary" {...register('is_published')} />
              <span className="text-sm text-gray-700">Publiée sur le site</span>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end sm:gap-3 sm:pt-6">
            <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => navigate(adminPath('/faqs'))}>
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
