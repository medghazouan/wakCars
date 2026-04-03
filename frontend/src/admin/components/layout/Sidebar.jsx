import { NavLink, useNavigate } from 'react-router-dom'
import {
  Car,
  LayoutDashboard,
  Tags,
  MapPin,
  CalendarCheck,
  Shield,
  Wrench,
  Settings,
  Users,
  CreditCard,
  AlertTriangle,
  FileText,
  HelpCircle,
  BarChart3,
  LogOut,
  Headset,
  X,
} from 'lucide-react'
import { useAuth } from '@admin/hooks/useAuth'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'
import { adminPath } from '@admin/adminPaths'
import { cn } from '@admin/utils/cn'
import { Button } from '@admin/components/ui/Button'
import { useAdminMobileNav } from './AdminMobileNavContext'

const navItems = [
  { nameKey: 'dashboard', path: adminPath('/dashboard'), icon: LayoutDashboard },
  { nameKey: 'fleet', path: adminPath('/fleet'), icon: Car },
  { nameKey: 'reservations', path: adminPath('/reservations'), icon: CalendarCheck },
  { nameKey: 'technicalReviews', path: adminPath('/technical-reviews'), icon: Wrench },
  { nameKey: 'insurance', path: adminPath('/insurance'), icon: Shield },
  { nameKey: 'categories', path: adminPath('/categories'), icon: Tags },
  { nameKey: 'locations', path: adminPath('/locations'), icon: MapPin },
  { nameKey: 'settings', path: adminPath('/settings'), icon: Settings },
]

const managementItems = [
  { nameKey: 'customers', path: adminPath('/customers'), icon: Users },
  { nameKey: 'payments', path: adminPath('/payments'), icon: CreditCard },
  { nameKey: 'damages', path: adminPath('/damages'), icon: AlertTriangle },
  { nameKey: 'blog', path: adminPath('/blog'), icon: FileText },
  { nameKey: 'faqs', path: adminPath('/faqs'), icon: HelpCircle },
  { nameKey: 'reports', path: adminPath('/reports'), icon: BarChart3 },
]

export function Sidebar() {
  const { clearAuth } = useAuth()
  const navigate = useNavigate()
  const { t } = useAdminLanguage()
  const { mobileNavOpen, closeMobileNav } = useAdminMobileNav()

  const handleLogout = () => {
    closeMobileNav()
    clearAuth()
    navigate(adminPath('/login'))
  }

  const NavItem = ({ item, nameKeyPrefix }) => (
    <NavLink
      to={item.path}
      onClick={() => closeMobileNav()}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 border-s-4 px-4 py-3 text-sm transition-colors sm:px-6',
          isActive
            ? 'border-primary bg-red-50/50 font-semibold text-primary'
            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )
      }
    >
      <item.icon size={20} className="shrink-0" />
      <span className="min-w-0 truncate">{t(`${nameKeyPrefix}.${item.nameKey}`)}</span>
    </NavLink>
  )

  return (
    <aside
      id="admin-sidebar"
      className={cn(
        'flex h-screen max-h-[100dvh] w-[min(17rem,100vw-2rem)] shrink-0 flex-col border-e border-gray-100 bg-white',
        'transition-transform duration-200 ease-out will-change-transform',
        'fixed inset-y-0 z-50 start-0 lg:sticky lg:z-auto lg:h-screen lg:w-64 lg:max-w-none lg:translate-x-0',
        mobileNavOpen
          ? 'translate-x-0 max-lg:shadow-booking'
          : 'pointer-events-none -translate-x-full rtl:max-lg:translate-x-full lg:pointer-events-auto lg:translate-x-0 rtl:lg:translate-x-0'
      )}
    >
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-6 lg:border-b-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary text-lg font-bold text-white">
          W
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-bold leading-tight text-text-primary">{t('brand.title')}</h1>
          <p className="text-[10px] font-semibold tracking-wider text-gray-400">
            {t('brand.subtitle')}
          </p>
        </div>
        <button
          type="button"
          className="rounded-sm p-2 text-gray-500 hover:bg-gray-100 hover:text-text-primary lg:hidden"
          onClick={closeMobileNav}
          aria-label={t('topbar.closeMenuAria')}
        >
          <X size={22} />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain py-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.nameKey} item={item} nameKeyPrefix="nav" />
          ))}
        </div>

        <div className="mb-2 mt-6 px-4 sm:mt-8 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {t('management.section')}
          </p>
        </div>
        <div className="space-y-1">
          {managementItems.map((item) => (
            <NavItem key={item.nameKey} item={item} nameKeyPrefix="management" />
          ))}
        </div>
      </div>

      <div className="space-y-4 border-t border-gray-100 p-4 sm:p-6">
        <Button
          className="w-full"
          onClick={() => {
            closeMobileNav()
            navigate(adminPath('/reservations/new'))
          }}
        >
          + {t('sidebar.newReservation')}
        </Button>

        <div className="space-y-1">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <Headset size={20} className="shrink-0" />
            <span className="truncate">{t('sidebar.support')}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm text-primary transition-colors hover:bg-red-50/50 hover:text-red-700"
          >
            <LogOut size={20} className="shrink-0" />
            <span className="truncate">{t('sidebar.logout')}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
