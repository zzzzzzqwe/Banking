import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  adminOnly?: boolean
}

export function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { token, role } = useAuthStore()

  if (!token) return <Navigate to="/login" replace />
  if (adminOnly && role !== 'ADMIN') return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
