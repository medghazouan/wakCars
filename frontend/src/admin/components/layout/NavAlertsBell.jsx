import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell, ChevronRight, RefreshCw } from 'lucide-react'
import { alertsApi } from '@admin/api/alerts.api'
import { adminPath } from '@admin/adminPaths'
import { Button } from '@admin/components/ui/Button'
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

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.getAlerts(),
    refetchInterval: 90_000,
    retry: 2,
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
        className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-secondary sm:min-h-0 sm:min-w-0 sm:rounded-lg sm:p-1.5"
        aria-expanded={open}
        aria-label="Alertes"
      >
        <Bell size={22} className="sm:h-5 sm:w-5" />
        {count > 0 && (
          <span className="absolute end-0 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            'z-[60] overflow-x-hidden overflow-y-auto overscroll-contain rounded-2xl border border-gray-200 bg-white py-2 shadow-2xl',
            'max-h-[min(78dvh,560px)]',
            /* Mobile: anchored below header, full-width inset */
            'fixed start-3 end-3 top-[calc(3.5rem+0.5rem+env(safe-area-inset-top,0px))] w-auto',
            /* Desktop: anchored dropdown */
            'sm:absolute sm:inset-auto sm:end-0 sm:start-auto sm:top-full sm:mt-2 sm:w-[min(100vw-2rem,22rem)] sm:max-w-none sm:rounded-xl sm:shadow-xl'
          )}
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-gray-100 border-b px-3 py-3 sm:px-4 sm:py-2.5">
            <p className="text-base font-semibold text-secondary sm:text-sm">Alertes</p>
            <div className="flex items-center gap-2">
              {isError ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 min-h-[44px] gap-1.5 px-3 text-xs sm:min-h-0"
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} />
                  Réessayer
                </Button>
              ) : null}
              <Link
                to={adminPath('/dashboard')}
                className="flex min-h-[44px] items-center gap-0.5 rounded-lg px-2 text-xs font-medium text-primary hover:bg-primary/5 hover:underline sm:min-h-0"
                onClick={() => setOpen(false)}
              >
                Tableau de bord
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {isLoading && <p className="px-4 py-8 text-center text-sm text-gray-500">Chargement…</p>}

          {isError && !isLoading && (
            <div className="space-y-3 px-4 py-8 text-center">
              <p className="text-sm text-amber-800">Impossible de charger les alertes.</p>
              <Button type="button" size="sm" className="min-h-11 w-full max-w-xs" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw size={16} className={cn('me-2', isFetching && 'animate-spin')} />
                Réessayer
              </Button>
            </div>
          )}

          {!isLoading && !isError && count === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-500">Aucune alerte opérationnelle.</p>
          )}

          {!isLoading && !isError && count > 0 && (
            <div className="space-y-2 px-2 py-3 sm:space-y-1 sm:py-2">
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
                            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 sm:min-h-0 sm:min-w-0 sm:px-1"
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
                            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 sm:min-h-0 sm:min-w-0 sm:px-1"
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
    <div className="rounded-xl bg-gray-50/90 py-1 sm:rounded-lg sm:bg-gray-50/80">
      <p className="px-3 pb-1.5 pt-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 sm:px-2 sm:pb-1 sm:pt-0">
        {title}
      </p>
      <ul className="space-y-0.5 px-1 pb-1 sm:px-0 sm:pb-0">{children}</ul>
    </div>
  )
}

function AlertRow({ href, onNavigate, primary, secondary, extra }) {
  return (
    <li>
      <Link
        to={href}
        onClick={onNavigate}
        className="flex min-h-[48px] items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors active:bg-white/80 sm:min-h-0 sm:rounded-md sm:px-2 sm:py-2 sm:hover:bg-white"
      >
        <span className="min-w-0 flex-1 text-start">
          <span className="font-medium text-secondary">{primary}</span>
          {secondary ? <span className="mt-0.5 block truncate text-xs text-gray-500">{secondary}</span> : null}
        </span>
        {extra ? <span className="shrink-0">{extra}</span> : null}
      </Link>
    </li>
  )
}
