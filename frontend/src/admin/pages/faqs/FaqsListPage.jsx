import { useState } from 'react'
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

export default function FaqsListPage() {
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
      toast.success('FAQ supprimée')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Suppression refusée'),
  })

  const columns = [
    {
      key: 'q',
      label: 'Question (FR)',
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
      label: 'Catégorie',
      render: (f) => (
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{f.category}</span>
      ),
    },
    {
      key: 'order',
      label: 'Ordre',
      render: (f) => f.sort_order,
    },
    {
      key: 'pub',
      label: 'Statut',
      render: (f) => (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold',
            f.is_published ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'
          )}
        >
          {f.is_published ? 'Visible' : 'Masqué'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (f) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" type="button" onClick={() => navigate(adminPath(`/faqs/${f.id}/edit`))}>
            Modifier
          </Button>
          {canDelete && (
            <Button
              size="sm"
              variant="danger"
              type="button"
              isLoading={deleteMutation.isPending && deleteMutation.variables === f.id}
              onClick={() => {
                if (window.confirm('Supprimer cette FAQ ?')) deleteMutation.mutate(f.id)
              }}
            >
              Supprimer
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="mx-auto max-w-[1600px] space-y-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary">FAQ</h1>
          <p className="text-gray-500">Questions fréquentes affichées sur le site (FR / AR).</p>
        </div>
        <Button onClick={() => navigate(adminPath('/faqs/new'))}>
          <Plus size={18} className="me-1" />
          Nouvelle FAQ
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatsCard
          title="Entrées"
          value={String(rows.length)}
          icon={HelpCircle}
          badgeText={`${published} publiées`}
          badgeVariant="neutral"
        />
        <Card className="p-4 lg:col-span-2">
          <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Filtrer par catégorie</p>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Toutes</option>
            {FAQ_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Card>
      </div>

      <DataTable columns={columns} data={rows} isLoading={isLoading} emptyMessage="Aucune FAQ." />
    </motion.div>
  )
}
