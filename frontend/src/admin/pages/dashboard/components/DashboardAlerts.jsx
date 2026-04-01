import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Bell, Car, CreditCard, Shield } from 'lucide-react'
import { alertsApi } from '@admin/api/alerts.api'
import { adminPath } from '@admin/adminPaths'
import { Card } from '@admin/components/ui/Card'
import { getVisibleAlertCount } from '@admin/utils/alertCounts'
import { cn } from '@admin/utils/cn'
import { overdueReturn, paymentIssue } from '@admin/utils/whatsappLinks'

/**
 * PRD alert-style panel. Technical / maintenance visit alerts are omitted by product request.
 */
export function DashboardAlerts() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.getAlerts(),
    refetchInterval: 120_000,
  })

  const payload = data?.data
  const summary = payload?.summary

  const visibleTotal = getVisibleAlertCount(summary)

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-gray-500">Chargement des alertes…</p>
      </Card>
    )
  }

  if (isError || !payload) {
    return (
      <Card className="p-6">
        <p className="text-sm text-amber-700">Impossible de charger les alertes.</p>
      </Card>
    )
  }

  const overdue = payload.overdueReservations || []
  const expiringIns = payload.expiringInsurance || []
  const expiredIns = payload.expiredInsurance || []
  const unpaid = payload.unpaidReservations || []
  const damages = payload.unresolvedDamages || []

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="text-primary" size={22} />
          <h2 className="text-lg font-semibold text-secondary">Alertes opérationnelles</h2>
        </div>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold',
            visibleTotal > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-50 text-emerald-800'
          )}
        >
          {visibleTotal} point{visibleTotal !== 1 ? 's' : ''} à traiter
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AlertBlock
          title="Retours en retard"
          icon={Car}
          count={overdue.length}
          empty="Aucun retour en retard."
        >
          {overdue.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-gray-100 border-b py-2 text-sm last:border-0">
              <div>
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
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  WhatsApp
                </a>
              )}
            </li>
          ))}
        </AlertBlock>

        <AlertBlock
          title="Assurance — échéance sous 30 j."
          icon={Shield}
          count={expiringIns.length}
          empty="Aucune échéance proche."
        >
          {expiringIns.map((p) => (
            <li key={p.id} className="border-gray-100 border-b py-2 text-sm last:border-0">
              <Link
                to={adminPath(`/insurance/${p.id}/edit`)}
                className="font-medium text-primary hover:underline"
              >
                {p.car?.brand} {p.car?.model}
              </Link>
              <span className="text-gray-500"> · expire {String(p.expiry_date).slice(0, 10)}</span>
            </li>
          ))}
        </AlertBlock>

        <AlertBlock
          title="Assurance expirée"
          icon={Shield}
          count={expiredIns.length}
          empty="Aucune police expirée listée."
        >
          {expiredIns.map((p) => (
            <li key={p.id} className="border-gray-100 border-b py-2 text-sm last:border-0">
              <Link
                to={adminPath(`/insurance/${p.id}/edit`)}
                className="font-medium text-primary hover:underline"
              >
                {p.car?.brand} {p.car?.model}
              </Link>
            </li>
          ))}
        </AlertBlock>

        <AlertBlock
          title="Paiements en attente"
          icon={CreditCard}
          count={unpaid.length}
          empty="Tous les paiements sont à jour."
        >
          {unpaid.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-gray-100 border-b py-2 text-sm last:border-0">
              <Link
                to={adminPath(`/reservations/${r.id}/edit`)}
                className="font-medium text-primary hover:underline"
              >
                #{r.id} · {r.payment_status}
              </Link>
              {r.customer?.phone && (
                <a
                  href={paymentIssue(r.customer, r)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  WhatsApp
                </a>
              )}
            </li>
          ))}
        </AlertBlock>

        <AlertBlock
          title="Sinistres non résolus"
          icon={AlertTriangle}
          count={damages.length}
          empty="Aucun sinistre ouvert."
          className="lg:col-span-2"
        >
          {damages.map((d) => (
            <li key={d.id} className="border-gray-100 border-b py-2 text-sm last:border-0">
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
      </div>
    </section>
  )
}

function AlertBlock({ title, icon: Icon, count, empty, children, className }) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-secondary">{title}</h3>
        </div>
        <span className="text-xs font-bold text-gray-400">{count}</span>
      </div>
      {count === 0 ? (
        <p className="text-sm text-gray-400">{empty}</p>
      ) : (
        <ul className="max-h-48 overflow-y-auto">{children}</ul>
      )}
    </Card>
  )
}
