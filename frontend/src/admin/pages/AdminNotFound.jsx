import { Link } from 'react-router-dom'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'
import { adminPath } from '@admin/adminPaths'

export default function AdminNotFound() {
  const { t } = useAdminLanguage()

  return (
    <div className="min-w-0 p-4 sm:p-8">
      <h1 className="text-xl font-semibold text-secondary">{t('notFound.title')}</h1>
      <p className="mt-2 text-gray-500">{t('notFound.body')}</p>
      <Link to={adminPath('/dashboard')} className="mt-4 inline-block text-primary hover:underline">
        ← {t('nav.dashboard')}
      </Link>
    </div>
  )
}
