import api from './axios'
import type { User, Account, Loan, CardRequest, AuditLogEntry, Page } from '../types'

export const getUsers = (page = 0, size = 20) =>
  api.get<Page<User>>(`/api/admin/users?page=${page}&size=${size}`).then((r) => r.data)

export const getUser = (id: string) =>
  api.get<User>(`/api/admin/users/${id}`).then((r) => r.data)

export const deactivateUser = (id: string) =>
  api.put<User>(`/api/admin/users/${id}/deactivate`).then((r) => r.data)

export const getAllAccounts = (page = 0, size = 20) =>
  api.get<Page<Account>>(`/api/admin/accounts?page=${page}&size=${size}`).then((r) => r.data)

export const getAllAccountById = (id: string) =>
  api.get<Account>(`/api/admin/accounts/${id}`).then((r) => r.data)

export const getAllLoans = (page = 0, size = 20) =>
  api.get<Page<Loan>>(`/api/admin/loans?page=${page}&size=${size}`).then((r) => r.data)

export const approveLoan = (id: string) =>
  api.post<Loan>(`/api/admin/loans/${id}/approve`).then((r) => r.data)

export const rejectLoan = (id: string) =>
  api.post<Loan>(`/api/admin/loans/${id}/reject`).then((r) => r.data)

export const getAllCardRequests = (page = 0, size = 20) =>
  api.get<Page<CardRequest>>(`/api/admin/card-requests?page=${page}&size=${size}`).then((r) => r.data)

export const approveCardRequest = (id: string) =>
  api.post<CardRequest>(`/api/admin/card-requests/${id}/approve`).then((r) => r.data)

export const rejectCardRequest = (id: string) =>
  api.post<CardRequest>(`/api/admin/card-requests/${id}/reject`).then((r) => r.data)

export interface CurrencyStat   { currency: string; count: number; totalBalance: number }
export interface MonthlyVolume  { month: string; deposits: number; withdrawals: number }
export interface AdminStats {
  totalUsers: number; activeUsers: number
  totalAccounts: number; activeAccounts: number
  totalLoans: number; activeLoans: number; pendingLoans: number; overdueCount: number
  loanStatusCounts: Record<string, number>
  currencyDistribution: CurrencyStat[]
  monthlyVolume: MonthlyVolume[]
}

export const getAdminStats = () =>
  api.get<AdminStats>('/api/admin/stats').then((r) => r.data)

export const getAuditLog = (page = 0, size = 30, params?: { userId?: string; action?: string; from?: string; to?: string }) => {
  const q = new URLSearchParams({ page: String(page), size: String(size) })
  if (params?.userId) q.set('userId', params.userId)
  if (params?.action) q.set('action', params.action)
  if (params?.from) q.set('from', params.from)
  if (params?.to) q.set('to', params.to)
  return api.get<Page<AuditLogEntry>>(`/api/admin/audit?${q}`).then((r) => r.data)
}

export const getAuditActions = () =>
  api.get<string[]>('/api/admin/audit/actions').then((r) => r.data)
