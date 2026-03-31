import { Bell, HelpCircle, Settings, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function TopBar() {
  const admin = useAuth(state => state.admin)

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Left/Search */}
      <div className="flex items-center flex-1">
        <div className="relative w-96 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search fleet, bookings, or clients..." 
            className="w-full h-10 pl-10 pr-4 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-gray-500">
          <button className="hover:text-secondary transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
          </button>
          <button className="hover:text-secondary transition-colors">
            <HelpCircle size={20} />
          </button>
          <button className="hover:text-secondary transition-colors">
            <Settings size={20} />
          </button>
        </div>

        <div className="w-px h-8 bg-gray-200"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-secondary">{admin?.name || 'Admin Profile'}</p>
            <p className="text-xs text-gray-500">{admin?.role === 'SUPER_ADMIN' ? 'Super Admin Access' : 'Staff Access'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
            {admin?.name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </header>
  )
}
