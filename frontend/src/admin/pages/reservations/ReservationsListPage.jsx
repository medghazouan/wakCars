import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format, endOfMonth, startOfMonth } from 'date-fns'
import { Calendar as CalendarIcon, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { reservationsApi } from '@admin/api/reservations.api'
import { dashboardApi } from '@admin/api/dashboard.api'
import { pageTransition } from '@admin/animations/variants'
import { Button } from '@admin/components/ui/Button'
import { StatsCard } from '@admin/components/ui/StatsCard'
import { DataTable } from '@admin/components/ui/DataTable'
import { StatusBadge } from '@admin/components/ui/StatusBadge'
import { formatCurrency } from '@admin/utils/formatters'
import { cn } from '@admin/utils/cn'
import { ReservationsCalendarMonth } from './ReservationsCalendarMonth'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'

const PAYMENT_STATUSES = ['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED']

/** Matches backend reservation status enum — order follows typical rental lifecycle */
const RESERVATION_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]

export default function ReservationsListPage() {
  const { t } = useAdminLanguage()
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
      toast.success(t('page.reservations.toastPaymentOk'))
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || t('page.reservations.toastPaymentErr'))
    },
  })

  const confirmMutation = useMutation({
    mutationFn: (rid) => reservationsApi.confirm(rid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(t('page.reservations.toastConfirmOk'))
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || t('page.reservations.toastConfirmErr'))
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => reservationsApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservation', String(id)] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(t('page.reservations.toastStatusOk'))
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || t('page.reservations.toastStatusErr'))
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

  const columns = useMemo(
    () => [
      {
        key: 'guest',
        label: t('page.reservations.guestRef'),
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
                  : t('dashboard.guest')}
              </p>
              <p className="font-mono text-xs text-gray-500">
                {t('page.reservations.refPrefix')} #WAK-{r.id.toString().padStart(4, '0')}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: 'vehicle',
        label: t('page.reservations.vehicleDetails'),
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
        label: t('page.reservations.schedule'),
        render: (r) => {
          const days = Math.ceil(
            (new Date(r.dropoff_date) - new Date(r.pickup_date)) / (1000 * 60 * 60 * 24)
          )
          return (
            <div>
              <p className="font-medium text-gray-700">
                {format(new Date(r.pickup_date), 'MMM dd')} -{' '}
                {format(new Date(r.dropoff_date), 'MMM dd')}
              </p>
              <p className="text-xs text-gray-500">
                {t('page.reservations.daysTotal', { count: days })}
              </p>
            </div>
          )
        },
      },
      {
        key: 'booking_source',
        label: t('page.reservations.source'),
        render: (r) => (
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            {r.booking_source || '—'}
          </span>
        ),
      },
      {
        key: 'booking_status',
        label: t('page.reservations.bookingStatus'),
        render: (r) => (
          <select
            className={cn(
              'max-w-[160px] rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-secondary',
              'focus:outline-none focus:ring-2 focus:ring-primary/25'
            )}
            value={r.status}
            onChange={(e) =>
              statusMutation.mutate({
                id: r.id,
                status: e.target.value,
              })
            }
            disabled={
              statusMutation.isPending && statusMutation.variables?.id === r.id
            }
          >
            {RESERVATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`, { defaultValue: s.replace(/_/g, ' ') })}
              </option>
            ))}
          </select>
        ),
      },
      {
        key: 'payment',
        label: t('page.reservations.paymentStatus'),
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
                {t(`status.${s}`, { defaultValue: s.replace('_', ' ') })}
              </option>
            ))}
          </select>
        ),
      },
      {
        key: 'actions',
        label: t('common.actions'),
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
                {t('page.reservations.confirm')}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="h-8"
              onClick={() => navigate(adminPath(`/reservations/${r.id}/edit`))}
            >
              {t('page.reservations.edit')}
            </Button>
          </div>
        ),
      },
    ],
    [t, navigate, statusMutation, paymentMutation, confirmMutation]
  )

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="mx-auto w-full min-w-0 max-w-[1600px] space-y-6 sm:space-y-8"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatsCard
          title={t('page.reservations.activeBookings')}
          value={dashLoading ? '…' : stats.active}
          icon={CalendarIcon}
          badgeText={dashLoading ? '…' : t('page.reservations.pendingBadge', { count: stats.pending })}
          badgeVariant="neutral"
        />
        <StatsCard
          title={t('page.reservations.pendingConf')}
          value={dashLoading ? '…' : stats.pending}
          icon={Clock}
          badgeText={
            stats.pending > 5
              ? t('page.reservations.badgeHigh')
              : stats.pending > 0
                ? t('page.reservations.badgeOpen')
                : t('page.reservations.badgeClear')
          }
          badgeVariant={stats.pending > 5 ? 'danger' : 'warning'}
        />
        <StatsCard
          title={t('page.reservations.new24h')}
          value={dashLoading ? '…' : stats.new}
          icon={CheckCircle}
          badgeText={t('page.reservations.badgeCreated')}
          badgeVariant="neutral"
        />
        <StatsCard
          title={t('page.reservations.revenue', {
            label: rev.monthLabel || t('page.reservations.revenueMonthFallback'),
          })}
          value={dashLoading ? '…' : formatCurrency(stats.revenue)}
          icon={TrendingUp}
          badgeText={dashLoading ? '…' : revBadge}
          badgeVariant={revMom >= 0 ? 'success' : 'danger'}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-secondary">{t('page.reservations.sectionTitle')}</h2>
            <p className="text-sm text-gray-400">
              {view === 'list' ? t('page.reservations.listHelp') : t('page.reservations.calHelp')}
            </p>
          </div>
          <div className="flex w-full rounded-lg bg-gray-100 p-1 text-sm font-semibold sm:w-auto">
            <button
              type="button"
              onClick={() => setView('list')}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 transition-colors sm:flex-none sm:px-4',
                view === 'list'
                  ? 'bg-white text-secondary shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              )}
            >
              {t('page.reservations.listView')}
            </button>
            <button
              type="button"
              onClick={() => setView('calendar')}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 transition-colors sm:flex-none sm:px-4',
                view === 'calendar'
                  ? 'bg-white text-secondary shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              )}
            >
              {t('page.reservations.calendarView')}
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
          <h3 className="text-lg font-bold">{t('page.reservations.arrivalTimeline')}</h3>
          <button
            type="button"
            className="text-sm font-semibold text-primary hover:underline"
            onClick={() => {
              setView('calendar')
              setCalMonth(new Date())
            }}
          >
            {t('page.reservations.fullCalendar')}
          </button>
        </div>

        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-12 before:h-full before:w-0.5 before:-translate-x-px before:bg-gray-100 md:before:mx-auto md:before:translate-x-0">
          {dashLoading ? (
            <p className="pl-14 text-sm text-gray-400">{t('page.reservations.loadingTimeline')}</p>
          ) : timeline.length === 0 ? (
            <p className="pl-14 text-sm text-gray-400">{t('page.reservations.noPickups')}</p>
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
