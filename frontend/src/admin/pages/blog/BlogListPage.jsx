import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, Plus, Star } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { adminPath } from '@admin/adminPaths'
import { blogApi } from '@admin/api/blog.api'
import { pageTransition } from '@admin/animations/variants'
import { Button } from '@admin/components/ui/Button'
import { Card } from '@admin/components/ui/Card'
import { DataTable } from '@admin/components/ui/DataTable'
import { StatsCard } from '@admin/components/ui/StatsCard'
import { useAuth } from '@admin/hooks/useAuth'
import { cn } from '@admin/utils/cn'

export default function BlogListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const adminRole = useAuth((s) => s.admin?.role)
  const canDelete = adminRole === 'ADMIN'
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['blog', page],
    queryFn: () => blogApi.getList({ page, limit: 15 }),
  })

  const rows = data?.data || []
  const meta = data?.meta
  const pagination = useMemo(() => {
    if (!meta || meta.total == null || !meta.limit) return undefined
    return { ...meta, totalPages: Math.max(1, Math.ceil(meta.total / meta.limit)) }
  }, [meta])

  const publishedCount = rows.filter((p) => p.is_published).length

  const toggleMutation = useMutation({
    mutationFn: (id) => blogApi.togglePublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog'] })
      toast.success('Publication mise à jour')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => blogApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog'] })
      toast.success('Article supprimé')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Suppression refusée'),
  })

  const columns = [
    {
      key: 'post',
      label: 'Article',
      render: (p) => (
        <div className="flex gap-3">
          <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
            {p.cover_image ? (
              <img src={p.cover_image} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                <FileText size={24} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-secondary">{p.title_fr}</p>
            <p className="truncate text-xs text-gray-500">{p.excerpt_fr || p.slug_fr}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Catégorie',
      render: (p) => p.category || '—',
    },
    {
      key: 'status',
      label: 'Statut',
      render: (p) => (
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              p.is_published ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'
            )}
          >
            {p.is_published ? 'En ligne' : 'Brouillon'}
          </span>
          {p.is_featured && (
            <span className="inline-flex items-center gap-0.5 text-amber-600" title="À la une">
              <Star size={14} fill="currentColor" />
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Modifié',
      render: (p) => format(new Date(p.created_at), 'dd MMM yyyy'),
    },
    {
      key: 'actions',
      label: '',
      render: (p) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" type="button" onClick={() => toggleMutation.mutate(p.id)}>
            {p.is_published ? 'Dépublier' : 'Publier'}
          </Button>
          <Button size="sm" variant="outline" type="button" onClick={() => navigate(adminPath(`/blog/${p.id}/edit`))}>
            Modifier
          </Button>
          {canDelete && (
            <Button
              size="sm"
              variant="danger"
              type="button"
              isLoading={deleteMutation.isPending && deleteMutation.variables === p.id}
              onClick={() => {
                if (window.confirm('Supprimer cet article ?')) deleteMutation.mutate(p.id)
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
      className="mx-auto min-w-0 w-full max-w-[1600px] space-y-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-secondary sm:text-3xl">Blog</h1>
          <p className="text-gray-500">Articles bilingues FR / AR pour le site public.</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => navigate(adminPath('/blog/new'))}>
          <Plus size={18} className="me-1" />
          Nouvel article
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatsCard
          title="Articles (page)"
          value={String(rows.length)}
          icon={FileText}
          badgeText={`${publishedCount} publiés`}
          badgeVariant="neutral"
        />
        <Card className="flex items-center p-4 text-sm text-gray-600">
          Les slugs doivent être uniques (FR et AR). Utilisez des tirets pour le slug français.
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        emptyMessage="Aucun article."
      />
    </motion.div>
  )
}
