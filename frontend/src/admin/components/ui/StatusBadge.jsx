import { useTranslation } from 'react-i18next'
import { Badge } from './Badge'

export const statusMap = {
  // Cars
  AVAILABLE: { label: 'Available', variant: 'success' },
  RENTED: { label: 'Rented', variant: 'info' },
  MAINTENANCE: { label: 'Maintenance', variant: 'warning' },
  INACTIVE: { label: 'Inactive', variant: 'default' },
  OUT_OF_SERVICE: { label: 'Out of Service', variant: 'danger' },
  // Reservations
  PENDING: { label: 'Pending', variant: 'warning' },
  CONFIRMED: { label: 'Confirmed', variant: 'success' },
  ACTIVE: { label: 'In Progress', variant: 'info' },
  COMPLETED: { label: 'Completed', variant: 'default' },
  CANCELLED: { label: 'Cancelled', variant: 'danger' },
  NO_SHOW: { label: 'No-show', variant: 'default' },
  // Payments
  UNPAID: { label: 'Unpaid', variant: 'danger' },
  PARTIAL: { label: 'Deposit Paid', variant: 'warning' },
  PAID: { label: 'Paid in Full', variant: 'success' },
  REFUNDED: { label: 'Refunded', variant: 'default' },
  URGENT: { label: 'Urgent', variant: 'danger' },
  READY: { label: 'Ready', variant: 'success' },
  // Insurance & Technical
  EXPIRED: { label: 'Expired', variant: 'danger' },
  COMPLIANT: { label: 'Compliant', variant: 'success' },
  DUE_SOON: { label: 'Due Soon', variant: 'warning' },
  CRITICAL: { label: 'Critical', variant: 'danger' },
}

export function StatusBadge({ status, type = 'default' }) {
  const { t } = useTranslation('admin')
  const config = statusMap[status] || { label: status, variant: 'default' }
  const label =
    status != null && String(status).length
      ? t(`status.${status}`, { defaultValue: config.label })
      : config.label

  return (
    <Badge variant={config.variant}>
      {label}
    </Badge>
  )
}
