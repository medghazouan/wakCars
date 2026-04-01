import { Card } from './Card'
import { cn } from '@admin/utils/cn'

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  iconClassName, 
  badgeText, 
  badgeVariant = 'success' 
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconClassName)}>
          <Icon size={20} />
        </div>
        {badgeText && (
          <span className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full",
            badgeVariant === 'success' ? 'bg-success/10 text-success' : '',
            badgeVariant === 'warning' ? 'bg-warning/10 text-warning' : '',
            badgeVariant === 'danger' ? 'bg-danger/10 text-danger' : '',
            badgeVariant === 'neutral' ? 'bg-gray-100 text-gray-600' : ''
          )}>
            {badgeText}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-secondary">{value}</h3>
        </div>
      </div>
    </Card>
  )
}
