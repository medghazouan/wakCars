import { Link } from 'react-router-dom'
import { Settings, Menu } from 'lucide-react'
import { useAuth } from '@admin/hooks/useAuth'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'
import { adminPath } from '@admin/adminPaths'
import { NavAlertsBell } from '@admin/components/layout/NavAlertsBell'
import { AdminSearchBar } from '@admin/components/layout/AdminSearchBar'
import { useAdminMobileNav } from './AdminMobileNavContext'

export function TopBar() {
  const admin = useAuth((state) => state.admin)
  const { t, currentLanguage, toggleLanguage } = useAdminLanguage()
  const { mobileNavOpen, openMobileNav } = useAdminMobileNav()

  const roleLabel =
    admin?.role === 'ADMIN' || admin?.role === 'SUPER_ADMIN'
      ? t('topbar.roleSuper')
      : t('topbar.roleStaff')

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-gray-100 bg-white px-3 sm:h-16 sm:gap-3 sm:px-4 lg:px-6">
      <button
        type="button"
        className="rounded-sm p-2 text-text-secondary hover:bg-gray-100 hover:text-text-primary lg:hidden"
        onClick={openMobileNav}
        aria-label={t('topbar.openMenuAria')}
        aria-expanded={mobileNavOpen}
        aria-controls="admin-sidebar"
      >
        <Menu size={22} />
      </button>

      <div className="hidden min-w-0 flex-1 items-center md:flex">
        <AdminSearchBar />
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3 lg:gap-4">
        <button
          type="button"
          onClick={toggleLanguage}
          className="rounded-full border border-gray-100 px-2.5 py-1.5 text-xs font-medium text-text-primary transition-colors hover:border-primary/40 hover:text-primary sm:px-3 sm:text-sm"
          aria-label={t('topbar.langSwitchAria')}
        >
          {currentLanguage === 'fr' ? t('topbar.langAr') : t('topbar.langFr')}
        </button>

        <div className="flex items-center gap-0.5 text-text-secondary sm:gap-2 lg:gap-4">
          <NavAlertsBell />
          <Link
            to={adminPath('/settings')}
            className="rounded-sm p-1.5 transition-colors hover:bg-gray-100 hover:text-text-primary"
            aria-label={t('nav.settings')}
          >
            <Settings size={20} />
          </Link>
        </div>

        <div className="hidden h-8 w-px bg-gray-100 sm:block" />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden max-w-[140px] text-end sm:block">
            <p className="truncate text-sm font-semibold text-text-primary">
              {admin?.name || t('topbar.profile')}
            </p>
            <p className="truncate text-xs text-text-secondary">{roleLabel}</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary sm:h-10 sm:w-10">
            {admin?.name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </header>
  )
}
