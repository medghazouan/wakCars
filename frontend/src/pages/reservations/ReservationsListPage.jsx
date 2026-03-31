import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format, endOfMonth, startOfMonth } from 'date-fns'
import { Calendar as CalendarIcon, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { reservationsApi } from '@/api/reservations.api'
import { dashboardApi } from '@/api/dashboard.api'
import { pageTransition } from '@/animations/variants'
import { Button } from '@/components/ui/Button'
import { StatsCard } from '@/components/ui/StatsCard'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { ReservationsCalendarMonth } from './ReservationsCalendarMonth'

const PAYMENT_STATUSES = ['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED']

export default function ReservationsListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [view, setView] = useState('list')
  const [calMonth, setCalMonth] = useState(() => new Date())

  const { data, isLoading } = useQuery({
    queryKey: ['reservations', page],
    queryFn: () => reservationsApi.getList({ page, limit: 10 }),
    enabled: view === 'list',
  })

  const { data: calData, isLoading: calLoading } = useQuery({
    queryKey: ['reservations', 'calendar', format(calMonth, 'yyyy-MM')],
    queryFn: () => {
      const from = startOfMonth(calMonth)
      const to = endOfMonth(calMonth)
      return reservationsApi.getList({
        from: from.toISOString(),
        to: to.toISOString(),
        limit: 500,
        page: 1,
      })
    },
    enabled: view === 'calendar',
  })

  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats(),
  })

  const paymentMutation = useMutation({
    mutationFn: ({ id, payment_status }) =>
      reservationsApi.updatePaymentStatus(id, payment_status),
    onSuccess: (_, { id: rid }) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservation', String(rid)] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Payment status updated')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Could not update payment status')
    },
  })

  const confirmMutation = useMutation({
    mutationFn: (rid) => reservationsApi.confirm(rid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Reservation confirmed')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Could not confirm')
    },
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
      key: 'guest',
      label: 'Guest & Reference',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-600">
            {r.customer
              ? `${r.customer.first_name[0]}${r.customer.last_name[0]}`
              : '—'}
          </div>
          <div>
            <p className="font-bold text-secondary">
              {r.customer
                ? `${r.customer.first_name} ${r.customer.last_name}`
                : 'Guest'}
            </p>
            <p className="font-mono text-xs text-gray-500">
              REF: #WAK-{r.id.toString().padStart(4, '0')}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'vehicle',
      label: 'Vehicle Details',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
            {r.car?.images?.[0]?.url && (
              <img src={r.car.images[0].url} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <p className="font-semibold text-secondary">
              {r.car?.brand} {r.car?.model}
            </p>
            <p className="text-xs text-gray-500">{r.car?.category?.name_fr || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'schedule',
      label: 'Schedule',
      render: (r) => (
        <div>
          <p className="font-medium text-gray-700">
            {format(new Date(r.pickup_date), 'MMM dd')} -{' '}
            {format(new Date(r.dropoff_date), 'MMM dd')}
          </p>
          <p className="text-xs text-gray-500">
            {Math.ceil(
              (new Date(r.dropoff_date) - new Date(r.pickup_date)) /
                (1000 * 60 * 60 * 24)
            )}{' '}
            Days Total
          </p>
        </div>
      ),
    },
    {
      key: 'payment',
      label: 'Payment Status',
      render: (r) => (
        <select
          className={cn(
            'max-w-[150px] rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-secondary',
            'focus:outline-none focus:ring-2 focus:ring-primary/25'
          )}
          value={r.payment_status}
          onChange={(e) =>
            paymentMutation.mutate({
              id: r.id,
              payment_status: e.target.value,
            })
          }
          disabled={
            paymentMutation.isPending &&
            paymentMutation.variables?.id === r.id
          }
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      headerClassName: 'text-left',
      cellClassName: 'text-left',
      render: (r) => (
        <div className="flex flex-wrap items-center gap-2">
          {r.status === 'PENDING' && (
            <Button
              size="sm"
              variant="primary"
              className="h-8"
              type="button"
              isLoading={
                confirmMutation.isPending && confirmMutation.variables === r.id
              }
              onClick={() => confirmMutation.mutate(r.id)}
            >
              Confirm
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="h-8"
            onClick={() => navigate(`/reservations/${r.id}/edit`)}
          >
            Edit
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
      className="mx-auto w-full max-w-[1600px] space-y-8"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
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
          badgeText={
            stats.pending > 5 ? 'High' : stats.pending > 0 ? 'Open' : 'Clear'
          }
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-secondary">Reservations</h2>
            <p className="text-sm text-gray-400">
              {view === 'list'
                ? 'Manage bookings (10 per page).'
                : 'Calendar of pickups by month.'}
            </p>
          </div>
          <div className="flex rounded-lg bg-gray-100 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setView('list')}
              className={cn(
                'rounded-md px-4 py-1.5 transition-colors',
                view === 'list'
                  ? 'bg-white text-secondary shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              )}
            >
              List view
            </button>
            <button
              type="button"
              onClick={() => setView('calendar')}
              className={cn(
                'rounded-md px-4 py-1.5 transition-colors',
                view === 'calendar'
                  ? 'bg-white text-secondary shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              )}
            >
              Calendar
            </button>
          </div>
        </div>

        {view === 'list' ? (
          <DataTable
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={setPage}
          />
        ) : (
          <ReservationsCalendarMonth
            month={calMonth}
            onMonthChange={setCalMonth}
            reservations={calData?.data || []}
            isLoading={calLoading}
          />
        )}
      </div>

      <div className="w-full rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold">Arrival timeline</h3>
          <button
            type="button"
            className="text-sm font-semibold text-primary hover:underline"
            onClick={() => {
              setView('calendar')
              setCalMonth(new Date())
            }}
          >
            Full calendar
          </button>
        </div>

        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-12 before:h-full before:w-0.5 before:-translate-x-px before:bg-gray-100 md:before:mx-auto md:before:translate-x-0">
          {dashLoading ? (
            <p className="pl-14 text-sm text-gray-400">Loading timeline…</p>
          ) : timeline.length === 0 ? (
            <p className="pl-14 text-sm text-gray-400">
              No pickups scheduled in the next 7 days.
            </p>
          ) : (
            timeline.map((item, i) => {
              const urgent = item.badge === 'URGENT'
              return (
                <div
                  key={item.id ?? i}
                  className="group relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse"
                >
                  <div
                    className={cn(
                      'z-10 flex min-h-[3rem] min-w-[3rem] shrink-0 flex-col items-center justify-center gap-0 rounded-full border-4 border-white px-1 py-0.5 text-center shadow-sm md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2',
                      urgent
                        ? 'bg-red-50 text-primary'
                        : 'bg-gray-50 text-gray-500'
                    )}
                  >
                    {item.dateLabel && (
                      <span className="text-[9px] font-bold leading-none tracking-tight">
                        {item.dateLabel}
                      </span>
                    )}
                    <span className="text-[10px] font-bold leading-none">
                      {item.timeLabel}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'flex w-[calc(100%-4rem)] items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm border-l-4 md:w-[calc(50%-2.5rem)]',
                      urgent ? 'border-l-danger' : 'border-l-success'
                    )}
                  >
                    <div>
                      <h4 className="text-sm font-bold text-secondary">
                        {item.title}
                      </h4>
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
    </motion.div>
  )
}
