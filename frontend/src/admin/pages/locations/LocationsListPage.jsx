import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { MapPin, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { locationsApi } from '@admin/api/locations.api'
import { pageTransition } from '@admin/animations/variants'
import { Button } from '@admin/components/ui/Button'
import { DataTable } from '@admin/components/ui/DataTable'
import { StatsCard } from '@admin/components/ui/StatsCard'
import { useAuth } from '@admin/hooks/useAuth'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'

function firstImageUrl(images) {
  if (!images) return null
  if (Array.isArray(images) && images.length > 0) return images[0]
  if (typeof images === 'string') {
    try {
      const j = JSON.parse(images)
      return Array.isArray(j) && j[0] ? j[0] : null
    } catch {
      return null
    }
  }
  return null
}

export default function LocationsListPage() {
  const { t } = useAdminLanguage()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isAdmin = useAuth((s) => s.admin?.role) === 'ADMIN'

  const { data, isLoading } = useQuery({
    queryKey: ['locations', 'admin-list'],
    queryFn: () => locationsApi.getList(),
  })

  const rows = data?.data || []

  const deleteMutation = useMutation({
    mutationFn: (id) => locationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      toast.success(t('page.locations.toastDeleted'))
    },
    onError: (err) => toast.error(err.response?.data?.error || t('page.locations.toastDeleteErr')),
  })

  const columns = useMemo(
    () => [
      {
        key: 'img',
        label: '',
        render: (loc) => {
          const src = firstImageUrl(loc.images)
          return src ? (
            <div className="h-12 w-16 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-gray-100 text-[10px] text-gray-400">
              —
            </div>
          )
        },
      },
      {
        key: 'names',
        label: t('page.locations.colPlace'),
        render: (loc) => (
          <div className="min-w-0">
            <p className="font-medium text-secondary">{loc.name_fr}</p>
            <p className="truncate text-xs text-gray-500" dir="rtl">
              {loc.name_ar}
            </p>
          </div>
        ),
      },
      {
        key: 'slug',
        label: t('page.locations.colSlug'),
        render: (loc) => <span className="font-mono text-xs text-gray-600">{loc.slug}</span>,
      },
      {
        key: 'city',
        label: t('page.locations.colCity'),
        render: (loc) => loc.city || '—',
      },
      {
        key: 'actions',
        label: '',
        render: (loc) => (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" type="button" onClick={() => navigate(adminPath(`/locations/${loc.id}`))}>
              {t('common.edit')}
            </Button>
            {isAdmin ? (
              <Button
                size="sm"
                variant="danger"
                type="button"
                isLoading={deleteMutation.isPending && deleteMutation.variables === loc.id}
                onClick={() => {
                  if (window.confirm(t('page.locations.deleteConfirm'))) {
                    deleteMutation.mutate(loc.id)
                  }
                }}
              >
                {t('common.delete')}
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [t, navigate, isAdmin, deleteMutation]
  )

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="mx-auto min-w-0 w-full max-w-[1600px] space-y-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-secondary sm:text-3xl">{t('page.locations.title')}</h1>
          <p className="text-gray-500">{t('page.locations.subtitle')}</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => navigate(adminPath('/locations/new'))}>
          <Plus size={18} className="me-1" />
          {t('page.locations.add')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatsCard
          title={t('page.locations.statsTitle')}
          value={String(rows.length)}
          icon={MapPin}
          badgeText={t('page.locations.statsBadge')}
          badgeVariant="neutral"
        />
      </div>

      <DataTable columns={columns} data={rows} isLoading={isLoading} emptyMessage={t('page.locations.empty')} />
    </motion.div>
  )
}
