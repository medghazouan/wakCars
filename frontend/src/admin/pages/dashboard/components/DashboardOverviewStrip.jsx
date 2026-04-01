import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'
import { formatCurrency, formatDate } from '@admin/utils/formatters'

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
  const { t } = useAdminLanguage()

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
  const pctStr = Number.isFinite(revMom) ? Math.abs(revMom).toFixed(1) : '0'
  const revHint =
    revMom > 0
      ? t('dashboard.revHintUp', { pct: pctStr })
      : revMom < 0
        ? t('dashboard.revHintDown', { pct: pctStr })
        : t('dashboard.revHintFlat')

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <MiniStat
        label={t('dashboard.revenueMtd')}
        value={formatCurrency(rev.monthly ?? 0)}
        hint={revHint}
      />
      <MiniStat
        label={t('dashboard.reservations')}
        value={String(res.activeBookings ?? 0)}
        hint={t('dashboard.pendingHint', { count: res.pending ?? 0 })}
      />
      <MiniStat
        label={t('dashboard.carsAvailable')}
        value={String(fleet.available ?? 0)}
        hint={t('dashboard.fleetHint', { total: fleet.total ?? 0 })}
      />
      <MiniStat
        label={t('dashboard.insurance')}
        value={t('dashboard.insuranceCompliant', { count: ins.compliant ?? 0 })}
        hint={t('dashboard.insuranceHint', {
          compliant: ins.compliant ?? 0,
          critical: ins.critical ?? 0,
          dueSoon: ins.dueSoon ?? 0,
        })}
      />
      <MiniStat
        label={t('dashboard.technical')}
        value={tech.soonestExpiration ? formatDate(tech.soonestExpiration) : '—'}
        hint={
          tech.soonestExpiration
            ? t('dashboard.technicalHintDue', {
                pending: fleet.reviewPending ?? 0,
                score: Number(tech.qualityScore ?? 0).toFixed(1),
              })
            : t('dashboard.technicalHintNone')
        }
      />
    </div>
  )
}
