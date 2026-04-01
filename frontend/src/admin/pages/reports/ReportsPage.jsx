import { motion } from 'framer-motion'
import { pageTransition } from '@admin/animations/variants'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'

export default function ReportsPage() {
  const { t } = useAdminLanguage()

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="mx-auto max-w-7xl space-y-8"
    >
      <h1 className="text-3xl font-bold text-secondary">{t('reports.title')}</h1>
      <p className="text-gray-500">{t('reports.subtitle')}</p>
    </motion.div>
  )
}
