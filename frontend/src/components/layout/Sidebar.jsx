import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutGrid, CalendarCheck, Shield, Wrench, Settings, 
  Users, CreditCard, AlertTriangle, FileText, HelpCircle, 
  BarChart3, LogOut, Headset
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'

const navItems = [
  { name: 'Fleet', path: '/fleet', icon: LayoutGrid },
  { name: 'Reservations', path: '/reservations', icon: CalendarCheck },
  { name: 'Insurance', path: '/insurance', icon: Shield },
  { name: 'Technical Reviews', path: '/technical-reviews', icon: Wrench },
  { name: 'Settings', path: '/settings', icon: Settings },
]

const managementItems = [
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Payments', path: '/payments', icon: CreditCard },
  { name: 'Damages', path: '/damages', icon: AlertTriangle },
  { name: 'Blog', path: '/blog', icon: FileText },
  { name: 'FAQs', path: '/faqs', icon: HelpCircle },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
]

export function Sidebar() {
  const { clearAuth } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-6 py-3 text-sm transition-colors',
          isActive 
            ? 'text-primary font-semibold border-l-4 border-primary bg-red-50/50' 
            : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent hover:text-gray-900'
        )
      }
    >
      <item.icon size={20} />
      <span>{item.name}</span>
    </NavLink>
  )

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">
          W
        </div>
        <div>
          <h1 className="font-bold text-secondary leading-tight">Wak Admin</h1>
          <p className="text-[10px] text-gray-400 font-semibold tracking-wider">FLEET MANAGEMENT</p>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1">
          {navItems.map(item => <NavItem key={item.name} item={item} />)}
        </div>
        
        <div className="mt-8 mb-2 px-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</p>
        </div>
        <div className="space-y-1">
          {managementItems.map(item => <NavItem key={item.name} item={item} />)}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-6 border-t border-gray-100 space-y-4">
        <Button className="w-full" onClick={() => navigate('/reservations/new')}>
          + New Reservation
        </Button>
        
        <div className="space-y-1">
          <button className="flex w-full items-center gap-3 px-2 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <Headset size={20} />
            <span>Support</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-2 py-2 text-sm text-primary hover:text-red-700 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}
