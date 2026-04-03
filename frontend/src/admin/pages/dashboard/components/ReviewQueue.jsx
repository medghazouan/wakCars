import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { alertsApi } from '@admin/api/alerts.api'
import { Card } from '@admin/components/ui/Card'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'

export function ReviewQueue() {
  const { t } = useAdminLanguage()
  const { data, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.getAlerts(),
  })

  const queue = data?.data?.expiringTechVisits?.slice(0, 3) || []

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold text-secondary">{t('dashboardWidgets.reviewQueue')}</h3>
        <span className="w-fit rounded bg-danger/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-danger">
          {t('dashboardWidgets.highPriority')}
        </span>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-gray-400">{t('dashboardWidgets.loading')}</p>
        ) : queue.length === 0 ? (
          <p className="text-sm text-gray-400">{t('dashboardWidgets.noReviews')}</p>
        ) : (
          queue.map((item, i) => (
            <div
              key={i}
              className="group flex cursor-pointer items-center gap-4 rounded-lg p-2 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-12 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
                {item.car?.images?.[0]?.url ? (
                  <img src={item.car.images[0].url} alt={item.car.brand} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gray-300"></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-secondary">
                  {item.car?.brand} {item.car?.model}
                </p>
                <p className="truncate text-xs text-gray-500">{t('dashboardWidgets.inspectionDue')}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400 transition-colors group-hover:text-primary" />
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
