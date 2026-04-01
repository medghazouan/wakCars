import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell, ChevronRight } from 'lucide-react'
import { alertsApi } from '@admin/api/alerts.api'
import { adminPath } from '@admin/adminPaths'
import { getVisibleAlertCount } from '@admin/utils/alertCounts'
import { cn } from '@admin/utils/cn'
import { overdueReturn, paymentIssue } from '@admin/utils/whatsappLinks'

export function NavAlertsBell() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const onDoc = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.getAlerts(),
    refetchInterval: 90_000,
  })

  const payload = data?.data
  const summary = payload?.summary
  const count = getVisibleAlertCount(summary)

  const overdue = (payload?.overdueReservations || []).slice(0, 4)
  const unpaid = (payload?.unpaidReservations || []).slice(0, 4)
  const expiring = (payload?.expiringInsurance || []).slice(0, 3)
  const damages = (payload?.unresolvedDamages || []).slice(0, 3)

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-secondary"
        aria-expanded={open}
        aria-label="Alertes"
      >
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute end-0 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            'absolute end-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-gray-200 bg-white py-2 shadow-xl',
            'max-h-[min(70vh,520px)] overflow-y-auto'
          )}
        >
          <div className="flex items-center justify-between border-gray-100 border-b px-4 py-2">
            <p className="text-sm font-semibold text-secondary">Alertes</p>
            <Link
              to={adminPath('/dashboard')}
              className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
              onClick={() => setOpen(false)}
            >
              Tableau de bord
              <ChevronRight size={14} />
            </Link>
          </div>

          {isLoading && <p className="px-4 py-6 text-sm text-gray-500">Chargement…</p>}

          {!isLoading && count === 0 && (
            <p className="px-4 py-6 text-center text-sm text-gray-500">Aucune alerte opérationnelle.</p>
          )}

          {!isLoading && count > 0 && (
            <div className="space-y-1 px-2 py-2">
              {overdue.length > 0 && (
                <AlertSection title="Retours en retard">
                  {overdue.map((r) => (
                    <AlertRow
                      key={`o-${r.id}`}
                      href={adminPath(`/reservations/${r.id}/edit`)}
                      onNavigate={() => setOpen(false)}
                      primary={`Réservation #${r.id}`}
                      secondary={`${r.car?.brand || ''} ${r.car?.model || ''}`}
                      extra={
                        r.customer?.phone ? (
                          <a
                            href={overdueReturn(r.customer, r)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-semibold text-emerald-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            WA
                          </a>
                        ) : null
                      }
                    />
                  ))}
                </AlertSection>
              )}

              {unpaid.length > 0 && (
                <AlertSection title="Paiements en attente">
                  {unpaid.map((r) => (
                    <AlertRow
                      key={`u-${r.id}`}
                      href={adminPath(`/reservations/${r.id}/edit`)}
                      onNavigate={() => setOpen(false)}
                      primary={`#${r.id} · ${r.payment_status}`}
                      secondary={r.car ? `${r.car.brand} ${r.car.model}` : ''}
                      extra={
                        r.customer?.phone ? (
                          <a
                            href={paymentIssue(r.customer, r)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-semibold text-emerald-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            WA
                          </a>
                        ) : null
                      }
                    />
                  ))}
                </AlertSection>
              )}

              {expiring.length > 0 && (
                <AlertSection title="Assurance (bientôt)">
                  {expiring.map((p) => (
                    <AlertRow
                      key={`i-${p.id}`}
                      href={adminPath(`/insurance/${p.id}/edit`)}
                      onNavigate={() => setOpen(false)}
                      primary={`${p.car?.brand} ${p.car?.model}`}
                      secondary={p.expiry_date ? String(p.expiry_date).slice(0, 10) : ''}
                    />
                  ))}
                </AlertSection>
              )}

              {damages.length > 0 && (
                <AlertSection title="Sinistres ouverts">
                  {damages.map((d) => (
                    <AlertRow
                      key={`d-${d.id}`}
                      href={adminPath(`/damages/${d.id}/edit`)}
                      onNavigate={() => setOpen(false)}
                      primary={`Sinistre #${d.id}`}
                      secondary={d.car?.license_plate || ''}
                    />
                  ))}
                </AlertSection>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AlertSection({ title, children }) {
  return (
    <div className="rounded-lg bg-gray-50/80 py-2">
      <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">{title}</p>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  )
}

function AlertRow({ href, onNavigate, primary, secondary, extra }) {
  return (
    <li>
      <Link
        to={href}
        onClick={onNavigate}
        className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-white"
      >
        <span className="min-w-0 flex-1">
          <span className="font-medium text-secondary">{primary}</span>
          {secondary ? <span className="block truncate text-xs text-gray-500">{secondary}</span> : null}
        </span>
        {extra}
      </Link>
    </li>
  )
}
