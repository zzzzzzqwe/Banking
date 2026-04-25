import api from './axios'
import type { Budget, BudgetPeriod, Category } from '../types'

export const getCategories = () =>
  api.get<Category[]>('/api/categories').then((r) => r.data)

export const createCategory = (payload: { code: string; name: string; icon?: string; color?: string; type?: 'INCOME' | 'EXPENSE' }) =>
  api.post<Category>('/api/categories', payload).then((r) => r.data)

export const deleteCategory = (id: string) =>
  api.delete<void>(`/api/categories/${id}`).then((r) => r.data)

export const getBudgets = () =>
  api.get<Budget[]>('/api/budgets').then((r) => r.data)

export const createBudget = (payload: { categoryId: string; period: BudgetPeriod; limitAmount: string; currency?: string; alertThreshold?: string }) =>
  api.post<Budget>('/api/budgets', payload).then((r) => r.data)

export const updateBudget = (id: string, payload: { limitAmount?: string; period?: BudgetPeriod; alertThreshold?: string }) =>
  api.put<Budget>(`/api/budgets/${id}`, payload).then((r) => r.data)

export const deleteBudget = (id: string) =>
  api.delete<void>(`/api/budgets/${id}`).then((r) => r.data)
