import api from './axios'

export interface ExchangeRates {
  [pair: string]: number
}

export interface RateResponse {
  from: string
  to: string
  rate: number
}

export const getExchangeRates = () =>
  api.get<ExchangeRates>('/api/exchange/rates').then((r) => r.data)

export const getExchangeRate = (from: string, to: string) =>
  api.get<RateResponse>(`/api/exchange/rate?from=${from}&to=${to}`).then((r) => r.data)

export const getSupportedCurrencies = () =>
  api.get<string[]>('/api/exchange/currencies').then((r) => r.data)
