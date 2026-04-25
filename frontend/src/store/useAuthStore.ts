import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '../types'

interface AuthState {
  token: string | null
  userId: string | null
  role: Role | null
  firstName: string | null
  lastName: string | null
  setAuth: (token: string, userId: string, role: Role, firstName?: string, lastName?: string) => void
  setName: (firstName: string, lastName: string) => void
  logout: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      role: null,
      firstName: null,
      lastName: null,
      setAuth: (token, userId, role, firstName, lastName) =>
        set({ token, userId, role, firstName: firstName ?? null, lastName: lastName ?? null }),
      setName: (firstName, lastName) => set({ firstName, lastName }),
      logout: () => {
        // Disconnect SSE notifications on logout
        import('../store/useNotificationStore')
          .then(({ useNotificationStore }) => useNotificationStore.getState().disconnect())
          .catch(() => {})
        set({ token: null, userId: null, role: null, firstName: null, lastName: null })
      },
      isAdmin: () => get().role === 'ADMIN',
    }),
    { name: 'velora-auth' }
  )
)
