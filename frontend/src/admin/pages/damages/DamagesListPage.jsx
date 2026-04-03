import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AlertTriangle, Car, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { adminPath } from '@admin/adminPaths'
import { damagesApi } from '@admin/api/damages.api'
import { alertsApi } from '@admin/api/alerts.api'
import { dashboardApi } from '@admin/api/dashboard.api'
import { pageTransition } from '@admin/animations/variants'
import { Button } from '@admin/components/ui/Button'
import { Card } from '@admin/components/ui/Card'
import { DataTable } from '@admin/components/ui/DataTable'
import { StatsCard } from '@admin/components/ui/StatsCard'
import { formatCurrency } from '@admin/utils/formatters'
import { cn } from '@admin/utils/cn'

export default function DamagesListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [resolvedFilter, setResolvedFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['damages', page, resolvedFilter],
    queryFn: () =>
      damagesApi.getList({
        page,
        limit: 12,
        ...(resolvedFilter === 'open' && { resolved: false }),
        ...(resolvedFilter === 'done' && { resolved: true }),
      }),
  })

  const { data: dashData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats(),
  })

  const { data: alertRes } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.getAlerts(),
  })

  const rows = data?.data || []
  const meta = data?.meta
  const pagination = useMemo(() => {
    if (!meta || meta.total == null || !meta.limit) return undefined
    return { ...meta, totalPages: Math.max(1, Math.ceil(meta.total / meta.limit)) }
  }, [meta])

  const openCount = alertRes?.data?.summary?.unresolvedDamages
  const fleet = dashData?.data?.fleet || {}

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (r) => <span className="font-mono text-xs text-gray-500">#{r.id}</span>,
    },
    {
      key: 'vehicle',
      label: 'Véhicule',
      render: (r) => (
        <div>
          <p className="font-semibold text-secondary">
            {r.car?.brand} {r.car?.model}
          </p>
          <p className="text-xs text-gray-500">{r.car?.license_plate}</p>
        </div>
      ),
    },
    {
      key: 'res',
      label: 'Réservation',
      render: (r) =>
        r.reservation_id ? (
          <Link
            to={adminPath(`/reservations/${r.reservation_id}/edit`)}
            className="text-sm font-medium text-primary hover:underline"
          >
            #{r.reservation_id}
          </Link>
        ) : (
          '—'
        ),
    },
    {
      key: 'cost',
      label: 'Coût est.',
      render: (r) => (r.estimated_cost != null ? formatCurrency(Number(r.estimated_cost)) : '—'),
    },
    {
      key: 'resolved',
      label: 'Statut',
      render: (r) => (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold',
            r.resolved ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'
          )}
        >
          {r.resolved ? 'Clôturé' : 'Ouvert'}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (r) => format(new Date(r.created_at), 'dd MMM yyyy'),
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <Button size="sm" variant="ghost" type="button" onClick={() => navigate(adminPath(`/damages/${r.id}/edit`))}>
          Modifier
        </Button>
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-secondary sm:text-3xl">Sinistres</h1>
          <p className="text-gray-500">Constats, photos et suivi des dommages véhicules.</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => navigate(adminPath('/damages/new'))}>
          <Plus size={18} className="me-1" />
          Nouveau constat
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="Sinistres ouverts"
          value={openCount != null ? String(openCount) : '—'}
          icon={AlertTriangle}
          badgeText="À traiter"
          badgeVariant="neutral"
        />
        <StatsCard title="Véhicules en flotte" value={String(fleet.total ?? '—')} icon={Car} />
        <Card className="flex flex-col justify-center p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Filtre</p>
          <select
            value={resolvedFilter}
            onChange={(e) => {
              setResolvedFilter(e.target.value)
              setPage(1)
            }}
            className="mt-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="all">Tous</option>
            <option value="open">Ouverts uniquement</option>
            <option value="done">Clôturés</option>
          </select>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        emptyMessage="Aucun sinistre pour ce filtre."
      />
    </motion.div>
  )
}
