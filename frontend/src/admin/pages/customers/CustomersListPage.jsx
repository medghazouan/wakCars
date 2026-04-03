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
      className="mx-auto w-full min-w-0 max-w-7xl space-y-6 sm:space-y-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="mb-2 text-2xl font-bold text-secondary sm:text-3xl">Customers</h1>
          <p className="text-sm text-gray-400 sm:text-base">Manage your client base and view rental histories.</p>
        </div>
        <Button className="w-full shrink-0 sm:w-auto">+ Add New Customer</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Customers" value={data?.meta?.total || 0} icon={Users} badgeText="Active" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-sm border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 shadow-booking hover:text-secondary sm:ms-auto sm:w-auto"
          >
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
