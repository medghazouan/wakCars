import { formatCurrency, formatDate } from '@/utils/formatters'

function MiniStat({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold tracking-tight text-secondary">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
    </div>
  )
}

export function DashboardOverviewStrip({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] animate-pulse rounded-xl border border-gray-100 bg-gray-100/80"
          />
        ))}
      </div>
    )
  }

  const rev = stats.revenue || {}
  const res = stats.reservations || {}
  const fleet = stats.fleet || {}
  const ins = stats.insurance || {}
  const tech = stats.technical || {}
  const revMom = rev.monthOverMonthPct ?? 0
  const revHint =
    revMom > 0
      ? `+${revMom}% vs last month`
      : revMom < 0
        ? `${revMom}% vs last month`
        : 'Month to date'

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <MiniStat
        label="Revenue (MTD)"
        value={formatCurrency(rev.monthly ?? 0)}
        hint={revHint}
      />
      <MiniStat
        label="Reservations"
        value={String(res.activeBookings ?? 0)}
        hint={`${res.pending ?? 0} pending confirmation`}
      />
      <MiniStat
        label="Cars available"
        value={String(fleet.available ?? 0)}
        hint={`${fleet.total ?? 0} vehicles in fleet`}
      />
      <MiniStat
        label="Insurance"
        value={`${ins.compliant ?? 0} compliant`}
        hint={`${ins.critical ?? 0} critical · ${ins.dueSoon ?? 0} due soon`}
      />
      <MiniStat
        label="Technical review"
        value={
          tech.soonestExpiration ? formatDate(tech.soonestExpiration) : '—'
        }
        hint={
          tech.soonestExpiration
            ? `${fleet.reviewPending ?? 0} vehicle(s) due or expired · score ${Number(tech.qualityScore ?? 0).toFixed(1)}/10`
            : 'No inspection expiry dates on file'
        }
      />
    </div>
  )
}
