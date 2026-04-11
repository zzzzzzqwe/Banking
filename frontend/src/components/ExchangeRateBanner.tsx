import { useEffect, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { getExchangeRate } from '../api/exchange'

interface Props {
  fromCurrency: string
  toCurrency: string
}

export function ExchangeRateBanner({ fromCurrency, toCurrency }: Props) {
  const [rate, setRate] = useState<number | null>(null)

  useEffect(() => {
    if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) {
      setRate(null)
      return
    }
    getExchangeRate(fromCurrency, toCurrency)
      .then((r) => setRate(r.rate))
      .catch(() => setRate(null))
  }, [fromCurrency, toCurrency])

  if (fromCurrency === toCurrency || rate === null) return null

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
      style={{
        background: 'rgba(6,182,212,0.06)',
        border: '1px solid rgba(6,182,212,0.15)',
      }}
    >
      <ArrowLeftRight size={12} className="text-cyan-500 flex-shrink-0" />
      <span className="text-slate-400">Exchange rate:</span>
      <span className="text-cyan-400 font-semibold num">
        1 {fromCurrency} = {Number(rate).toFixed(6)} {toCurrency}
      </span>
      <span className="text-slate-600 ml-auto">recipient gets converted amount</span>
    </div>
  )
}
