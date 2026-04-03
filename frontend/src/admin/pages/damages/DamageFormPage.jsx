import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { damagesApi } from '@admin/api/damages.api'
import { carsApi } from '@admin/api/cars.api'
import { reservationsApi } from '@admin/api/reservations.api'
import { pageTransition } from '@admin/animations/variants'
import { Input } from '@admin/components/ui/Input'
import { Button } from '@admin/components/ui/Button'
import { Card } from '@admin/components/ui/Card'

export default function DamageFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [files, setFiles] = useState([])

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { customer_notified: false, resolved: false },
  })

  const { data: reportRes, isLoading: loadingReport } = useQuery({
    queryKey: ['damage', id],
    queryFn: () => damagesApi.getById(id),
    enabled: isEdit,
  })

  const { data: carsRes } = useQuery({
    queryKey: ['cars', 'damages-form'],
    queryFn: () => carsApi.getList({ limit: 300, is_active: true }),
  })

  const { data: resList } = useQuery({
    queryKey: ['reservations', 'damage-form'],
    queryFn: () => reservationsApi.getList({ limit: 200, page: 1 }),
  })

  const report = reportRes?.data
  const cars = carsRes?.data || []
  const reservations = resList?.data || []

  useEffect(() => {
    if (!report) return
    reset({
      car_id: report.car_id,
      reservation_id: report.reservation_id ?? '',
      description: report.description,
      estimated_cost: report.estimated_cost != null ? String(report.estimated_cost) : '',
      customer_notified: report.customer_notified,
      resolved: report.resolved,
    })
  }, [report, reset])

  const createMutation = useMutation({
    mutationFn: (formData) => damagesApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['damages'] })
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Constat enregistré')
      navigate(adminPath('/damages'))
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Échec'),
  })

  const updateMutation = useMutation({
    mutationFn: (payload) => damagesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['damages'] })
      queryClient.invalidateQueries({ queryKey: ['damage', id] })
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Mis à jour')
      navigate(adminPath('/damages'))
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Échec'),
  })

  const addImageMutation = useMutation({
    mutationFn: (file) => damagesApi.addImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['damage', id] })
      toast.success('Photo ajoutée')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Upload échoué'),
  })

  const deleteImageMutation = useMutation({
    mutationFn: ({ imageId }) => damagesApi.deleteImage(id, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['damage', id] })
      toast.success('Photo supprimée')
    },
  })

  const notifyMutation = useMutation({
    mutationFn: () => damagesApi.notifyCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['damage', id] })
      toast.success('Client notifié par email')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Notification impossible'),
  })

  const onCreate = (data) => {
    const fd = new FormData()
    fd.append('car_id', String(data.car_id))
    fd.append('description', data.description)
    if (data.reservation_id) fd.append('reservation_id', String(data.reservation_id))
    if (data.estimated_cost) fd.append('estimated_cost', String(data.estimated_cost).replace(',', '.'))
    fd.append('customer_notified', data.customer_notified ? 'true' : 'false')
    files.forEach((f) => fd.append('images', f))
    createMutation.mutate(fd)
  }

  const onUpdate = (data) => {
    updateMutation.mutate({
      description: data.description,
      estimated_cost: data.estimated_cost ? parseFloat(String(data.estimated_cost).replace(',', '.')) : undefined,
      resolved: Boolean(data.resolved),
      customer_notified: Boolean(data.customer_notified),
    })
  }

  if (isEdit && loadingReport) {
    return <div className="p-8 text-center text-gray-500">Chargement…</div>
  }

  if (isEdit && !report) {
    return (
      <div className="p-8">
        <p className="mb-4 font-medium text-secondary">Constat introuvable.</p>
        <Button type="button" onClick={() => navigate(adminPath('/damages'))}>
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
      className="mx-auto min-w-0 w-full max-w-3xl space-y-8"
    >
      <div className="min-w-0">
        <h1 className="mb-2 text-2xl font-bold text-secondary sm:text-3xl">
          {isEdit ? `Sinistre #${id}` : 'Nouveau constat'}
        </h1>
        <p className="text-gray-500">
          {isEdit ? 'Modifier le constat et les photos.' : 'Déclarer un dommage et joindre des photos.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(isEdit ? onUpdate : onCreate)}>
        <Card className="space-y-6 p-4 sm:p-6">
          {!isEdit && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Véhicule *</label>
                <select
                  {...register('car_id', { required: 'Requis' })}
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
                >
                  <option value="">—</option>
                  {cars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.brand} {c.model} · {c.license_plate}
                    </option>
                  ))}
                </select>
                {errors.car_id && <p className="text-xs text-danger">{errors.car_id.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                  Réservation (optionnel)
                </label>
                <select {...register('reservation_id')} className="flex h-10 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm">
                  <option value="">—</option>
                  {reservations.map((r) => (
                    <option key={r.id} value={r.id}>
                      #{r.id} · {r.car?.brand} {r.car?.model}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {isEdit && report?.car && (
            <div className="rounded-lg bg-gray-100 px-4 py-3 text-sm">
              <span className="text-[10px] font-semibold uppercase text-gray-500">Véhicule</span>
              <p className="mt-1 font-semibold">
                {report.car.brand} {report.car.model} · {report.car.license_plate}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Description *</label>
            <textarea
              {...register('description', { required: 'Requis' })}
              rows={5}
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {errors.description && <p className="text-xs text-danger">{errors.description.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Coût estimé (MAD)</label>
            <Input type="text" {...register('estimated_cost')} placeholder="0.00" />
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Photos</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="text-sm"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="rounded border-gray-300 text-primary" {...register('customer_notified')} />
              Client notifié
            </label>
            {isEdit && (
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-gray-300 text-primary" {...register('resolved')} />
                Clôturé
              </label>
            )}
          </div>

          {isEdit && report?.images?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase text-gray-500">Photos</p>
              <div className="flex flex-wrap gap-3">
                {report.images.map((img) => (
                  <div key={img.id} className="relative">
                    <img src={img.url} alt="" className="h-24 w-32 rounded-lg object-cover" />
                    <button
                      type="button"
                      className="mt-1 text-xs text-danger hover:underline"
                      onClick={() => {
                        if (window.confirm('Supprimer cette photo ?')) deleteImageMutation.mutate({ imageId: img.id })
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) addImageMutation.mutate(f)
                    e.target.value = ''
                  }}
                  className="text-sm"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3 sm:pt-6">
            <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => navigate(adminPath('/damages'))}>
              Annuler
            </Button>
            {isEdit && report?.reservation_id && (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                isLoading={notifyMutation.isPending}
                onClick={() => notifyMutation.mutate()}
              >
                Envoyer email client
              </Button>
            )}
            <Button
              type="submit"
              className="w-full sm:w-auto"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {isEdit ? 'Enregistrer' : 'Créer le constat'}
            </Button>
          </div>
        </Card>
      </form>
    </motion.div>
  )
}
