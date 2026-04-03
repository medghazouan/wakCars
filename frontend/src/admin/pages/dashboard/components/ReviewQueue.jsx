import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { alertsApi } from '@admin/api/alerts.api'
import { Card } from '@admin/components/ui/Card'

export function ReviewQueue() {
  const { data, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.getAlerts(),
  })

  const queue = data?.data?.expiringTechVisits?.slice(0, 3) || []

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold text-secondary">Review Queue</h3>
        <span className="w-fit text-[10px] font-bold uppercase tracking-widest text-danger bg-danger/10 px-2 py-1 rounded">
          High Priority
        </span>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : queue.length === 0 ? (
          <p className="text-sm text-gray-400">No pending reviews.</p>
        ) : (
          queue.map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
              <div className="w-16 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                {item.car?.images?.[0]?.url ? (
                  <img src={item.car.images[0].url} alt={item.car.brand} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-300"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-secondary text-sm truncate">{item.car?.brand} {item.car?.model}</p>
                <p className="text-xs text-gray-500 truncate">Inspection due soon</p>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
