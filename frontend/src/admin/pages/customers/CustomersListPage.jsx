import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Filter } from 'lucide-react'
import { customersApi } from '@admin/api/customers.api'
import { pageTransition } from '@admin/animations/variants'
import { Button } from '@admin/components/ui/Button'
import { DataTable } from '@admin/components/ui/DataTable'
import { StatsCard } from '@admin/components/ui/StatsCard'

export default function CustomersListPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page],
    queryFn: () => customersApi.getList({ page, limit: 10 }),
  })

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 flex-shrink-0">
            {c.first_name[0]}{c.last_name[0]}
          </div>
          <div>
            <p className="font-bold text-secondary">{c.first_name} {c.last_name}</p>
            <p className="text-xs text-gray-500 font-mono">CIN: {c.cin_number}</p>
          </div>
        </div>
      )
    },
    { key: 'phone', label: 'Phone', render: (c) => c.phone },
    { key: 'email', label: 'Email', render: (c) => c.email },
    {
      key: 'reservations',
      label: 'Reservations',
      render: (c) => (
        <span className="font-semibold text-secondary bg-gray-100 px-3 py-1 rounded-full text-xs">
          {c._count?.reservations || 0} Total
        </span>
      )
    }
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
          <h1 className="text-3xl font-bold text-secondary mb-2">Customers</h1>
          <p className="text-gray-400">Manage your client base and view rental histories.</p>
        </div>
        <Button>+ Add New Customer</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Customers" value={data?.meta?.total || 0} icon={Users} badgeText="Active" />
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
