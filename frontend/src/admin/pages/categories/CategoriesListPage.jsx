import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FolderTree, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { categoriesApi } from '@admin/api/categories.api'
import { pageTransition } from '@admin/animations/variants'
import { Button } from '@admin/components/ui/Button'
import { DataTable } from '@admin/components/ui/DataTable'
import { StatsCard } from '@admin/components/ui/StatsCard'
import { useAuth } from '@admin/hooks/useAuth'
import { cn } from '@admin/utils/cn'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'

export default function CategoriesListPage() {
  const { t } = useAdminLanguage()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isAdmin = useAuth((s) => s.admin?.role) === 'ADMIN'

  const { data, isLoading } = useQuery({
    queryKey: ['categories', 'admin-list'],
    queryFn: () => categoriesApi.getList({ limit: 200 }),
  })

  const rows = data?.data || []
  const activeCount = rows.filter((c) => c.is_active).length

  const deactivateMutation = useMutation({
    mutationFn: (id) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('page.categories.toastDeactivated'))
    },
    onError: (err) => toast.error(err.response?.data?.error || t('page.categories.toastActionErr')),
  })

  const columns = useMemo(
    () => [
      {
        key: 'names',
        label: t('page.categories.colName'),
        render: (c) => (
          <div className="min-w-0">
            <p className="font-medium text-secondary">{c.name_fr}</p>
            <p className="truncate text-xs text-gray-500" dir="rtl">
              {c.name_ar}
            </p>
          </div>
        ),
      },
      {
        key: 'slug',
        label: t('page.categories.colSlug'),
        render: (c) => <span className="font-mono text-xs text-gray-600">{c.slug}</span>,
      },
      {
        key: 'cars',
        label: t('page.categories.colCars'),
        render: (c) => <span className="tabular-nums">{c._count?.cars ?? 0}</span>,
      },
      {
        key: 'order',
        label: t('page.categories.colOrder'),
        render: (c) => c.sort_order,
      },
      {
        key: 'status',
        label: t('page.categories.status'),
        render: (c) => (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              c.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-200 text-gray-600'
            )}
          >
            {c.is_active ? t('page.categories.statusActive') : t('page.categories.statusInactive')}
          </span>
        ),
      },
      {
        key: 'actions',
        label: '',
        render: (c) => (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" type="button" onClick={() => navigate(adminPath(`/categories/${c.id}`))}>
              {t('common.edit')}
            </Button>
            {isAdmin && c.is_active ? (
              <Button
                size="sm"
                variant="ghost"
                type="button"
                className="text-amber-800 hover:bg-amber-50"
                isLoading={deactivateMutation.isPending && deactivateMutation.variables === c.id}
                onClick={() => {
                  if (window.confirm(t('page.categories.deactivateConfirm'))) {
                    deactivateMutation.mutate(c.id)
                  }
                }}
              >
                {t('page.categories.deactivate')}
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [t, navigate, isAdmin, deactivateMutation]
  )

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="mx-auto min-w-0 w-full max-w-[1600px] space-y-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-secondary sm:text-3xl">{t('page.categories.title')}</h1>
          <p className="text-gray-500">{t('page.categories.subtitle')}</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => navigate(adminPath('/categories/new'))}>
          <Plus size={18} className="me-1" />
          {t('page.categories.add')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatsCard
          title={t('page.categories.statsTitle')}
          value={String(rows.length)}
          icon={FolderTree}
          badgeText={t('page.categories.statsBadgeActive', { count: activeCount })}
          badgeVariant="neutral"
        />
      </div>

      <DataTable columns={columns} data={rows} isLoading={isLoading} emptyMessage={t('page.categories.empty')} />
    </motion.div>
  )
}
