import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const AdminMobileNavContext = createContext(null)

export function AdminMobileNavProvider({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])
  const openMobileNav = useCallback(() => setMobileNavOpen(true), [])

  const value = useMemo(
    () => ({ mobileNavOpen, setMobileNavOpen, openMobileNav, closeMobileNav }),
    [mobileNavOpen, closeMobileNav, openMobileNav]
  )

  return (
    <AdminMobileNavContext.Provider value={value}>{children}</AdminMobileNavContext.Provider>
  )
}

export function useAdminMobileNav() {
  const ctx = useContext(AdminMobileNavContext)
  if (!ctx) {
    throw new Error('useAdminMobileNav must be used within AdminMobileNavProvider')
  }
  return ctx
}
