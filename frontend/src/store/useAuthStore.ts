import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '../types'

interface AuthState {
  token: string | null
  userId: string | null
  role: Role | null
  setAuth: (token: string, userId: string, role: Role) => void
  logout: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      role: null,
      setAuth: (token, userId, role) => set({ token, userId, role }),
      logout: () => set({ token: null, userId: null, role: null }),
      isAdmin: () => get().role === 'ADMIN',
    }),
    { name: 'nexus-auth' }
  )
)
