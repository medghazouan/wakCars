import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { ar, fr } from 'date-fns/locale'
import { AlertCircle, CheckCircle, Clock, Wrench, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { technicalVisitsApi } from '@admin/api/insurance.api'
import { dashboardApi } from '@admin/api/dashboard.api'
import { pageTransition } from '@admin/animations/variants'
import { Button } from '@admin/components/ui/Button'
import { StatsCard } from '@admin/components/ui/StatsCard'
import { DataTable } from '@admin/components/ui/DataTable'
import { StatusBadge } from '@admin/components/ui/StatusBadge'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'

export default function TechnicalReviewsListPage() {
  const { t, currentLanguage } = useAdminLanguage()
  const dateLocale = currentLanguage === 'ar' ? ar : fr
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['technical-visits', page],
    queryFn: () => technicalVisitsApi.getList({ page, limit: 10 }),
  })

  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => technicalVisitsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-visits'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(t('page.technical.toastDeleted'))
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || t('page.technical.toastDeleteErr'))
    },
  })

  const tech = dashData?.data?.technical || {}
  const stats = {
    compliant: tech.compliant ?? 0,
    compliantPct: tech.compliantPct ?? 0,
    dueSoon: tech.dueSoon ?? 0,
    dueSoonPct: tech.dueSoonPct ?? 0,
    critical: tech.critical ?? 0,
    criticalPct: tech.criticalPct ?? 0,
  }

  const pagination = useMemo(() => {
    const m = data?.meta
    if (!m || m.total == null || !m.limit) return undefined
    return {
      ...m,
      totalPages: Math.max(1, Math.ceil(m.total / m.limit)),
    }
  }, [data?.meta])

  const getStatus = (visit) => {
    if (!visit.expiration_date) return 'COMPLIANT'
    const today = new Date()
    const expiry = new Date(visit.expiration_date)
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))

    if (expiry < today) return 'CRITICAL'
    if (daysUntilExpiry <= 30) return 'DUE_SOON'
    return 'COMPLIANT'
  }

  const columnsFull = useMemo(
    () => [
      {
        key: 'car',
        label: t('page.insurance.vehicle'),
        render: (v) => (
          <div>
            <p className="font-bold text-secondary">
              {v.car?.brand} {v.car?.model}
            </p>
            <p className="font-mono text-xs text-gray-500">{v.car?.license_plate}</p>
          </div>
        ),
      },
      {
        key: 'visit_date',
        label: t('page.technical.visitDate'),
        render: (v) => (
          <div>
            <p className="font-medium text-gray-700">
              {format(parseISO(v.visit_date), 'd MMM yyyy', { locale: dateLocale })}
            </p>
            <p className="text-xs text-gray-500">{format(parseISO(v.visit_date), 'EEEE', { locale: dateLocale })}</p>
          </div>
        ),
      },
      {
        key: 'expiration',
        label: t('page.technical.expiration'),
        render: (v) => (
          <div>
            {v.expiration_date ? (
              <>
                <p className="font-medium text-gray-700">
                  {format(parseISO(v.expiration_date), 'd MMM yyyy', { locale: dateLocale })}
                </p>
                <p className="text-xs text-gray-500">
                  {t('page.technical.daysValidCount', {
                    count: Math.ceil(
                      (new Date(v.expiration_date) - new Date(v.visit_date)) / (1000 * 60 * 60 * 24)
                    ),
                  })}
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-500">{t('page.technical.noExpiration')}</p>
            )}
          </div>
        ),
      },
      {
        key: 'cost',
        label: t('page.technical.cost'),
        render: (v) => (
          <p className="font-semibold text-secondary">
            ${v.cost ? parseFloat(v.cost).toFixed(2) : '0.00'}
          </p>
        ),
      },
      {
        key: 'status',
        label: t('page.insurance.status'),
        render: (v) => {
          const status = getStatus(v)
          return <StatusBadge status={status} />
        },
      },
      {
        key: 'actions',
        label: t('common.actions'),
        headerClassName: 'text-right',
        cellClassName: 'text-right',
        render: (v) => (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="h-8"
              onClick={() => navigate(adminPath(`/technical-reviews/${v.id}/edit`))}
            >
              {t('common.edit')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-danger hover:text-red-700"
              type="button"
              isLoading={deleteMutation.isPending && deleteMutation.variables === v.id}
              onClick={() => {
                if (window.confirm(t('page.technical.deleteConfirm'))) {
                  deleteMutation.mutate(v.id)
                }
              }}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      },
    ],
    [t, navigate, deleteMutation, dateLocale]
  )

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="mx-auto min-w-0 w-full max-w-[1600px] space-y-8"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatsCard
          title={t('page.technical.compliantVehicles')}
          value={dashLoading ? '…' : stats.compliant}
          icon={CheckCircle}
          badgeText={dashLoading ? '…' : `${stats.compliantPct}%`}
          badgeVariant="success"
        />
        <StatsCard
          title={t('page.insurance.dueSoon')}
          value={dashLoading ? '…' : stats.dueSoon}
          icon={Clock}
          badgeText={dashLoading ? '…' : `${stats.dueSoonPct}%`}
          badgeVariant="warning"
        />
        <StatsCard
          title={t('page.insurance.criticalExpired')}
          value={dashLoading ? '…' : stats.critical}
          icon={AlertCircle}
          badgeText={dashLoading ? '…' : `${stats.criticalPct}%`}
          badgeVariant="danger"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-secondary">{t('page.technical.title')}</h2>
            <p className="text-sm text-gray-400">{t('page.technical.subtitle')}</p>
          </div>
          <Button
            onClick={() => navigate(adminPath('/technical-reviews/new'))}
            className="w-full bg-primary text-white hover:bg-primary/90 sm:w-auto"
          >
            <Wrench size={16} className="me-2" />
            {t('page.technical.newVisit')}
          </Button>
        </div>

        <DataTable
          columns={columnsFull}
          data={data?.data || []}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
        />
      </div>
    </motion.div>
  )
}
