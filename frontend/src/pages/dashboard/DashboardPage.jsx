import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Activity, Calendar, Car, Wrench } from 'lucide-react'
import { dashboardApi } from '@/api/dashboard.api'
import { pageTransition } from '@/animations/variants'
import { StatsCard } from '@/components/ui/StatsCard'
import { formatCurrency } from '@/utils/formatters'
import { RecentReservationsTable } from './components/RecentReservationsTable'
import { FleetHealthCard } from './components/FleetHealthCard'
import { ReviewQueue } from './components/ReviewQueue'

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats(),
  })

  const stats = data?.data || {
    revenue: { monthly: 0, monthOverMonthPct: 0, monthLabel: '' },
    reservations: { active: 0, pending: 0 },
    fleet: { total: 0, maintenance: 0, reviewPending: 0 },
    alerts: { overdueReturns: 0 },
    occupancy: { ratePct: 0 },
    fleetHealthScore: 0,
  }

  const revMom = stats.revenue?.monthOverMonthPct ?? 0
  const revBadge =
    revMom > 0 ? `+${revMom}%` : revMom < 0 ? `${revMom}%` : '—'
  const revBadgeVariant = revMom >= 0 ? 'success' : 'danger'

  const occ = stats.occupancy?.ratePct ?? 0
  const fleetGrowth = stats.fleet?.monthOverMonthPct ?? 0
  const fleetGrowthBadge =
    fleetGrowth > 0 ? `+${fleetGrowth}%` : fleetGrowth < 0 ? `${fleetGrowth}%` : '—'
  const techPending = stats.fleet?.reviewPending ?? 0

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="max-w-7xl mx-auto space-y-8 relative"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-gray-100/50 to-transparent -z-10 pointer-events-none" />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary mb-2">Executive Dashboard</h1>
        <p className="text-gray-400">Precision analytics and fleet management for Wak Executive Drive.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={isLoading ? '...' : formatCurrency(stats.revenue.monthly)}
          icon={Activity}
          iconClassName="bg-red-50 text-primary"
          badgeText={isLoading ? '…' : revBadge}
          badgeVariant={revBadgeVariant}
        />
        <StatsCard
          title="Active Reservations"
          value={isLoading ? '...' : stats.reservations.active}
          icon={Calendar}
          iconClassName="bg-green-50 text-success"
          badgeText={isLoading ? '…' : `${occ}% occupancy`}
          badgeVariant="warning"
        />
        <StatsCard
          title="Fleet Status"
          value={isLoading ? '...' : `${stats.fleet.maintenance ?? 0} Maintenance`}
          icon={Car}
          iconClassName="bg-blue-50 text-info"
          badgeText={isLoading ? '…' : `${stats.fleet.total} Total · ${fleetGrowthBadge}`}
          badgeVariant="neutral"
        />
        <StatsCard
          title="Pending Technical Reviews"
          value={isLoading ? '...' : techPending}
          icon={Wrench}
          iconClassName="bg-purple-50 text-purple-600"
          badgeText={techPending > 0 ? 'Action needed' : 'Clear'}
          badgeVariant={techPending > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (span 2) */}
        <div className="lg:col-span-2 flex flex-col">
          <RecentReservationsTable />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <FleetHealthCard score={stats.fleetHealthScore} isLoading={isLoading} />
          <ReviewQueue />
        </div>
      </div>
    </motion.div>
  )
}
