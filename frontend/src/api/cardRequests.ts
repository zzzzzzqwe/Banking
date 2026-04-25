import api from './axios'
import type { CardRequest, CardRequestType } from '../types'

export const createCardRequest = (accountId: string, type: CardRequestType) =>
  api.post<CardRequest>('/api/card-requests', { accountId, type }).then((r) => r.data)

export const getMyCardRequests = () =>
  api.get<CardRequest[]>('/api/card-requests').then((r) => r.data)

export const getMyPendingCardRequests = () =>
  api.get<CardRequest[]>('/api/card-requests/pending').then((r) => r.data)
