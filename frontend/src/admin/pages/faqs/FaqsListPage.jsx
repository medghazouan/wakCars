import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { HelpCircle, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { faqsApi } from '@admin/api/faqs.api'
import { FAQ_CATEGORIES } from '@admin/constants/faqCategories'
import { pageTransition } from '@admin/animations/variants'
import { Button } from '@admin/components/ui/Button'
import { Card } from '@admin/components/ui/Card'
import { DataTable } from '@admin/components/ui/DataTable'
import { StatsCard } from '@admin/components/ui/StatsCard'
import { useAuth } from '@admin/hooks/useAuth'
import { cn } from '@admin/utils/cn'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'

export default function FaqsListPage() {
  const { t } = useAdminLanguage()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const canDelete = useAuth((s) => s.admin?.role) === 'ADMIN'
  const [categoryFilter, setCategoryFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['faqs', categoryFilter],
    queryFn: () =>
      faqsApi.getList({
        ...(categoryFilter && { category: categoryFilter }),
      }),
  })

  const rows = data?.data || []
  const published = rows.filter((f) => f.is_published).length

  const deleteMutation = useMutation({
    mutationFn: (id) => faqsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] })
      toast.success(t('page.faqs.toastDeleted'))
    },
    onError: (err) => toast.error(err.response?.data?.error || t('page.faqs.toastDeleteErr')),
  })

  const columns = useMemo(
    () => [
      {
        key: 'q',
        label: t('page.faqs.colQuestion'),
        render: (f) => (
          <div className="max-w-md">
            <p className="line-clamp-2 font-medium text-secondary">{f.question_fr}</p>
            <p className="line-clamp-1 text-xs text-gray-500" dir="rtl">
              {f.question_ar}
            </p>
          </div>
        ),
      },
      {
        key: 'cat',
        label: t('page.faqs.colCategory'),
        render: (f) => (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{f.category}</span>
        ),
      },
      {
        key: 'order',
        label: t('page.faqs.colOrder'),
        render: (f) => f.sort_order,
      },
      {
        key: 'pub',
        label: t('page.faqs.colStatus'),
        render: (f) => (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              f.is_published ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'
            )}
          >
            {f.is_published ? t('page.faqs.visible') : t('page.faqs.hidden')}
          </span>
        ),
      },
      {
        key: 'actions',
        label: '',
        render: (f) => (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" type="button" onClick={() => navigate(adminPath(`/faqs/${f.id}/edit`))}>
              {t('common.edit')}
            </Button>
            {canDelete && (
              <Button
                size="sm"
                variant="danger"
                type="button"
                isLoading={deleteMutation.isPending && deleteMutation.variables === f.id}
                onClick={() => {
                  if (window.confirm(t('page.faqs.deleteConfirm'))) deleteMutation.mutate(f.id)
                }}
              >
                {t('common.delete')}
              </Button>
            )}
          </div>
        ),
      },
    ],
    [t, navigate, canDelete, deleteMutation]
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
          <h1 className="text-2xl font-bold text-secondary sm:text-3xl">{t('page.faqs.title')}</h1>
          <p className="text-gray-500">{t('page.faqs.subtitle')}</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => navigate(adminPath('/faqs/new'))}>
          <Plus size={18} className="me-1" />
          {t('page.faqs.add')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatsCard
          title={t('page.faqs.statsTitle')}
          value={String(rows.length)}
          icon={HelpCircle}
          badgeText={t('page.faqs.statsBadgePublished', { count: published })}
          badgeVariant="neutral"
        />
        <Card className="p-4 lg:col-span-2">
          <p className="mb-2 text-xs font-semibold uppercase text-gray-500">{t('page.faqs.filterCategory')}</p>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">{t('page.faqs.filterAll')}</option>
            {FAQ_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Card>
      </div>

      <DataTable columns={columns} data={rows} isLoading={isLoading} emptyMessage={t('page.faqs.empty')} />
    </motion.div>
  )
}
