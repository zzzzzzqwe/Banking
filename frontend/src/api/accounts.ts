import api from './axios'
import type { Account, Transaction, Page } from '../types'

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
