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

/**
 * PRD alert-style panel. Technical / maintenance visit alerts are omitted by product request.
 */
export function DashboardAlerts() {
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
        <p className="text-sm text-gray-500">Chargement des alertes…</p>
      </Card>
    )
  }

  if (isError || !payload) {
    return (
      <Card className="space-y-4 p-4 sm:p-6">
        <p className="text-sm text-amber-800">Impossible de charger les alertes.</p>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full sm:w-auto"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw size={16} className={cn('me-2', isFetching && 'animate-spin')} />
          Réessayer
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
    { id: 'overdue', short: 'Retards', count: overdue.length },
    { id: 'ins30', short: 'Assur. 30j', count: expiringIns.length },
    { id: 'insexp', short: 'Assur. exp.', count: expiredIns.length },
    { id: 'pay', short: 'Paiements', count: unpaid.length },
    { id: 'dmg', short: 'Sinistres', count: damages.length },
  ]

  const overdueBlock = (
    <AlertBlock title="Retours en retard" icon={Car} count={overdue.length} empty="Aucun retour en retard.">
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
              Réservation #{r.id}
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
      title="Assurance — échéance sous 30 j."
      icon={Shield}
      count={expiringIns.length}
      empty="Aucune échéance proche."
    >
      {expiringIns.map((p) => (
        <li key={p.id} className="border-gray-100 border-b py-3 text-sm last:border-0 sm:py-2">
          <Link to={adminPath(`/insurance/${p.id}/edit`)} className="font-medium text-primary hover:underline">
            {p.car?.brand} {p.car?.model}
          </Link>
          <span className="text-gray-500"> · expire {String(p.expiry_date).slice(0, 10)}</span>
        </li>
      ))}
    </AlertBlock>
  )

  const expiredBlock = (
    <AlertBlock title="Assurance expirée" icon={Shield} count={expiredIns.length} empty="Aucune police expirée listée.">
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
      title="Paiements en attente"
      icon={CreditCard}
      count={unpaid.length}
      empty="Tous les paiements sont à jour."
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
      title="Sinistres non résolus"
      icon={AlertTriangle}
      count={damages.length}
      empty="Aucun sinistre ouvert."
      className="lg:col-span-2"
    >
      {damages.map((d) => (
        <li key={d.id} className="border-gray-100 border-b py-3 text-sm last:border-0 sm:py-2">
          <Link to={adminPath('/damages')} className="font-medium text-primary hover:underline">
            Sinistre #{d.id}
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
          <h2 className="text-lg font-semibold text-secondary">Alertes opérationnelles</h2>
        </div>
        <span
          className={cn(
            'w-fit rounded-full px-3 py-1.5 text-xs font-semibold sm:py-1',
            visibleTotal > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-50 text-emerald-800'
          )}
        >
          {visibleTotal} point{visibleTotal !== 1 ? 's' : ''} à traiter
        </span>
      </div>

      {/* Mobile: horizontal category tabs + single panel */}
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
              {tab.short}
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
