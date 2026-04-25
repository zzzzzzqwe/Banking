import api from './axios'
import type { Beneficiary } from '../types'

export const getBeneficiaries = () =>
  api.get<Beneficiary[]>('/api/beneficiaries').then((r) => r.data)

export const createBeneficiary = (payload: {
  nickname: string
  accountNumber: string
  bankName?: string
  holderName?: string
  currency: string
  favorite?: boolean
}) =>
  api.post<Beneficiary>('/api/beneficiaries', payload).then((r) => r.data)

export const updateBeneficiary = (id: string, payload: Partial<{ nickname: string; bankName: string; holderName: string; favorite: boolean }>) =>
  api.put<Beneficiary>(`/api/beneficiaries/${id}`, payload).then((r) => r.data)

export const deleteBeneficiary = (id: string) =>
  api.delete<void>(`/api/beneficiaries/${id}`).then((r) => r.data)

export const touchBeneficiary = (id: string) =>
  api.post<Beneficiary>(`/api/beneficiaries/${id}/touch`).then((r) => r.data)
