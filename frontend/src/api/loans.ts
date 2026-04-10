import api from './axios'
import type { Loan, RepaymentEntry } from '../types'

export interface LoanApplicationDto {
  accountId: string
  amount: number
  annualInterestRate: number
  termMonths: number
}

export const applyForLoan = (dto: LoanApplicationDto) =>
  api.post<Loan>('/api/loans', dto).then((r) => r.data)

export const getMyLoans = () =>
  api.get<Loan[]>('/api/loans').then((r) => r.data)

export const getLoan = (id: string) =>
  api.get<Loan>(`/api/loans/${id}`).then((r) => r.data)

export const getSchedule = (id: string) =>
  api.get<RepaymentEntry[]>(`/api/loans/${id}/schedule`).then((r) => r.data)

export const makeRepayment = (id: string) =>
  api.post<RepaymentEntry>(`/api/loans/${id}/repay`).then((r) => r.data)
