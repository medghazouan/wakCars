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

export default function CategoriesListPage() {
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
      toast.success('Catégorie désactivée')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Action impossible'),
  })

  const columns = [
    {
      key: 'names',
      label: 'Nom',
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
      label: 'Slug',
      render: (c) => <span className="font-mono text-xs text-gray-600">{c.slug}</span>,
    },
    {
      key: 'cars',
      label: 'Véhicules actifs',
      render: (c) => <span className="tabular-nums">{c._count?.cars ?? 0}</span>,
    },
    {
      key: 'order',
      label: 'Ordre',
      render: (c) => c.sort_order,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (c) => (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold',
            c.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-200 text-gray-600'
          )}
        >
          {c.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (c) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" type="button" onClick={() => navigate(adminPath(`/categories/${c.id}`))}>
            Modifier
          </Button>
          {isAdmin && c.is_active ? (
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="text-amber-800 hover:bg-amber-50"
              isLoading={deactivateMutation.isPending && deactivateMutation.variables === c.id}
              onClick={() => {
                if (
                  window.confirm(
                    'Désactiver cette catégorie ? Elle ne sera plus proposée pour les nouveaux véhicules (véhicules actifs doivent être déplacés avant).'
                  )
                ) {
                  deactivateMutation.mutate(c.id)
                }
              }}
            >
              Désactiver
            </Button>
          ) : null}
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
      className="mx-auto min-w-0 w-full max-w-[1600px] space-y-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-secondary sm:text-3xl">Catégories véhicules</h1>
          <p className="text-gray-500">Groupez la flotte par type (SUV, berline, etc.). FR / AR + slug unique.</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => navigate(adminPath('/categories/new'))}>
          <Plus size={18} className="me-1" />
          Nouvelle catégorie
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatsCard title="Catégories" value={String(rows.length)} icon={FolderTree} badgeText={`${activeCount} actives`} badgeVariant="neutral" />
      </div>

      <DataTable columns={columns} data={rows} isLoading={isLoading} emptyMessage="Aucune catégorie." />
    </motion.div>
  )
}
