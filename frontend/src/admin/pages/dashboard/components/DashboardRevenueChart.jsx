import { useMemo, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { ar, fr } from 'date-fns/locale'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCompactCurrency, formatCurrency } from '@admin/utils/formatters'
import { cn } from '@admin/utils/cn'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'

const PRIMARY = '#E61E25'
const GRADIENT_ID = 'dashboardRevenueFill'

const PERIOD_IDS = ['daily', 'weekly', 'monthly']

function translateCompareLabel(raw, t) {
  const map = {
    'last week': 'dashboard.chartCompareLastWeek',
    'prior 4 weeks': 'dashboard.chartComparePrior4Weeks',
    'prior 6 months': 'dashboard.chartComparePrior6Months',
  }
  const key = map[raw]
  return key ? t(key) : raw
}

export function DashboardRevenueChart({ revenueChart, isLoading }) {
  const { t, currentLanguage } = useAdminLanguage()
  const dateLocale = currentLanguage === 'ar' ? ar : fr
  const [period, setPeriod] = useState('daily')
  const reduceMotion = useReducedMotion()

  const slice = revenueChart?.[period]
  const points = slice?.points ?? []

  const compareLabelRaw = slice?.compareLabel ?? 'last week'
  const comparePeriod = useMemo(() => translateCompareLabel(compareLabelRaw, t), [compareLabelRaw, t])

  const chartData = useMemo(() => {
    return points.map((p) => {
      let label = p.label
      if (period === 'daily' && p.date) {
        try {
          label = format(parseISO(p.date), 'EEE', { locale: dateLocale })
        } catch {
          label = p.label
        }
      } else if (period === 'monthly' && p.monthStart) {
        try {
          label = format(parseISO(p.monthStart), 'MMM', { locale: dateLocale })
        } catch {
          label = p.label
        }
      } else if (period === 'weekly' && p.weekIndex != null) {
        label = t('dashboard.chartWeekLabel', { n: p.weekIndex })
      }
      return { ...p, label, amount: Number(p.amount) || 0 }
    })
  }, [points, period, dateLocale, t])

  const peakDisplay = useMemo(() => {
    if (!chartData.length) return '—'
    const maxPt = chartData.reduce((a, b) => (a.amount >= b.amount ? a : b))
    return maxPt.amount > 0 ? maxPt.label : '—'
  }, [chartData])

  if (isLoading || !revenueChart) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-[#FAFAF8] p-6 shadow-sm">
        <div className="h-[320px] animate-pulse rounded-xl bg-gray-200/60" />
      </div>
    )
  }

  const total = slice?.total ?? 0
  const vs = slice?.vsPreviousPct ?? 0
  const up = vs > 0
  const bookings = slice?.bookings ?? 0
  const avg = slice?.avgPerBooking ?? 0

  const peakTitle =
    period === 'monthly'
      ? t('dashboard.chartPeakMonth')
      : period === 'weekly'
        ? t('dashboard.chartPeakWeek')
        : t('dashboard.chartPeakDay')

  return (
    <div className="rounded-2xl border border-gray-200 bg-[#FAFAF8] p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{t('dashboard.chartTotalRevenue')}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-secondary">{formatCurrency(total)}</p>
          <p
            className={cn(
              'mt-1 text-sm font-semibold',
              up ? 'text-primary' : vs < 0 ? 'text-gray-500' : 'text-gray-400'
            )}
          >
            {vs !== 0 ? (
              up
                ? t('dashboard.chartChangeUp', { pct: Math.abs(vs).toFixed(1), period: comparePeriod })
                : t('dashboard.chartChangeDown', { pct: Math.abs(vs).toFixed(1), period: comparePeriod })
            ) : (
              t('dashboard.chartFlatVs', { period: comparePeriod })
            )}
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-gray-200/60 p-1">
          {PERIOD_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setPeriod(id)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                period === id ? 'bg-white text-secondary shadow-sm' : 'text-gray-500 hover:text-gray-800'
              )}
            >
              {id === 'daily'
                ? t('dashboard.chartDaily')
                : id === 'weekly'
                  ? t('dashboard.chartWeekly')
                  : t('dashboard.chartMonthly')}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">{t('dashboard.chartBookings')}</p>
          <p className="mt-1 text-base font-bold text-secondary">{bookings}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">{t('dashboard.chartAvgPerBooking')}</p>
          <p className="mt-1 text-base font-bold text-secondary">
            {bookings > 0 ? formatCurrency(avg) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">{peakTitle}</p>
          <p className="mt-1 text-base font-bold text-secondary">{peakDisplay}</p>
        </div>
      </div>

      <div className="mt-8 h-[280px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.35} />
                <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tickFormatter={(v) => formatCompactCurrency(v)}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              }}
              formatter={(value) => [formatCurrency(value), t('dashboard.chartTooltipRevenue')]}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke={PRIMARY}
              strokeWidth={2.5}
              fill={`url(#${GRADIENT_ID})`}
              dot={{ fill: PRIMARY, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: PRIMARY }}
              isAnimationActive={!reduceMotion}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
