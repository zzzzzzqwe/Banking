import api from './axios'
import type { SavingsGoal } from '../types'

export const getGoals = () =>
  api.get<SavingsGoal[]>('/api/savings-goals').then((r) => r.data)

export const createGoal = (accountId: string, name: string, description: string, targetAmount: number) =>
  api.post<SavingsGoal>('/api/savings-goals', { accountId, name, description, targetAmount }).then((r) => r.data)

export const depositToGoal = (id: string, amount: number) =>
  api.post<SavingsGoal>(`/api/savings-goals/${id}/deposit`, { amount }).then((r) => r.data)

export const withdrawFromGoal = (id: string, amount: number) =>
  api.post<SavingsGoal>(`/api/savings-goals/${id}/withdraw`, { amount }).then((r) => r.data)

export const deleteGoal = (id: string) =>
  api.delete(`/api/savings-goals/${id}`)
