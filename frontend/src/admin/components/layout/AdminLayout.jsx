import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'
import { cn } from '@admin/utils/cn'

export default function AdminLayout() {
  const { isRTL } = useAdminLanguage()

  return (
    <div
      className={cn(
        'admin-app min-h-screen bg-gray-50 flex',
        isRTL && 'font-arabic-body'
      )}
    >
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
