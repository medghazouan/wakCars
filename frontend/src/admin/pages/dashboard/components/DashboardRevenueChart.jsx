import { useMemo, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
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

const PRIMARY = '#E61E25'
const GRADIENT_ID = 'dashboardRevenueFill'

const periods = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
]

export function DashboardRevenueChart({ revenueChart, isLoading }) {
  const [period, setPeriod] = useState('daily')
  const reduceMotion = useReducedMotion()

  const slice = revenueChart?.[period]
  const points = slice?.points ?? []

  const chartData = useMemo(
    () => points.map((p) => ({ ...p, amount: Number(p.amount) || 0 })),
    [points]
  )

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
  const peak = slice?.peakLabel ?? '—'
  const compareLabel = slice?.compareLabel ?? 'previous period'

  return (
    <div className="rounded-2xl border border-gray-200 bg-[#FAFAF8] p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Total revenue</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-secondary">
            {formatCurrency(total)}
          </p>
          <p
            className={cn(
              'mt-1 text-sm font-semibold',
              up ? 'text-primary' : vs < 0 ? 'text-gray-500' : 'text-gray-400'
            )}
          >
            {vs !== 0 ? (
              <>
                {up ? '▲' : '▼'} {Math.abs(vs)}% vs {compareLabel}
              </>
            ) : (
              <>Flat vs {compareLabel}</>
            )}
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-gray-200/60 p-1">
          {periods.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                period === p.id
                  ? 'bg-white text-secondary shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Bookings</p>
          <p className="mt-1 text-base font-bold text-secondary">{bookings}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Avg. per booking</p>
          <p className="mt-1 text-base font-bold text-secondary">
            {bookings > 0 ? formatCurrency(avg) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Peak {period === 'monthly' ? 'month' : period === 'weekly' ? 'week' : 'day'}</p>
          <p className="mt-1 text-base font-bold text-secondary">{peak}</p>
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
              formatter={(value) => [formatCurrency(value), 'Revenue']}
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
