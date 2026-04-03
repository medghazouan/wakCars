import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CreditCard, Filter } from 'lucide-react'
import { paymentsApi } from '@admin/api/customers.api' // exported from same file
import { pageTransition } from '@admin/animations/variants'
import { Button } from '@admin/components/ui/Button'
import { DataTable } from '@admin/components/ui/DataTable'
import { StatsCard } from '@admin/components/ui/StatsCard'
import { StatusBadge } from '@admin/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@admin/utils/formatters'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'

export default function PaymentsListPage() {
  const { t } = useAdminLanguage()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page],
    queryFn: () => paymentsApi.getList({ page, limit: 10 }),
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
        key: 'reservation',
        label: t('page.payments.reservationRef'),
        render: (p) => (
          <span className="font-mono font-semibold text-secondary">
            #WAK-{p.reservation_id.toString().padStart(4, '0')}
          </span>
        ),
      },
      {
        key: 'amount',
        label: t('page.payments.amount'),
        render: (p) => <span className="font-bold text-secondary">{formatCurrency(p.amount)}</span>,
      },
      { key: 'method', label: t('page.payments.method'), render: (p) => p.method },
      {
        key: 'status',
        label: t('page.payments.status'),
        render: (p) => <StatusBadge status={p.status} />,
      },
      {
        key: 'date',
        label: t('page.payments.date'),
        render: (p) => formatDate(p.created_at),
      },
    ],
    [t]
  )

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
          <h1 className="mb-2 text-2xl font-bold text-secondary sm:text-3xl">{t('page.payments.title')}</h1>
          <p className="text-sm text-gray-400 sm:text-base">{t('page.payments.subtitle')}</p>
        </div>
        <Button className="w-full shrink-0 sm:w-auto">+ {t('page.payments.recordPayment')}</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatsCard title={t('page.payments.totalTransactions')} value={data?.meta?.total || 0} icon={CreditCard} />
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
    </motion.div>
  )
}
