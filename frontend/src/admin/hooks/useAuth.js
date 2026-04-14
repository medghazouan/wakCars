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
      partialize: (state) => ({ admin: state.admin, isAuthenticated: state.isAuthenticated }),
    }
  )
)
