import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Car, TrendingUp, KeyRound, CircleSlash, Filter, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { carsApi } from '@admin/api/cars.api'
import { dashboardApi } from '@admin/api/dashboard.api'
import { pageTransition } from '@admin/animations/variants'
import { Button } from '@admin/components/ui/Button'
import { StatsCard } from '@admin/components/ui/StatsCard'
import { DataTable } from '@admin/components/ui/DataTable'
import { formatDate } from '@admin/utils/formatters'
import { cn } from '@admin/utils/cn'

const CAR_STATUSES = ['AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE']

export default function FleetListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('ALL')

  const { data, isLoading } = useQuery({
    queryKey: ['cars', page, statusFilter],
    queryFn: () =>
      carsApi.getList({
        page,
        limit: 10,
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      }),
  })

  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats(),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => carsApi.updateStatus(id, status),
    onSuccess: (_, { id: carId }) => {
      queryClient.invalidateQueries({ queryKey: ['cars'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['car', String(carId)] })
      toast.success('Status updated')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Could not update status')
    },
  })

  const fleet = dashData?.data?.fleet || {}
  const stats = {
    total: fleet.total ?? 0,
    available: fleet.available ?? 0,
    rented: fleet.rented ?? 0,
    inactive: fleet.inactive ?? 0,
  }
  const growth = fleet.monthOverMonthPct ?? 0
  const totalBadge = growth > 0 ? `+${growth}%` : growth < 0 ? `${growth}%` : '—'
  const availRatio = stats.total > 0 ? stats.available / stats.total : 0
  const availableBadge = availRatio >= 0.35 ? 'Optimal' : availRatio > 0 ? 'Low' : '—'

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
      key: 'vehicle',
      label: 'Vehicle Details',
      render: (car) => (
        <Link
          to={adminPath(`/fleet/${car.id}`)}
          className="group -m-2 flex max-w-max items-center gap-4 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
        >
          <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
            {car.images?.[0]?.url && (
              <img src={car.images[0].url} alt={car.brand} className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <p className="font-bold text-secondary group-hover:text-primary">
              {car.brand} {car.model}
            </p>
            <p className="text-xs text-gray-500">
              {car.category?.name_fr || '—'} • {car.year}
            </p>
          </div>
        </Link>
      ),
    },
    {
      key: 'license_plate',
      label: 'Plate Number',
      render: (car) => <span className="font-mono text-gray-600">{car.license_plate}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (car) => (
        <select
          className={cn(
            'max-w-[140px] rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-secondary',
            'focus:outline-none focus:ring-2 focus:ring-primary/25'
          )}
          value={car.status}
          onChange={(e) =>
            statusMutation.mutate({ id: car.id, status: e.target.value })
          }
          disabled={
            statusMutation.isPending && statusMutation.variables?.id === car.id
          }
        >
          {CAR_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'last_rental',
      label: 'Last rental',
      render: (car) => {
        if (car.status === 'RENTED') {
          return <span className="font-medium text-primary">En cours</span>
        }
        if (car.last_rental_pickup_at) {
          return (
            <span className="text-gray-600">
              {formatDate(car.last_rental_pickup_at)}
            </span>
          )
        }
        return <span className="text-gray-400">—</span>
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      headerClassName: 'text-left',
      cellClassName: 'text-left align-middle',
      render: (car) => (
        <div className="flex flex-wrap items-center justify-start">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1 px-3"
            onClick={() => navigate(adminPath(`/fleet/${car.id}`))}
          >
            <Eye size={14} />
            See
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
      className="mx-auto max-w-7xl space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-secondary">Vehicle Fleet</h1>
          <p className="text-gray-400">
            Managing {dashLoading ? '…' : stats.total} active units
            {fleet.locationsCount != null
              ? ` across ${fleet.locationsCount} location${fleet.locationsCount === 1 ? '' : 's'}.`
              : ' across regions.'}
          </p>
        </div>
        <Button onClick={() => navigate(adminPath('/fleet/new'))}>+ Add New Vehicle</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Fleet"
          value={dashLoading ? '…' : stats.total}
          icon={Car}
          badgeText={dashLoading ? undefined : totalBadge}
          badgeVariant={growth >= 0 ? 'success' : 'warning'}
        />
        <StatsCard
          title="Available"
          value={dashLoading ? '…' : stats.available}
          icon={TrendingUp}
          badgeText={dashLoading ? undefined : availableBadge}
          badgeVariant="success"
        />
        <StatsCard
          title="Rented"
          value={dashLoading ? '…' : stats.rented}
          icon={KeyRound}
          badgeVariant="neutral"
        />
        <StatsCard
          title="Inactive"
          value={dashLoading ? '…' : stats.inactive}
          icon={CircleSlash}
          badgeVariant="neutral"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-200">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL')
                setPage(1)
              }}
              className={`border-b-2 pb-4 text-sm font-semibold transition-colors ${
                statusFilter === 'ALL'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              All Vehicles
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('AVAILABLE')
                setPage(1)
              }}
              className={`border-b-2 pb-4 text-sm font-semibold transition-colors ${
                statusFilter === 'AVAILABLE'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Available Only
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('RENTED')
                setPage(1)
              }}
              className={`border-b-2 pb-4 text-sm font-semibold transition-colors ${
                statusFilter === 'RENTED'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Rented
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('INACTIVE')
                setPage(1)
              }}
              className={`border-b-2 pb-4 text-sm font-semibold transition-colors ${
                statusFilter === 'INACTIVE'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Inactive
            </button>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 pb-4 text-sm text-gray-500 hover:text-secondary"
          >
            <Filter size={16} />
            Filter
          </button>
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
