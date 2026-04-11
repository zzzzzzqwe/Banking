import api from './axios'
import type { Account, Transaction, Page } from '../types'

export interface DailyBalance {
  date: string
  balance: number
}

export const getAccounts = () =>
  api.get<Account[]>('/api/accounts').then((r) => r.data)

export const getAccount = (id: string) =>
  api.get<Account>(`/api/accounts/${id}`).then((r) => r.data)

export const createAccount = (currency: string, initialBalance: number) =>
  api.post<Account>('/api/accounts', { currency, initialBalance }).then((r) => r.data)

export const deposit = (id: string, currency: string, amount: number) =>
  api.post<Account>(`/api/accounts/${id}/deposit`, { currency, amount }).then((r) => r.data)

export const withdraw = (id: string, currency: string, amount: number) =>
  api.post<Account>(`/api/accounts/${id}/withdraw`, { currency, amount }).then((r) => r.data)

export const closeAccount = (id: string) =>
  api.post<Account>(`/api/accounts/${id}/close`).then((r) => r.data)

export const getTransactions = (id: string, page = 0, size = 20) =>
  api.get<Page<Transaction>>(`/api/accounts/${id}/transactions?page=${page}&size=${size}`).then((r) => r.data)

export const exportTransactions = (id: string, from?: string, to?: string) => {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to)   params.set('to', to)
  return api.get(`/api/accounts/${id}/transactions/export?${params.toString()}`, {
    responseType: 'blob',
  }).then((r) => r.data as Blob)
}

export const getBalanceSummary = (id: string, days = 30) =>
  api.get<DailyBalance[]>(`/api/accounts/${id}/transactions/summary?days=${days}`).then((r) => r.data)
