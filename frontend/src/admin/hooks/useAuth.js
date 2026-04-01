import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuth = create(
  persist(
    (set) => ({
      accessToken: null,
      admin: null,
      isAuthenticated: false,
      setAuth: (accessToken, admin) => set({ accessToken, admin, isAuthenticated: true }),
      setToken: (accessToken) => set({ accessToken }),
      clearAuth: () => set({ accessToken: null, admin: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      // only persist admin profile and auth state, NOT the token if you want max security, 
      // but for SPA we usually keep token in memory or local storage. 
      // Refresh token is in httpOnly cookie.
    }
  )
)
