import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { dashboardApi } from '@/api/dashboard.api'
import { pageTransition } from '@/animations/variants'
import { RecentReservationsTable } from './components/RecentReservationsTable'
import { DashboardOverviewStrip } from './components/DashboardOverviewStrip'
import { DashboardRevenueChart } from './components/DashboardRevenueChart'

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats(),
  })

  const stats = data?.data || {}

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="mx-auto w-full max-w-[1600px] space-y-8"
    >
      <div>
        <h1 className="mb-2 text-3xl font-bold text-secondary">Dashboard</h1>
        <p className="text-gray-400">
          Revenue, fleet, compliance, and latest reservations at a glance.
        </p>
      </div>

      <DashboardOverviewStrip stats={stats} isLoading={isLoading} />

      <RecentReservationsTable />

      <DashboardRevenueChart revenueChart={stats.revenueChart} isLoading={isLoading} />
    </motion.div>
  )
}
