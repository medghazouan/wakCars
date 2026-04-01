import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react'
import { pageTransition } from '@admin/animations/variants'
import { reportsApi } from '@admin/api/settings.api'
import { Button } from '@admin/components/ui/Button'
import { Card } from '@admin/components/ui/Card'
import { DataTable } from '@admin/components/ui/DataTable'
import { StatsCard } from '@admin/components/ui/StatsCard'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'
import { formatCurrency } from '@admin/utils/formatters'
import { downloadBlob } from '@admin/utils/downloadBlob'

const PIE_COLORS = ['#CC0000', '#2563EB', '#16A34A', '#F59E0B', '#7C3AED', '#64748B', '#0EA5E9', '#EC4899']

export default function ReportsPage() {
  const { t } = useAdminLanguage()
  const [period, setPeriod] = useState('monthly')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [exporting, setExporting] = useState(null)

  const rangeParams = useMemo(() => {
    const p = {}
    if (from) p.from = new Date(from).toISOString()
    if (to) p.to = new Date(to).toISOString()
    return p
  }, [from, to])

  const { data: revenueRes, isLoading: loadingRev } = useQuery({
    queryKey: ['reports', 'revenue', period, from, to],
    queryFn: () => reportsApi.getRevenue({ period, ...rangeParams }),
  })

  const { data: utilRes, isLoading: loadingUtil } = useQuery({
    queryKey: ['reports', 'utilization', from, to],
    queryFn: () => reportsApi.getUtilization(rangeParams),
  })

  const { data: srcRes, isLoading: loadingSrc } = useQuery({
    queryKey: ['reports', 'booking-sources', from, to],
    queryFn: () => reportsApi.getBookingSources(rangeParams),
  })

  const { data: analyticsRes, isLoading: loadingAn } = useQuery({
    queryKey: ['reports', 'res-analytics', from, to],
    queryFn: () => reportsApi.getReservations(rangeParams),
  })

  const revenue = revenueRes?.data
  const utilRows = utilRes?.data || []
  const src = srcRes?.data
  const analytics = analyticsRes?.data

  const chartByDay = useMemo(() => {
    const byDay = revenue?.byDay || {}
    return Object.entries(byDay)
      .map(([date, amount]) => ({ date, amount: Number(amount) }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [revenue?.byDay])

  const pieData = useMemo(() => {
    const list = src?.bySource || []
    return list.map((x) => ({ name: x.source, value: x.count }))
  }, [src?.bySource])

  const utilColumns = [
    { key: 'vehicle', label: 'Véhicule' },
    { key: 'license_plate', label: 'Immatriculation' },
    { key: 'reservations', label: 'Réservations' },
    { key: 'rentedDays', label: 'Jours loués' },
    {
      key: 'totalRevenue',
      label: 'Revenus (MAD)',
      render: (r) => formatCurrency(r.totalRevenue ?? 0),
    },
  ]

  const handleExport = async (type, format) => {
    const key = `${type}-${format}`
    setExporting(key)
    try {
      const blob = await reportsApi.exportReport({
        type,
        format,
        period,
        ...(from ? { from: new Date(`${from}T12:00:00`).toISOString() } : {}),
        ...(to ? { to: new Date(`${to}T23:59:59`).toISOString() } : {}),
      })
      const names = {
        revenue: `revenue-${period}.${format === 'csv' ? 'csv' : 'pdf'}`,
        utilization: `utilisation-flotte.${format === 'csv' ? 'csv' : 'pdf'}`,
        booking_sources: `booking-sources-${period}.${format === 'csv' ? 'csv' : 'pdf'}`,
      }
      downloadBlob(blob, names[type] || `report.${format}`)
    } finally {
      setExporting(null)
    }
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="mx-auto max-w-7xl space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-secondary">{t('reports.title')}</h1>
        <p className="text-gray-500">{t('reports.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="CA encaissé"
          value={loadingRev ? '…' : formatCurrency(revenue?.total ?? 0)}
          icon={TrendingUp}
          badgeText={period === 'monthly' ? 'Mois' : period === 'daily' ? 'Jour' : 'Année'}
          badgeVariant="neutral"
        />
        <StatsCard
          title="Réservations (période)"
          value={loadingAn ? '…' : String(analytics?.total ?? 0)}
          icon={Activity}
        />
        <StatsCard
          title="Véhicules (utilisation)"
          value={loadingUtil ? '…' : String(utilRows.length)}
          icon={BarChart3}
        />
        <StatsCard
          title="Volume sources"
          value={loadingSrc ? '…' : String(src?.total ?? 0)}
          icon={PieChartIcon}
        />
      </div>

      <Card className="flex flex-wrap items-end gap-4 p-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Période (revenus / export)
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="daily">Jour</option>
            <option value="monthly">Mois</option>
            <option value="annual">Année</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Du</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Au</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <p className="text-xs text-gray-400">
          Laisser vide pour la période par défaut (mois / année en cours selon le rapport).
        </p>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-secondary">Revenus</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="ghost"
              type="button"
              isLoading={exporting === 'revenue-csv'}
              onClick={() => handleExport('revenue', 'csv')}
            >
              CSV
            </Button>
            <Button
              size="sm"
              type="button"
              isLoading={exporting === 'revenue-pdf'}
              onClick={() => handleExport('revenue', 'pdf')}
            >
              PDF
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="p-4 lg:col-span-1">
            <p className="text-xs font-semibold uppercase text-gray-500">Total encaissé</p>
            <p className="mt-2 text-2xl font-bold text-secondary">
              {loadingRev ? '…' : formatCurrency(revenue?.total ?? 0)}
            </p>
            <p className="mt-1 text-xs text-gray-400">Paiements avec statut PAID sur la période.</p>
          </Card>
          <Card className="p-4 lg:col-span-2">
            <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Par jour</p>
            <div className="h-64">
              {loadingRev ? (
                <p className="text-sm text-gray-400">Chargement…</p>
              ) : chartByDay.length === 0 ? (
                <p className="text-sm text-gray-400">Pas de données pour cette période.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Bar dataKey="amount" fill="#CC0000" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-secondary">Utilisation de la flotte</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="ghost"
              type="button"
              isLoading={exporting === 'utilization-csv'}
              onClick={() => handleExport('utilization', 'csv')}
            >
              CSV
            </Button>
            <Button
              size="sm"
              type="button"
              isLoading={exporting === 'utilization-pdf'}
              onClick={() => handleExport('utilization', 'pdf')}
            >
              PDF
            </Button>
          </div>
        </div>
        <DataTable columns={utilColumns} data={utilRows} isLoading={loadingUtil} emptyMessage="Aucune donnée." />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-secondary">Origine des réservations</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="ghost"
              type="button"
              isLoading={exporting === 'booking_sources-csv'}
              onClick={() => handleExport('booking_sources', 'csv')}
            >
              CSV
            </Button>
            <Button
              size="sm"
              type="button"
              isLoading={exporting === 'booking_sources-pdf'}
              onClick={() => handleExport('booking_sources', 'pdf')}
            >
              PDF
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Total période</p>
            <p className="text-2xl font-bold text-secondary">{loadingSrc ? '…' : (src?.total ?? 0)}</p>
          </Card>
          <Card className="p-4">
            <div className="h-56">
              {loadingSrc ? (
                <p className="text-sm text-gray-400">Chargement…</p>
              ) : pieData.length === 0 ? (
                <p className="text-sm text-gray-400">Pas encore de réservations avec source.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-secondary">Synthèse réservations</h2>
        <Card className="p-4">
          {loadingAn ? (
            <p className="text-sm text-gray-400">Chargement…</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-xl font-bold">{analytics?.total ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Par statut</p>
                <ul className="mt-1 text-sm text-gray-700">
                  {Object.entries(analytics?.byStatus || {}).map(([k, v]) => (
                    <li key={k}>
                      {k}: {v}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs text-gray-500">Paiement</p>
                <ul className="mt-1 text-sm text-gray-700">
                  {Object.entries(analytics?.byPaymentStatus || {}).map(([k, v]) => (
                    <li key={k}>
                      {k}: {v}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>
      </section>
    </motion.div>
  )
}
