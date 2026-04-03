import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { AlertCircle, CheckCircle, Clock, FileText, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { insuranceApi } from '@admin/api/insurance.api'
import { dashboardApi } from '@admin/api/dashboard.api'
import { pageTransition } from '@admin/animations/variants'
import { Button } from '@admin/components/ui/Button'
import { StatsCard } from '@admin/components/ui/StatsCard'
import { DataTable } from '@admin/components/ui/DataTable'
import { StatusBadge } from '@admin/components/ui/StatusBadge'

export default function InsuranceListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['insurance', page],
    queryFn: () => insuranceApi.getList({ page, limit: 10 }),
  })

  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => insuranceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Insurance policy deleted')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Could not delete policy')
    },
  })

  const ins = dashData?.data?.insurance || {}
  const stats = {
    compliant: ins.compliant ?? 0,
    compliantPct: ins.compliantPct ?? 0,
    dueSoon: ins.dueSoon ?? 0,
    dueSoonPct: ins.dueSoonPct ?? 0,
    critical: ins.critical ?? 0,
    criticalPct: ins.criticalPct ?? 0,
  }

  const pagination = useMemo(() => {
    const m = data?.meta
    if (!m || m.total == null || !m.limit) return undefined
    return {
      ...m,
      totalPages: Math.max(1, Math.ceil(m.total / m.limit)),
    }
  }, [data?.meta])

  const columns = [
    {
      key: 'car',
      label: 'Vehicle',
      render: (p) => (
        <div>
          <p className="font-bold text-secondary">
            {p.car?.brand} {p.car?.model}
          </p>
          <p className="font-mono text-xs text-gray-500">{p.car?.license_plate}</p>
        </div>
      ),
    },
    {
      key: 'provider',
      label: 'Provider',
      render: (p) => (
        <div>
          <p className="font-semibold text-secondary">{p.provider}</p>
          <p className="text-xs text-gray-500">Policy: {p.policy_number}</p>
        </div>
      ),
    },
    {
      key: 'dates',
      label: 'Coverage Period',
      render: (p) => (
        <div>
          <p className="font-medium text-gray-700">
            {format(parseISO(p.start_date), 'MMM dd, yyyy')} -{' '}
            {format(parseISO(p.expiry_date), 'MMM dd, yyyy')}
          </p>
          <p className="text-xs text-gray-500">
            {Math.ceil((new Date(p.expiry_date) - new Date(p.start_date)) / (1000 * 60 * 60 * 24))} days
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (p) => {
        const statusKey = p.status?.toUpperCase() || 'UNKNOWN'
        return <StatusBadge status={statusKey} />
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (p) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="h-8"
            onClick={() => navigate(adminPath(`/insurance/${p.id}/edit`))}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-danger hover:text-red-700"
            type="button"
            isLoading={deleteMutation.isPending && deleteMutation.variables === p.id}
            onClick={() => {
              if (confirm('Are you sure you want to delete this policy?')) {
                deleteMutation.mutate(p.id)
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
      className="mx-auto w-full min-w-0 max-w-[1600px] space-y-6 sm:space-y-8"
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
            <h2 className="text-xl font-bold text-secondary">Insurance Policies</h2>
            <p className="text-sm text-gray-400">Manage fleet insurance coverage (10 per page).</p>
          </div>
          <Button
            onClick={() => navigate(adminPath('/insurance/new'))}
            className="w-full bg-primary text-white hover:bg-primary/90 sm:w-auto"
          >
            <FileText size={16} className="mr-2" />
            New Policy
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
