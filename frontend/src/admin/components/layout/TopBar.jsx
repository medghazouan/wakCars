import { Bell, HelpCircle, Settings, Search } from 'lucide-react'
import { useAuth } from '@admin/hooks/useAuth'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'
import { cn } from '@admin/utils/cn'

export function TopBar() {
  const admin = useAuth((state) => state.admin)
  const { t, currentLanguage, toggleLanguage } = useAdminLanguage()

  const roleLabel =
    admin?.role === 'ADMIN' || admin?.role === 'SUPER_ADMIN'
      ? t('topbar.roleSuper')
      : t('topbar.roleStaff')

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-gray-200 border-b bg-white px-6">
      <div className="flex flex-1 items-center">
        <div className="relative hidden w-96 md:block">
          <Search
            className={cn(
              'absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400',
              'start-3'
            )}
            aria-hidden
          />
          <input
            type="search"
            placeholder={t('topbar.searchPlaceholder')}
            className="h-10 w-full rounded-full bg-gray-100 py-2 ps-10 pe-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <button
          type="button"
          onClick={toggleLanguage}
          className="rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-secondary transition-colors hover:border-primary/40 hover:text-primary"
          aria-label={t('topbar.langSwitchAria')}
        >
          {currentLanguage === 'fr' ? t('topbar.langAr') : t('topbar.langFr')}
        </button>

        <div className="flex items-center gap-4 text-gray-500">
          <button type="button" className="relative transition-colors hover:text-secondary">
            <Bell size={20} />
            <span className="absolute end-0 top-0 h-2 w-2 rounded-full border-2 border-white bg-danger" />
          </button>
          <button type="button" className="transition-colors hover:text-secondary">
            <HelpCircle size={20} />
          </button>
          <button type="button" className="transition-colors hover:text-secondary">
            <Settings size={20} />
          </button>
        </div>

        <div className="h-8 w-px bg-gray-200" />

        <div className="flex items-center gap-3">
          <div className="hidden text-end sm:block">
            <p className="text-sm font-semibold text-secondary">{admin?.name || t('topbar.profile')}</p>
            <p className="text-xs text-gray-500">{roleLabel}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
            {admin?.name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </header>
  )
}
