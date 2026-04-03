import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Bell, Car, CreditCard, RefreshCw, Shield } from 'lucide-react'
import { alertsApi } from '@admin/api/alerts.api'
import { adminPath } from '@admin/adminPaths'
import { Button } from '@admin/components/ui/Button'
import { Card } from '@admin/components/ui/Card'
import { getVisibleAlertCount } from '@admin/utils/alertCounts'
import { cn } from '@admin/utils/cn'
import { overdueReturn, paymentIssue } from '@admin/utils/whatsappLinks'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'

/**
 * PRD alert-style panel. Technical / maintenance visit alerts are omitted by product request.
 */
export function DashboardAlerts() {
  const { t } = useAdminLanguage()
  const [mobileTab, setMobileTab] = useState(0)

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.getAlerts(),
    refetchInterval: 120_000,
    retry: 2,
  })

  const payload = data?.data
  const summary = payload?.summary

  const visibleTotal = getVisibleAlertCount(summary)

  if (isLoading) {
    return (
      <Card className="p-4 sm:p-6">
        <p className="text-sm text-gray-500">{t('dashboard.loadAlertsPanel')}</p>
      </Card>
    )
  }

  if (isError || !payload) {
    return (
      <Card className="space-y-4 p-4 sm:p-6">
        <p className="text-sm text-amber-800">{t('alerts.loadError')}</p>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full sm:w-auto"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw size={16} className={cn('me-2', isFetching && 'animate-spin')} />
          {t('alerts.retry')}
        </Button>
      </Card>
    )
  }

  const overdue = payload.overdueReservations || []
  const expiringIns = payload.expiringInsurance || []
  const expiredIns = payload.expiredInsurance || []
  const unpaid = payload.unpaidReservations || []
  const damages = payload.unresolvedDamages || []

  const mobileTabs = [
    { id: 'overdue', shortKey: 'mobileTabOverdue', count: overdue.length },
    { id: 'ins30', shortKey: 'mobileTabIns30', count: expiringIns.length },
    { id: 'insexp', shortKey: 'mobileTabInsExp', count: expiredIns.length },
    { id: 'pay', shortKey: 'mobileTabPay', count: unpaid.length },
    { id: 'dmg', shortKey: 'mobileTabDmg', count: damages.length },
  ]

  const overdueBlock = (
    <AlertBlock title={t('dashboard.alertsOverdueTitle')} icon={Car} count={overdue.length} empty={t('dashboard.alertsOverdueEmpty')}>
      {overdue.map((r) => (
        <li
          key={r.id}
          className="flex flex-wrap items-center justify-between gap-2 border-gray-100 border-b py-3 text-sm last:border-0 sm:py-2"
        >
          <div className="min-w-0">
            <Link
              to={adminPath(`/reservations/${r.id}/edit`)}
              className="font-medium text-primary hover:underline"
            >
              {t('dashboard.reservationNumber', { id: r.id })}
            </Link>
            <span className="text-gray-500">
              {' '}
              · {r.car?.brand} {r.car?.model}
            </span>
          </div>
          {r.customer?.phone && (
            <a
              href={overdueReturn(r.customer, r)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 shrink-0 items-center rounded-lg px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 sm:min-h-0 sm:px-0 sm:hover:bg-transparent sm:hover:underline"
            >
              WhatsApp
            </a>
          )}
        </li>
      ))}
    </AlertBlock>
  )

  const expiringBlock = (
    <AlertBlock
      title={t('dashboard.alertsInsurance30Title')}
      icon={Shield}
      count={expiringIns.length}
      empty={t('dashboard.alertsInsurance30Empty')}
    >
      {expiringIns.map((p) => (
        <li key={p.id} className="border-gray-100 border-b py-3 text-sm last:border-0 sm:py-2">
          <Link to={adminPath(`/insurance/${p.id}/edit`)} className="font-medium text-primary hover:underline">
            {p.car?.brand} {p.car?.model}
          </Link>
          <span className="text-gray-500">
            {' '}
            · {t('dashboard.expiresShort', { date: String(p.expiry_date).slice(0, 10) })}
          </span>
        </li>
      ))}
    </AlertBlock>
  )

  const expiredBlock = (
    <AlertBlock
      title={t('dashboard.alertsInsuranceExpiredTitle')}
      icon={Shield}
      count={expiredIns.length}
      empty={t('dashboard.alertsInsuranceExpiredEmpty')}
    >
      {expiredIns.map((p) => (
        <li key={p.id} className="border-gray-100 border-b py-3 text-sm last:border-0 sm:py-2">
          <Link to={adminPath(`/insurance/${p.id}/edit`)} className="font-medium text-primary hover:underline">
            {p.car?.brand} {p.car?.model}
          </Link>
        </li>
      ))}
    </AlertBlock>
  )

  const unpaidBlock = (
    <AlertBlock
      title={t('dashboard.alertsUnpaidTitle')}
      icon={CreditCard}
      count={unpaid.length}
      empty={t('dashboard.alertsUnpaidEmpty')}
    >
      {unpaid.map((r) => (
        <li
          key={r.id}
          className="flex flex-wrap items-center justify-between gap-2 border-gray-100 border-b py-3 text-sm last:border-0 sm:py-2"
        >
          <Link to={adminPath(`/reservations/${r.id}/edit`)} className="font-medium text-primary hover:underline">
            #{r.id} · {r.payment_status}
          </Link>
          {r.customer?.phone && (
            <a
              href={paymentIssue(r.customer, r)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 shrink-0 items-center rounded-lg px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 sm:min-h-0 sm:px-0 sm:hover:bg-transparent sm:hover:underline"
            >
              WhatsApp
            </a>
          )}
        </li>
      ))}
    </AlertBlock>
  )

  const damagesBlock = (
    <AlertBlock
      title={t('dashboard.alertsDamagesTitle')}
      icon={AlertTriangle}
      count={damages.length}
      empty={t('dashboard.alertsDamagesEmpty')}
      className="lg:col-span-2"
    >
      {damages.map((d) => (
        <li key={d.id} className="border-gray-100 border-b py-3 text-sm last:border-0 sm:py-2">
          <Link to={adminPath('/damages')} className="font-medium text-primary hover:underline">
            {t('dashboard.damageNumber', { id: d.id })}
          </Link>
          <span className="text-gray-500">
            {' '}
            · {d.car?.brand} {d.car?.model} ({d.car?.license_plate})
          </span>
        </li>
      ))}
    </AlertBlock>
  )

  const mobilePanels = [overdueBlock, expiringBlock, expiredBlock, unpaidBlock, damagesBlock]

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Bell className="shrink-0 text-primary" size={22} />
          <h2 className="text-lg font-semibold text-secondary">{t('dashboard.panelAlertsTitle')}</h2>
        </div>
        <span
          className={cn(
            'w-fit rounded-full px-3 py-1.5 text-xs font-semibold sm:py-1',
            visibleTotal > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-50 text-emerald-800'
          )}
        >
          {t('dashboard.pointsToResolve', { count: visibleTotal })}
        </span>
      </div>

      <div className="lg:hidden">
        <div className="-mx-1 flex gap-1.5 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {mobileTabs.map((tab, i) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileTab(i)}
              className={cn(
                'shrink-0 rounded-full px-3 py-2.5 text-xs font-semibold transition-colors',
                mobileTab === i
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {t(`dashboard.${tab.shortKey}`)}
              {tab.count > 0 ? (
                <span className={cn('ms-1 tabular-nums', mobileTab === i ? 'text-white/90' : 'text-gray-500')}>
                  ({tab.count})
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="mt-3 min-h-0">{mobilePanels[mobileTab]}</div>
      </div>

      <div className="hidden grid-cols-1 gap-4 lg:grid lg:grid-cols-2">
        {overdueBlock}
        {expiringBlock}
        {expiredBlock}
        {unpaidBlock}
        {damagesBlock}
      </div>
    </section>
  )
}

function AlertBlock({ title, icon: Icon, count, empty, children, className }) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon size={18} className="shrink-0 text-gray-500" />
          <h3 className="text-sm font-semibold leading-snug text-secondary">{title}</h3>
        </div>
        <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">{count}</span>
      </div>
      {count === 0 ? (
        <p className="text-sm text-gray-400">{empty}</p>
      ) : (
        <ul className="max-h-[min(50vh,14rem)] overflow-y-auto overscroll-contain sm:max-h-48">{children}</ul>
      )}
    </Card>
  )
}
