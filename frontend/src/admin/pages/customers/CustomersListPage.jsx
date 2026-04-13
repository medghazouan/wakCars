import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion as Motion } from 'framer-motion'
import { Users, Filter } from 'lucide-react'
import { customersApi } from '@admin/api/customers.api'
import { pageTransition } from '@admin/animations/variants'
import { DataTable } from '@admin/components/ui/DataTable'
import { StatsCard } from '@admin/components/ui/StatsCard'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'

function CustomersListInner({ searchFromUrl }) {
  const { t } = useAdminLanguage()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, searchFromUrl],
    queryFn: () =>
      customersApi.getList({
        page,
        limit: 10,
        ...(searchFromUrl ? { search: searchFromUrl } : {}),
      }),
  })

  const pagination = useMemo(() => {
    const m = data?.meta
    if (!m || m.total == null || !m.limit) return undefined
    return {
      ...m,
      totalPages: Math.max(1, Math.ceil(m.total / m.limit)),
    }
  }, [data?.meta])

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: t('page.customers.colCustomer'),
        render: (c) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-600">
              {c.first_name[0]}
              {c.last_name[0]}
            </div>
            <div>
              <p className="font-bold text-secondary">
                {c.first_name} {c.last_name}
              </p>
              <p className="font-mono text-xs text-gray-500">
                {t('page.customers.cin')}: {c.cin_number}
              </p>
            </div>
          </div>
        ),
      },
      { key: 'phone', label: t('page.customers.phone'), render: (c) => c.phone },
      { key: 'email', label: t('page.customers.email'), render: (c) => c.email },
      {
        key: 'reservations',
        label: t('page.customers.reservations'),
        render: (c) => (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-secondary">
            {t('page.customers.reservationsTotal', { count: c._count?.reservations || 0 })}
          </span>
        ),
      },
    ],
    [t]
  )

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatsCard
          title={t('page.customers.totalCustomers')}
          value={data?.meta?.total || 0}
          icon={Users}
          badgeText={t('page.customers.active')}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-sm border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 shadow-booking hover:text-secondary sm:ms-auto sm:w-auto"
          >
            <Filter size={16} />
            {t('common.filter')}
          </button>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
        />
      </div>
    </>
  )
}

export default function CustomersListPage() {
  const [searchParams] = useSearchParams()
  const searchFromUrl = (searchParams.get('search') || '').trim()
  const listKey = searchFromUrl || '__all__'

  return (
    <Motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="mx-auto w-full min-w-0 max-w-7xl space-y-6 sm:space-y-8"
    >
      <CustomersListInner key={listKey} searchFromUrl={searchFromUrl} />
    </Motion.div>
  )
}
