import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CreditCard, Filter } from 'lucide-react'
import { paymentsApi } from '@/api/customers.api' // exported from same file
import { pageTransition } from '@/animations/variants'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { StatsCard } from '@/components/ui/StatsCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@/utils/formatters'

export default function PaymentsListPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page],
    queryFn: () => paymentsApi.getList({ page, limit: 10 }),
  })

  const columns = [
    {
      key: 'reservation',
      label: 'Reservation Ref',
      render: (p) => (
        <span className="font-mono font-semibold text-secondary">
          #WAK-{p.reservation_id.toString().padStart(4, '0')}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (p) => <span className="font-bold text-secondary">{formatCurrency(p.amount)}</span>
    },
    { key: 'method', label: 'Method', render: (p) => p.method },
    { key: 'status', label: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    { key: 'date', label: 'Date', render: (p) => formatDate(p.created_at) },
  ]

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="max-w-7xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">Payments</h1>
          <p className="text-gray-400">Track and manage all transactions.</p>
        </div>
        <Button>+ Record Payment</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Transactions" value={data?.meta?.total || 0} icon={CreditCard} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-secondary bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
            <Filter size={16} />
            Filter
          </button>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          pagination={data?.meta}
          onPageChange={setPage}
        />
      </div>
    </motion.div>
  )
}
