import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ar, fr } from 'date-fns/locale'
import { adminPath } from '@admin/adminPaths'
import { reservationsApi } from '@admin/api/reservations.api'
import { StatusBadge } from '@admin/components/ui/StatusBadge'
import { formatCurrency } from '@admin/utils/formatters'
import { Card } from '@admin/components/ui/Card'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'

export function RecentReservationsTable() {
  const { t, currentLanguage } = useAdminLanguage()
  const dfLocale = currentLanguage === 'ar' ? ar : fr

  const { data, isLoading } = useQuery({
    queryKey: ['reservations', 'recent'],
    queryFn: () => reservationsApi.getList({ limit: 5 }),
  })

  const reservations = data?.data || []

  const categoryLabel = (cat) => {
    if (!cat) return '—'
    if (currentLanguage === 'ar') return cat.name_ar || cat.name_fr || '—'
    return cat.name_fr || cat.name_ar || '—'
  }

  return (
    <Card className="w-full">
      <div className="flex flex-col gap-1 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-secondary">{t('dashboard.recentTitle')}</h3>
          <p className="text-sm text-gray-400">{t('dashboard.recentSubtitle')}</p>
        </div>
        <Link
          to={adminPath('/reservations')}
          className="text-sm font-semibold text-primary hover:underline sm:shrink-0"
        >
          {t('dashboard.viewAll')}
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4 rounded-tl-xl">{t('dashboard.colClient')}</th>
              <th className="px-6 py-4">{t('dashboard.colVehicle')}</th>
              <th className="px-6 py-4">{t('dashboard.colDuration')}</th>
              <th className="px-6 py-4">{t('dashboard.colStatus')}</th>
              <th className="px-6 py-4 rounded-tr-xl">{t('dashboard.colAmount')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  {t('dashboard.recentLoading')}
                </td>
              </tr>
            ) : reservations.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  {t('dashboard.recentEmpty')}
                </td>
              </tr>
            ) : (
              reservations.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">
                        {res.customer ? `${res.customer.first_name[0]}${res.customer.last_name[0]}` : '—'}
                      </div>
                      <span className="font-semibold text-secondary">
                        {res.customer
                          ? `${res.customer.first_name} ${res.customer.last_name}`
                          : t('dashboard.guest')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-secondary">
                      {res.car?.brand} {res.car?.model}
                    </div>
                    <div className="text-xs text-gray-500">{categoryLabel(res.car?.category)}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {format(new Date(res.pickup_date), 'MMM dd', { locale: dfLocale })} -{' '}
                    {format(new Date(res.dropoff_date), 'MMM dd', { locale: dfLocale })}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={res.status} />
                  </td>
                  <td className="px-6 py-4 font-bold text-secondary">{formatCurrency(res.total_amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
