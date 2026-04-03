import { Star } from 'lucide-react'
import { Button } from '@admin/components/ui/Button'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'

export function FleetHealthCard({ score = 0, isLoading }) {
  const { t } = useAdminLanguage()
  const pct = Math.min(100, Math.max(0, Math.round(Number(score) || 0)))
  const label =
    pct >= 85
      ? t('dashboardWidgets.healthExcellent')
      : pct >= 65
        ? t('dashboardWidgets.healthGood')
        : pct >= 45
          ? t('dashboardWidgets.healthFair')
          : t('dashboardWidgets.healthPoor')

  return (
    <div className="relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-[#E61E25] to-[#991418] p-4 text-white shadow-lg sm:h-[300px] sm:min-h-0 sm:p-6">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>

      <div>
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
          <Star size={12} className="fill-tertiary text-tertiary" />
          {t('dashboardWidgets.premiumInsights')}
        </div>

        <h3 className="mb-2 text-xl font-bold">{t('dashboardWidgets.fleetHealth')}</h3>

        <div className="mb-6 flex items-baseline gap-3">
          <span className="text-6xl font-black tracking-tighter">
            {isLoading ? '…' : `${pct}%`}
          </span>
          <span className="text-sm font-medium text-white/80">{isLoading ? '' : label}</span>
        </div>

        <div className="mb-8 h-2 w-full rounded-full bg-black/20">
          <div
            className="h-2 rounded-full bg-white transition-all duration-500"
            style={{ width: isLoading ? '0%' : `${pct}%` }}
          ></div>
        </div>
      </div>

      <Button variant="outline" className="w-full border-none bg-white text-primary hover:bg-gray-50">
        {t('dashboardWidgets.runAudit')}
      </Button>
    </div>
  )
}
