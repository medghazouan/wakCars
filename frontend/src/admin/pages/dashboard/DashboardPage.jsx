import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { dashboardApi } from '@admin/api/dashboard.api'
import { pageTransition } from '@admin/animations/variants'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'
import { RecentReservationsTable } from './components/RecentReservationsTable'
import { DashboardOverviewStrip } from './components/DashboardOverviewStrip'
import { DashboardRevenueChart } from './components/DashboardRevenueChart'
import { DashboardAlerts } from './components/DashboardAlerts'

export default function DashboardPage() {
  const { t } = useAdminLanguage()
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
      className="mx-auto w-full min-w-0 max-w-[1600px] space-y-6 sm:space-y-8"
    >
      <div className="min-w-0">
        <h1 className="mb-2 text-2xl font-bold text-secondary sm:text-3xl">{t('dashboard.title')}</h1>
        <p className="text-sm text-gray-400 sm:text-base">{t('dashboard.subtitle')}</p>
      </div>

      <DashboardOverviewStrip stats={stats} isLoading={isLoading} />

      <DashboardAlerts />

      <RecentReservationsTable />

      <DashboardRevenueChart revenueChart={stats.revenueChart} isLoading={isLoading} />
    </motion.div>
  )
}
