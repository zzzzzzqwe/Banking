import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftRight, RefreshCw, CheckCircle2, Copy, TrendingUp } from 'lucide-react'
import { transfer } from '../api/transfers'
import { getExchangeRates, getSupportedCurrencies } from '../api/exchange'
import { GlassCard } from '../components/GlassCard'
import { ExchangeRateBanner } from '../components/ExchangeRateBanner'
import { useToastStore } from '../store/useToastStore'

const FALLBACK_CURRENCIES = ['USD', 'EUR', 'GBP', 'RUB']

export function TransfersPage() {
  const push = useToastStore((s) => s.push)

  const [form, setForm] = useState({ fromAccountId: '', toAccountId: '', currency: 'USD', toCurrency: 'USD', amount: '' })
  const [idempKey, setIdempKey]   = useState<string>(crypto.randomUUID())
  const [loading, setLoading]     = useState(false)
  const [lastTxId, setLastTxId]   = useState<string | null>(null)
  const [currencies, setCurrencies] = useState<string[]>(FALLBACK_CURRENCIES)
  const [rates, setRates]           = useState<Record<string, number>>({})

  useEffect(() => {
    getSupportedCurrencies()
      .then((c) => setCurrencies([...c].sort()))
      .catch(() => {})
    getExchangeRates()
      .then(setRates)
      .catch(() => {})
  }, [])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await transfer({ ...form }, idempKey)
      setLastTxId(res.transactionId)
      push('Transfer completed!', 'success')
      setForm((f) => ({ ...f, amount: '' }))
      setIdempKey(crypto.randomUUID())
    } catch (err: any) {
      push(err.response?.data?.message || 'Transfer failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id)
    push('Copied to clipboard', 'info')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Transfers</h1>
        <p className="text-sm text-slate-500 mt-0.5">Send funds between accounts securely</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard glow="cyan">
          {/* Icon header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <ArrowLeftRight size={18} className="text-cyan-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">New Transfer</p>
              <p className="text-xs text-slate-500">Idempotent — safe to retry</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">From Account ID</label>
              <input value={form.fromAccountId} onChange={set('fromAccountId')} className="input font-mono text-sm" placeholder="UUID of source account" required />
            </div>

            <div className="relative flex items-center justify-center">
              <div className="flex-1 h-px bg-white/[0.05]" />
              <div className="mx-3 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <ArrowLeftRight size={12} className="text-cyan-400" />
              </div>
              <div className="flex-1 h-px bg-white/[0.05]" />
            </div>

            <div>
              <label className="label">To Account ID</label>
              <input value={form.toAccountId} onChange={set('toAccountId')} className="input font-mono text-sm" placeholder="UUID of destination account" required />
            </div>

            <ExchangeRateBanner fromCurrency={form.currency} toCurrency={form.toCurrency} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">From Currency</label>
                <select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className="input">
                  {currencies.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">To Currency (recipient)</label>
                <select value={form.toCurrency} onChange={(e) => setForm((f) => ({ ...f, toCurrency: e.target.value }))} className="input">
                  {currencies.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Amount</label>
              <input type="number" value={form.amount} onChange={set('amount')} className="input num" placeholder="0.00" min="0.01" step="0.01" required />
            </div>

            {/* Idempotency key */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Idempotency Key</label>
                <button type="button" onClick={() => setIdempKey(crypto.randomUUID())} className="text-xs text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1">
                  <RefreshCw size={10} /> regenerate
                </button>
              </div>
              <div className="relative">
                <input value={idempKey} onChange={(e) => setIdempKey(e.target.value)} className="input font-mono text-xs pr-10" />
                <button type="button" onClick={() => copyId(idempKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors">
                  <Copy size={14} />
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1.5">Same key = same result (idempotent). Safe to retry on network errors.</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? (
                <><div className="w-4 h-4 spin rounded-full" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} /><span>Processing…</span></>
              ) : (
                <><ArrowLeftRight size={16} /><span>Send Transfer</span></>
              )}
            </button>
          </form>
        </GlassCard>
      </motion.div>

      {/* Exchange rates table */}
      {Object.keys(rates).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-cyan-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">Exchange Rates</p>
              <span className="text-xs text-slate-600 ml-auto">relative to 1 unit</span>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>From \ To</th>
                    {currencies.map((c) => <th key={c}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {currencies.map((from) => (
                    <tr key={from}>
                      <td className="font-semibold text-slate-300">{from}</td>
                      {currencies.map((to) => {
                        const key = `${from}_${to}`
                        const rate = rates[key]
                        return (
                          <td key={to} className={`num text-xs ${from === to ? 'text-slate-600' : 'text-slate-300'}`}>
                            {rate != null ? Number(rate).toFixed(4) : '—'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Last transaction */}
      {lastTxId && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard glow="blue">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-400 mb-1">Transfer successful</p>
                <p className="text-xs text-slate-500 mb-1">Transaction ID:</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs text-slate-300 truncate">{lastTxId}</p>
                  <button onClick={() => copyId(lastTxId)} className="text-slate-500 hover:text-cyan-400 flex-shrink-0 transition-colors">
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
