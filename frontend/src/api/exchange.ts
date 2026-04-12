import api from './axios'
import type { ExchangeRecord, Page } from '../types'

export interface ExchangeRates {
  [pair: string]: number
}

export interface RateResponse {
  from: string
  to: string
  rate: number
}

export interface ExchangeRequestDto {
  fromAccountId: string
  toAccountId: string
  amount: number
}

export interface ExchangeResponseDto {
  exchangeId: string
  fromAmount: number
  fromCurrency: string
  toAmount: number
  toCurrency: string
  rate: number
  createdAt: string
}

export const getExchangeRates = () =>
  api.get<ExchangeRates>('/api/exchange/rates').then((r) => r.data)

export const getExchangeRate = (from: string, to: string) =>
  api.get<RateResponse>(`/api/exchange/rate?from=${from}&to=${to}`).then((r) => r.data)

export const getSupportedCurrencies = () =>
  api.get<string[]>('/api/exchange/currencies').then((r) => r.data)

export const performExchange = (req: ExchangeRequestDto) =>
  api.post<ExchangeResponseDto>('/api/exchange', req).then((r) => r.data)

export const getExchangeHistory = (page = 0, size = 20) =>
  api.get<Page<ExchangeRecord>>(`/api/exchange/history?page=${page}&size=${size}`).then((r) => r.data)
