import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { adminPath } from '@admin/adminPaths'
import { Button } from '@admin/components/ui/Button'
import { cn } from '@admin/utils/cn'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/**
 * @param {{ month: Date; reservations: any[]; isLoading: boolean; onMonthChange: (d: Date) => void }} props
 */
export function ReservationsCalendarMonth({ month, reservations, isLoading, onMonthChange }) {
  const navigate = useNavigate()

  const { days, pickupsByDay } = useMemo(() => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const daysList = eachDayOfInterval({ start: gridStart, end: gridEnd })

    const map = new Map()
    for (const r of reservations || []) {
      if (!r.pickup_date) continue
      const d = parseISO(r.pickup_date)
      const key = format(d, 'yyyy-MM-dd')
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(r)
    }

    return { days: daysList, pickupsByDay: map }
  }, [month, reservations])

  const now = new Date()

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-secondary">
          Upcoming pickups — {format(month, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9 px-2"
            aria-label="Previous month"
            onClick={() => onMonthChange(addMonths(month, -1))}
          >
            <ChevronLeft size={18} />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-9 px-3 text-xs font-semibold"
            onClick={() => onMonthChange(new Date())}
          >
            Today
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9 px-2"
            aria-label="Next month"
            onClick={() => onMonthChange(addMonths(month, 1))}
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <p className="mb-4 text-xs text-gray-500">
        Reservations with pickup date in this month. Click an entry to edit the booking.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="min-h-[88px] animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              const items = pickupsByDay.get(key) || []
              const inMonth = isSameMonth(day, month)
              const isToday = isSameDay(day, now)

              return (
                <div
                  key={key}
                  className={cn(
                    'min-h-[92px] rounded-lg border p-1.5 text-left transition-colors',
                    inMonth ? 'border-gray-100 bg-white' : 'border-transparent bg-gray-50/80 text-gray-400',
                    isToday && 'ring-2 ring-primary/30'
                  )}
                >
                  <span
                    className={cn(
                      'mb-1 block text-xs font-semibold',
                      inMonth ? 'text-secondary' : 'text-gray-400'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  <div className="flex max-h-[68px] flex-col gap-1 overflow-y-auto">
                    {items.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => navigate(adminPath(`/reservations/${r.id}/edit`))}
                        className={cn(
                          'truncate rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-left text-[10px] font-medium leading-tight',
                          'text-secondary hover:border-primary hover:bg-red-50/50'
                        )}
                        title={`#${r.id} ${r.car?.brand || ''} ${r.car?.model || ''}`}
                      >
                        <span className="font-mono text-gray-500">#{r.id}</span>{' '}
                        {format(parseISO(r.pickup_date), 'HH:mm')}
                        <br />
                        <span className="text-gray-600">
                          {r.car?.brand} {r.car?.model}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
