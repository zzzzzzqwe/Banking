import api from './axios'
import type { User, Account, Loan, Page } from '../types'

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
