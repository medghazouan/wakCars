import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { pageTransition } from '@admin/animations/variants'
import { settingsApi } from '@admin/api/settings.api'
import { Button } from '@admin/components/ui/Button'
import { Card } from '@admin/components/ui/Card'
import { Input } from '@admin/components/ui/Input'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'

function SettingRow({ settingKey, initialFr, initialAr }) {
  const queryClient = useQueryClient()
  const [valueFr, setValueFr] = useState(initialFr ?? '')
  const [valueAr, setValueAr] = useState(initialAr ?? '')

  useEffect(() => {
    setValueFr(initialFr ?? '')
    setValueAr(initialAr ?? '')
  }, [initialFr, initialAr])

  const mutation = useMutation({
    mutationFn: () =>
      settingsApi.updateByKey(settingKey, {
        value_fr: valueFr || null,
        value_ar: valueAr || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] })
      toast.success('Paramètre enregistré')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Enregistrement impossible')
    },
  })

  return (
    <div className="grid grid-cols-1 gap-4 border-gray-100 border-b py-6 last:border-0 md:grid-cols-12">
      <div className="md:col-span-3">
        <p className="font-mono text-sm font-semibold text-secondary">{settingKey}</p>
      </div>
      <div className="space-y-2 md:col-span-4">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Valeur (FR)</label>
        <Input value={valueFr} onChange={(e) => setValueFr(e.target.value)} />
      </div>
      <div className="space-y-2 md:col-span-4">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Valeur (AR)</label>
        <Input value={valueAr} onChange={(e) => setValueAr(e.target.value)} dir="rtl" className="text-right" />
      </div>
      <div className="flex items-end md:col-span-1">
        <Button
          type="button"
          size="sm"
          className="w-full"
          isLoading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          OK
        </Button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { t } = useAdminLanguage()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsApi.getAll(),
  })

  const settings = data?.data || {}

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="mx-auto max-w-7xl space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-secondary">{t('settings.title')}</h1>
        <p className="text-gray-500">{t('settings.subtitle')}</p>
      </div>

      <Card className="p-6">
        {isLoading && <p className="text-sm text-gray-500">Chargement…</p>}
        {isError && <p className="text-sm text-amber-800">Impossible de charger les paramètres.</p>}
        {!isLoading && !isError && Object.keys(settings).length === 0 && (
          <p className="text-sm text-gray-500">Aucun paramètre en base.</p>
        )}
        {!isLoading &&
          !isError &&
          Object.entries(settings).map(([key, val]) => (
            <SettingRow key={key} settingKey={key} initialFr={val?.value_fr} initialAr={val?.value_ar} />
          ))}
      </Card>

      <p className="text-xs text-gray-400">
        Les modifications des tarifs GPS / siège enfant sont utilisées par le site public et le calcul des
        réservations.
      </p>
    </motion.div>
  )
}
