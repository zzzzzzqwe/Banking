import api from './axios'

export interface TransferDto {
  fromAccountId: string
  toAccountId: string
  currency: string
  amount: string
}

export const transfer = (dto: TransferDto, idempotencyKey: string) =>
  api.post<{ transactionId: string }>('/api/transfers', dto, {
    headers: { 'X-Idempotency-Key': idempotencyKey },
  }).then((r) => r.data)
