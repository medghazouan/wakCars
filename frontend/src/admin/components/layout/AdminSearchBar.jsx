import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Search } from 'lucide-react'
import { adminPath } from '@admin/adminPaths'
import { searchApi } from '@admin/api/search.api'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'
import { cn } from '@admin/utils/cn'

export function AdminSearchBar({ className }) {
  const { t } = useAdminLanguage()
  const navigate = useNavigate()
  const wrapRef = useRef(null)
  const inputRef = useRef(null)
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const tmr = setTimeout(() => setDebounced(q.trim()), 300)
    return () => clearTimeout(tmr)
  }, [q])

  const { data, isFetching } = useQuery({
    queryKey: ['admin-search', debounced],
    queryFn: () => searchApi.quick(debounced),
    enabled: debounced.length >= 2,
  })

  const bucket = data?.data
  const customers = bucket?.customers ?? []
  const cars = bucket?.cars ?? []
  const reservations = bucket?.reservations ?? []
  const totalHits = customers.length + cars.length + reservations.length

  useEffect(() => {
    function onDocDown(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [])

  useEffect(() => {
    if (debounced.length < 2) setOpen(false)
  }, [debounced])

  const goCustomer = (c) => {
    const term = (c.phone || `${c.first_name} ${c.last_name}`.trim()).trim()
    navigate(adminPath(`/customers?search=${encodeURIComponent(term)}`))
    setOpen(false)
    setQ('')
    setDebounced('')
    inputRef.current?.blur()
  }

  const goCar = (car) => {
    navigate(adminPath(`/fleet/${car.id}`))
    setOpen(false)
    setQ('')
    setDebounced('')
    inputRef.current?.blur()
  }

  const goReservation = (r) => {
    navigate(adminPath(`/reservations/${r.id}/edit`))
    setOpen(false)
    setQ('')
    setDebounced('')
    inputRef.current?.blur()
  }

  const showPanel = open && debounced.length >= 2

  return (
    <div ref={wrapRef} className={cn('relative min-w-0 flex-1 md:max-w-md lg:max-w-xl', className)}>
      <Search
        className={cn(
          'pointer-events-none absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400',
          'start-3'
        )}
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        value={q}
        onChange={(e) => {
          const v = e.target.value
          setQ(v)
          if (v.trim().length >= 2) setOpen(true)
        }}
        onFocus={() => {
          if (q.trim().length >= 2) setOpen(true)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false)
            inputRef.current?.blur()
          }
        }}
        placeholder={t('topbar.searchPlaceholder')}
        autoComplete="off"
        aria-expanded={showPanel}
        aria-controls="admin-search-results"
        className="h-9 w-full rounded-full border border-gray-100 bg-white py-2 ps-10 pe-4 text-sm text-text-primary transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:h-10"
      />

      {showPanel ? (
        <div
          id="admin-search-results"
          role="listbox"
          className="absolute start-0 top-[calc(100%+6px)] z-50 max-h-[min(70vh,28rem)] w-full overflow-y-auto rounded-xl border border-gray-100 bg-white py-2 shadow-booking"
        >
          {isFetching ? (
            <p className="px-4 py-3 text-sm text-gray-500">{t('topbar.searchLoading')}</p>
          ) : totalHits === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">{t('topbar.searchNoResults')}</p>
          ) : (
            <div className="space-y-3">
              {customers.length > 0 ? (
                <div>
                  <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    {t('topbar.searchSectionCustomers')}
                  </p>
                  <ul className="space-y-0.5">
                    {customers.map((c) => (
                      <li key={`c-${c.id}`}>
                        <button
                          type="button"
                          className="w-full px-4 py-2 text-start text-sm hover:bg-gray-50"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => goCustomer(c)}
                        >
                          <span className="font-medium text-secondary">
                            {c.first_name} {c.last_name}
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-500">{c.phone}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {cars.length > 0 ? (
                <div>
                  <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    {t('topbar.searchSectionCars')}
                  </p>
                  <ul className="space-y-0.5">
                    {cars.map((car) => (
                      <li key={`car-${car.id}`}>
                        <button
                          type="button"
                          className="w-full px-4 py-2 text-start text-sm hover:bg-gray-50"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => goCar(car)}
                        >
                          <span className="font-medium text-secondary">
                            {car.brand} {car.model}
                            {car.year != null ? ` · ${car.year}` : ''}
                          </span>
                          <span className="mt-0.5 block font-mono text-xs text-gray-500">{car.license_plate}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {reservations.length > 0 ? (
                <div>
                  <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    {t('topbar.searchSectionReservations')}
                  </p>
                  <ul className="space-y-0.5">
                    {reservations.map((r) => {
                      const cust = r.customer
                      const car = r.car
                      const custLabel = cust
                        ? `${cust.first_name} ${cust.last_name}`.trim()
                        : '—'
                      const carLabel = car ? `${car.brand} ${car.model}`.trim() : '—'
                      let dateLabel = ''
                      if (r.pickup_date) {
                        const d = new Date(r.pickup_date)
                        if (!Number.isNaN(d.getTime())) dateLabel = format(d, 'dd/MM/yyyy')
                      }
                      return (
                        <li key={`r-${r.id}`}>
                          <button
                            type="button"
                            className="w-full px-4 py-2 text-start text-sm hover:bg-gray-50"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => goReservation(r)}
                          >
                            <span className="font-medium text-secondary">
                              #{r.id} · {r.status}
                            </span>
                            <span className="mt-0.5 block text-xs text-gray-500">
                              {custLabel} · {carLabel}
                              {dateLabel ? ` · ${dateLabel}` : ''}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      {q.trim().length === 1 ? (
        <p className="pointer-events-none absolute start-0 top-[calc(100%+4px)] text-xs text-gray-400">{t('topbar.searchMinChars')}</p>
      ) : null}
    </div>
  )
}
