import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
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
import { cn } from '@admin/utils/cn'

export default function TechnicalReviewsListPage() {
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
      toast.success('Technical visit record deleted')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Could not delete record')
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

  const columns = [
    {
      key: 'car',
      label: 'Vehicle',
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
      label: 'Visit Date',
      render: (v) => (
        <div>
          <p className="font-medium text-gray-700">
            {format(parseISO(v.visit_date), 'MMM dd, yyyy')}
          </p>
          <p className="text-xs text-gray-500">
            {format(parseISO(v.visit_date), 'EEEE')}
          </p>
        </div>
      ),
    },
    {
      key: 'expiration',
      label: 'Expiration Date',
      render: (v) => (
        <div>
          {v.expiration_date ? (
            <>
              <p className="font-medium text-gray-700">
                {format(parseISO(v.expiration_date), 'MMM dd, yyyy')}
              </p>
              <p className="text-xs text-gray-500">
                {Math.ceil(
                  (new Date(v.expiration_date) - new Date(v.visit_date)) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                days valid
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-500">No expiration</p>
          )}
        </div>
      ),
    },
    {
      key: 'cost',
      label: 'Cost',
      render: (v) => (
        <p className="font-semibold text-secondary">
          ${v.cost ? parseFloat(v.cost).toFixed(2) : '0.00'}
        </p>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const status = getStatus(v)
        return <StatusBadge status={status} />
      },
    },
    {
      key: 'actions',
      label: 'Actions',
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
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-danger hover:text-red-700"
            type="button"
            isLoading={deleteMutation.isPending && deleteMutation.variables === v.id}
            onClick={() => {
              if (confirm('Are you sure you want to delete this record?')) {
                deleteMutation.mutate(v.id)
              }
            }}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ]

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
          title="Compliant Vehicles"
          value={dashLoading ? '…' : stats.compliant}
          icon={CheckCircle}
          badgeText={dashLoading ? '…' : `${stats.compliantPct}%`}
          badgeVariant="success"
        />
        <StatsCard
          title="Due Soon"
          value={dashLoading ? '…' : stats.dueSoon}
          icon={Clock}
          badgeText={dashLoading ? '…' : `${stats.dueSoonPct}%`}
          badgeVariant="warning"
        />
        <StatsCard
          title="Critical / Expired"
          value={dashLoading ? '…' : stats.critical}
          icon={AlertCircle}
          badgeText={dashLoading ? '…' : `${stats.criticalPct}%`}
          badgeVariant="danger"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-secondary">Technical Reviews</h2>
            <p className="text-sm text-gray-400">Manage fleet technical visits and inspections (10 per page).</p>
          </div>
          <Button
            onClick={() => navigate(adminPath('/technical-reviews/new'))}
            className="w-full bg-primary text-white hover:bg-primary/90 sm:w-auto"
          >
            <Wrench size={16} className="mr-2" />
            New Visit
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
        />
      </div>
    </motion.div>
  )
}
