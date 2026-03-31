import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Car, Wrench, AlertCircle, TrendingUp, Info, Sparkles, Filter } from 'lucide-react'
import { carsApi } from '@/api/cars.api'
import { dashboardApi } from '@/api/dashboard.api'
import { pageTransition } from '@/animations/variants'
import { Button } from '@/components/ui/Button'
import { StatsCard } from '@/components/ui/StatsCard'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDate } from '@/utils/formatters'

export default function FleetListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, AVAILABLE, MAINTENANCE

  const { data, isLoading } = useQuery({
    queryKey: ['cars', page, statusFilter],
    queryFn: () => carsApi.getList({ 
      page, 
      limit: 10,
      ...(statusFilter !== 'ALL' && { status: statusFilter })
    }),
  })

  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats(),
  })

  const fleet = dashData?.data?.fleet || {}
  const stats = {
    total: fleet.total ?? 0,
    available: fleet.available ?? 0,
    maintenance: fleet.maintenance ?? 0,
    reviewPending: fleet.reviewPending ?? 0,
  }
  const growth = fleet.monthOverMonthPct ?? 0
  const totalBadge =
    growth > 0 ? `+${growth}%` : growth < 0 ? `${growth}%` : '—'
  const availRatio = stats.total > 0 ? stats.available / stats.total : 0
  const availableBadge = availRatio >= 0.35 ? 'Optimal' : availRatio > 0 ? 'Low' : '—'

  const columns = [
    {
      key: 'vehicle',
      label: 'Vehicle Details',
      render: (car) => (
        <div className="flex items-center gap-4">
          <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
            {car.images?.[0]?.url && (
              <img src={car.images[0].url} alt={car.brand} className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <p className="font-bold text-secondary">{car.brand} {car.model}</p>
            <p className="text-xs text-gray-500">{car.category?.name_fr || 'Luxury'} • {car.year}</p>
          </div>
        </div>
      )
    },
    {
      key: 'license_plate',
      label: 'Plate Number',
      render: (car) => <span className="font-mono text-gray-600">{car.license_plate}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (car) => <StatusBadge status={car.status} />
    },
    {
      key: 'last_service',
      label: 'Last Service',
      render: (car) => <span className="text-gray-600">{car.last_service_date ? formatDate(car.last_service_date) : 'N/A'}</span>
    }
  ]

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="max-w-7xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">Vehicle Fleet</h1>
          <p className="text-gray-400">
            Managing {dashLoading ? '…' : stats.total} active units
            {fleet.locationsCount != null
              ? ` across ${fleet.locationsCount} location${fleet.locationsCount === 1 ? '' : 's'}.`
              : ' across regions.'}
          </p>
        </div>
        <Button onClick={() => navigate('/fleet/new')}>
          + Add New Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <StatsCard title="In Maintenance" value={dashLoading ? '…' : stats.maintenance} icon={Wrench} />
        <StatsCard
          title="Review Pending"
          value={dashLoading ? '…' : stats.reviewPending}
          icon={AlertCircle}
          badgeText={stats.reviewPending > 0 ? '!' : undefined}
          badgeVariant="danger"
        />
      </div>

      <div className="flex flex-col gap-4">
        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-gray-200">
          <div className="flex gap-6">
            <button 
              onClick={() => { setStatusFilter('ALL'); setPage(1) }}
              className={`pb-4 text-sm font-semibold transition-colors border-b-2 ${statusFilter === 'ALL' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-800'}`}
            >
              All Vehicles
            </button>
            <button 
              onClick={() => { setStatusFilter('AVAILABLE'); setPage(1) }}
              className={`pb-4 text-sm font-semibold transition-colors border-b-2 ${statusFilter === 'AVAILABLE' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-800'}`}
            >
              Available Only
            </button>
            <button 
              onClick={() => { setStatusFilter('MAINTENANCE'); setPage(1) }}
              className={`pb-4 text-sm font-semibold transition-colors border-b-2 ${statusFilter === 'MAINTENANCE' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-800'}`}
            >
              Need Service
            </button>
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-secondary pb-4">
            <Filter size={16} />
            Filter
          </button>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          pagination={data?.meta}
          onPageChange={setPage}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-red-50/50 p-6 rounded-xl flex gap-4 items-start border border-red-100">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
            <Info size={16} />
          </div>
          <div>
            <h4 className="font-bold text-secondary mb-1">System Tip</h4>
            <p className="text-sm text-gray-600">Vehicles requiring technical reviews are automatically flagged 30 days before the expiration date.</p>
          </div>
        </div>
        
        <div className="bg-[#FFC107]/10 p-6 rounded-xl flex gap-4 items-start border border-[#FFC107]/20">
          <div className="w-8 h-8 bg-tertiary text-white rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="font-bold text-secondary mb-1">Smart Analytics</h4>
            <p className="text-sm text-gray-600">Based on current reservations, we recommend increasing the available luxury fleet by 15% for next month.</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
