import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useAdminLanguage } from '@admin/hooks/useAdminLanguage'
import { AdminMobileNavProvider, useAdminMobileNav } from './AdminMobileNavContext'
import { cn } from '@admin/utils/cn'

export default function AdminLayout() {
  return (
    <AdminMobileNavProvider>
      <AdminLayoutInner />
    </AdminMobileNavProvider>
  )
}

function AdminLayoutInner() {
  const { isRTL } = useAdminLanguage()
  const { mobileNavOpen, closeMobileNav } = useAdminMobileNav()

  useEffect(() => {
    if (!mobileNavOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeMobileNav()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileNavOpen, closeMobileNav])

  useEffect(() => {
    if (!mobileNavOpen) return
    const mq = window.matchMedia('(max-width: 1023px)')
    const prev = document.body.style.overflow
    const syncBodyScrollLock = () => {
      if (mq.matches) document.body.style.overflow = 'hidden'
      else document.body.style.overflow = prev || ''
    }
    syncBodyScrollLock()
    mq.addEventListener('change', syncBodyScrollLock)
    return () => {
      mq.removeEventListener('change', syncBodyScrollLock)
      document.body.style.overflow = prev || ''
    }
  }, [mobileNavOpen])

  return (
    <div
      className={cn(
        'admin-app flex h-[100dvh] max-h-[100dvh] min-h-0 overflow-hidden bg-background-light',
        isRTL && 'font-arabic-body'
      )}
    >
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] transition-opacity lg:hidden"
          aria-label="Close menu"
          onClick={closeMobileNav}
        />
      ) : null}

      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopBar />
        <main
          className={cn(
            'flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain',
            'p-3 pt-3 sm:p-4 lg:p-6',
            'pb-[max(0.75rem,env(safe-area-inset-bottom))]'
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
