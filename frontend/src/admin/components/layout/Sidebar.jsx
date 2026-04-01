import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, LayoutGrid, CalendarCheck, Shield, Wrench, Settings, 
  Users, CreditCard, AlertTriangle, FileText, HelpCircle, 
  BarChart3, LogOut, Headset
} from 'lucide-react'
import { useAuth } from '@admin/hooks/useAuth'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'
import { adminPath } from '@admin/adminPaths'
import { cn } from '@admin/utils/cn'
import { Button } from '@admin/components/ui/Button'

const navItems = [
  { nameKey: 'dashboard', path: adminPath('/dashboard'), icon: LayoutDashboard },
  { nameKey: 'fleet', path: adminPath('/fleet'), icon: LayoutGrid },
  { nameKey: 'reservations', path: adminPath('/reservations'), icon: CalendarCheck },
  { nameKey: 'insurance', path: adminPath('/insurance'), icon: Shield },
  { nameKey: 'technicalReviews', path: adminPath('/technical-reviews'), icon: Wrench },
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

  const handleLogout = () => {
    clearAuth()
    navigate(adminPath('/login'))
  }

  const NavItem = ({ item, nameKeyPrefix }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 border-s-4 px-6 py-3 text-sm transition-colors',
          isActive
            ? 'border-primary bg-red-50/50 font-semibold text-primary'
            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )
      }
    >
      <item.icon size={20} />
      <span>{t(`${nameKeyPrefix}.${item.nameKey}`)}</span>
    </NavLink>
  )

  return (
    <div className="flex h-screen w-64 flex-col border-gray-200 border-e bg-white sticky top-0">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
          W
        </div>
        <div>
          <h1 className="font-bold leading-tight text-secondary">{t('brand.title')}</h1>
          <p className="text-[10px] font-semibold tracking-wider text-gray-400">{t('brand.subtitle')}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.nameKey} item={item} nameKeyPrefix="nav" />
          ))}
        </div>

        <div className="mb-2 mt-8 px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{t('management.section')}</p>
        </div>
        <div className="space-y-1">
          {managementItems.map((item) => (
            <NavItem key={item.nameKey} item={item} nameKeyPrefix="management" />
          ))}
        </div>
      </div>

      <div className="space-y-4 border-gray-100 border-t p-6">
        <Button className="w-full" onClick={() => navigate(adminPath('/reservations/new'))}>
          + {t('sidebar.newReservation')}
        </Button>

        <div className="space-y-1">
          <button
            type="button"
            className="flex w-full items-center gap-3 px-2 py-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
          >
            <Headset size={20} />
            <span>{t('sidebar.support')}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-2 py-2 text-sm text-primary transition-colors hover:text-red-700"
          >
            <LogOut size={20} />
            <span>{t('sidebar.logout')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
