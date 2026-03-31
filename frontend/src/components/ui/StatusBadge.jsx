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
  // Payments
  UNPAID: { label: 'Unpaid', variant: 'danger' },
  PARTIAL: { label: 'Deposit Paid', variant: 'warning' },
  PAID: { label: 'Paid in Full', variant: 'success' },
  REFUNDED: { label: 'Refunded', variant: 'default' },
  URGENT: { label: 'Urgent', variant: 'danger' },
  READY: { label: 'Ready', variant: 'success' },
}

export function StatusBadge({ status, type = 'default' }) {
  const config = statusMap[status] || { label: status, variant: 'default' }
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}
