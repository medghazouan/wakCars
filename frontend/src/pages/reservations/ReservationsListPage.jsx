import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { reservationsApi } from '@/api/reservations.api'
import { dashboardApi } from '@/api/dashboard.api'
import { pageTransition } from '@/animations/variants'
import { Button } from '@/components/ui/Button'
import { StatsCard } from '@/components/ui/StatsCard'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency } from '@/utils/formatters'

export default function ReservationsListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['reservations', page],
    queryFn: () => reservationsApi.getList({ page, limit: 10 }),
  })

  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats(),
  })

  const res = dashData?.data?.reservations || {}
  const rev = dashData?.data?.revenue || {}
  const stats = {
    active: res.activeBookings ?? res.active ?? 0,
    pending: res.pending ?? 0,
    new: res.newLast24h ?? 0,
    revenue: rev.monthly ?? 0,
  }
  const revMom = rev.monthOverMonthPct ?? 0
  const revBadge = revMom > 0 ? `+${revMom}%` : revMom < 0 ? `${revMom}%` : '—'
  const timeline = res.timeline || []
  const weekendCount = res.weekendPickupCount ?? 0

  const columns = [
    {
      key: 'guest',
      label: 'Guest & Reference',
      render: (res) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 flex-shrink-0">
            {res.customer ? `${res.customer.first_name[0]}${res.customer.last_name[0]}` : 'JD'}
          </div>
          <div>
            <p className="font-bold text-secondary">{res.customer ? `${res.customer.first_name} ${res.customer.last_name}` : 'Guest User'}</p>
            <p className="text-xs text-gray-500 font-mono">REF: #WAK-{res.id.toString().padStart(4, '0')}</p>
          </div>
        </div>
      )
    },
    {
      key: 'vehicle',
      label: 'Vehicle Details',
      render: (res) => (
        <div className="flex items-center gap-3">
          <div className="w-16 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
            {res.car?.images?.[0]?.url && <img src={res.car.images[0].url} alt="" className="w-full h-full object-cover" />}
          </div>
          <div>
            <p className="font-semibold text-secondary">{res.car?.brand} {res.car?.model}</p>
            <p className="text-xs text-gray-500">{res.car?.category?.name_fr || 'Luxury'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'schedule',
      label: 'Schedule',
      render: (res) => (
        <div>
          <p className="font-medium text-gray-700">{format(new Date(res.pickup_date), 'MMM dd')} - {format(new Date(res.dropoff_date), 'MMM dd')}</p>
          <p className="text-xs text-gray-500">
            {Math.ceil((new Date(res.dropoff_date) - new Date(res.pickup_date)) / (1000 * 60 * 60 * 24))} Days Total
          </p>
        </div>
      )
    },
    {
      key: 'payment',
      label: 'Payment Status',
      render: (res) => <StatusBadge status={res.payment_status} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (res) => (
        <div className="flex items-center gap-2">
          {res.status === 'PENDING' && (
            <Button size="sm" variant="primary" className="h-8">Confirm</Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => navigate(`/reservations/${res.id}/edit`)}>Edit</Button>
        </div>
      )
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Active Bookings"
          value={dashLoading ? '…' : stats.active}
          icon={CalendarIcon}
          badgeText={dashLoading ? '…' : `${stats.pending} pending`}
          badgeVariant="neutral"
        />
        <StatsCard
          title="Pending Conf."
          value={dashLoading ? '…' : stats.pending}
          icon={Clock}
          badgeText={stats.pending > 5 ? 'High' : stats.pending > 0 ? 'Open' : 'Clear'}
          badgeVariant={stats.pending > 5 ? 'danger' : 'warning'}
        />
        <StatsCard
          title="New (24H)"
          value={dashLoading ? '…' : stats.new}
          icon={CheckCircle}
          badgeText="Created"
          badgeVariant="neutral"
        />
        <StatsCard
          title={`Revenue (${rev.monthLabel || 'MTD'})`}
          value={dashLoading ? '…' : formatCurrency(stats.revenue)}
          icon={TrendingUp}
          badgeText={dashLoading ? '…' : revBadge}
          badgeVariant={revMom >= 0 ? 'success' : 'danger'}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-secondary">Active Reservations</h2>
            <p className="text-sm text-gray-400">Manage and track your upcoming fleet schedule.</p>
          </div>
          <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-semibold">
            <button className="px-4 py-1.5 bg-white text-secondary rounded-md shadow-sm">List View</button>
            <button className="px-4 py-1.5 text-gray-500 hover:text-gray-800">Calendar</button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          pagination={data?.meta}
          onPageChange={setPage}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Arrival Timeline</h3>
            <button className="text-primary text-sm font-semibold hover:underline">Full Calendar ↗</button>
          </div>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-12 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-100">
            {dashLoading ? (
              <p className="text-sm text-gray-400 pl-14">Loading timeline…</p>
            ) : timeline.length === 0 ? (
              <p className="text-sm text-gray-400 pl-14">No pickups scheduled in the next 7 days.</p>
            ) : (
              timeline.map((item, i) => {
                const urgent = item.badge === 'URGENT'
                return (
                  <div
                    key={item.id ?? i}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white z-10 font-bold text-xs shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${
                        urgent ? 'bg-red-50 text-primary' : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {item.timeLabel}
                    </div>
                    <div
                      className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center justify-between border-l-4 ${
                        urgent ? 'border-l-danger' : 'border-l-success'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-sm text-secondary">{item.title}</h4>
                        <p className="text-xs text-gray-500">{item.subtitle}</p>
                      </div>
                      <StatusBadge status={item.badge} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="bg-primary rounded-xl p-6 text-white h-fit shadow-lg bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          <h3 className="text-xl font-bold mb-2">Weekend pickups</h3>
          <p className="text-sm text-red-100 mb-6 leading-relaxed">
            {dashLoading
              ? 'Loading…'
              : weekendCount > 0
                ? `${weekendCount} reservation${weekendCount === 1 ? '' : 's'} with pickup this weekend. Plan staffing and vehicle prep accordingly.`
                : 'No weekend pickups scheduled yet. Promote availability or confirm pending bookings.'}
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle size={16} /> Check VIP fleet availability
            </li>
            <li className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle size={16} /> Confirm airport transfers
            </li>
          </ul>
          <Button variant="outline" className="w-full bg-white text-primary border-none hover:bg-gray-50">
            Optimize Fleet
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
