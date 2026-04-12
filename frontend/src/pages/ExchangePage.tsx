import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, ArrowDownUp, Clock, ArrowRight } from 'lucide-react'
import { GlassCard } from '../components/GlassCard'
import { getAccounts } from '../api/accounts'
import {
  getExchangeRate,
  performExchange,
  getExchangeHistory,
  type ExchangeResponseDto,
} from '../api/exchange'
import { useToastStore } from '../store/useToastStore'
import type { Account, ExchangeRecord, Page } from '../types'

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', RUB: '₽', JPY: '¥',
}

export function ExchangePage() {
  const push = useToastStore((s) => s.push)
  const mountedRef = useRef(true)

  const [accounts, setAccounts] = useState<Account[]>([])
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [amount, setAmount] = useState('')
  const [rate, setRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [lastResult, setLastResult] = useState<ExchangeResponseDto | null>(null)

  // History
  const [history, setHistory] = useState<Page<ExchangeRecord> | null>(null)
  const [historyPage, setHistoryPage] = useState(0)

  useEffect(() => {
    mountedRef.current = true
    setLoading(true)
    getAccounts()
      .then((data) => {
        if (mountedRef.current) setAccounts(data.filter((a) => a.status === 'ACTIVE'))
      })
      .catch(() => push('Failed to load accounts', 'error'))
      .finally(() => { if (mountedRef.current) setLoading(false) })
    loadHistory(0)
    return () => { mountedRef.current = false }
  }, [])

  const fromAccount = accounts.find((a) => a.id === fromId)
  const toAccount = accounts.find((a) => a.id === toId)

  // Fetch rate when accounts change
  useEffect(() => {
    if (!fromAccount || !toAccount || fromAccount.currency === toAccount.currency) {
      setRate(null)
      return
    }
    getExchangeRate(fromAccount.currency, toAccount.currency)
      .then((r) => { if (mountedRef.current) setRate(r.rate) })
      .catch(() => setRate(null))
  }, [fromId, toId, accounts])

  const convertedAmount = rate && amount ? (parseFloat(amount) * rate).toFixed(2) : null

  const handleSwap = () => {
    setFromId(toId)
    setToId(fromId)
  }

  const handleExchange = async () => {
    if (!fromId || !toId || !amount) return
    setSubmitting(true)
    try {
      const res = await performExchange({
        fromAccountId: fromId,
        toAccountId: toId,
        amount: parseFloat(amount),
      })
      setLastResult(res)
      setAmount('')
      push('Exchange completed successfully', 'success')
      // Refresh accounts and history
      const updated = await getAccounts()
      if (mountedRef.current) setAccounts(updated.filter((a) => a.status === 'ACTIVE'))
      loadHistory(0)
    } catch (e: any) {
      push(e.response?.data?.message || 'Exchange failed', 'error')
    } finally {
      if (mountedRef.current) setSubmitting(false)
    }
  }

  const loadHistory = (page: number) => {
    getExchangeHistory(page)
      .then((data) => {
        if (mountedRef.current) {
          setHistory(data)
          setHistoryPage(page)
        }
      })
      .catch(() => {})
  }

  const availableToAccounts = accounts.filter(
    (a) => a.id !== fromId && (!fromAccount || a.currency !== fromAccount.currency)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Currency Exchange</h1>
        <p className="text-sm text-slate-500 mt-1">Convert between your accounts instantly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Exchange form */}
        <div className="lg:col-span-3">
          <GlassCard glow="cyan">
            <div className="space-y-5">
              {/* From */}
              <div>
                <label className="label">From Account</label>
                <select
                  className="input w-full"
                  value={fromId}
                  onChange={(e) => setFromId(e.target.value)}
                >
                  <option value="">Select source account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {CURRENCY_FLAGS[a.currency] || ''} {a.currency} — {a.balance.toFixed(2)} ({a.id.slice(0, 8)}…)
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="label">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    className="input w-full pr-16"
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  {fromAccount && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                      {fromAccount.currency}
                    </span>
                  )}
                </div>
                {fromAccount && (
                  <p className="text-xs text-slate-600 mt-1">
                    Available: {CURRENCY_FLAGS[fromAccount.currency]}{fromAccount.balance.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Swap button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSwap}
                  className="p-2 rounded-xl glass hover:bg-white/[0.06] transition-colors"
                  title="Swap accounts"
                >
                  <ArrowDownUp size={18} className="text-cyan-400" />
                </button>
              </div>

              {/* To */}
              <div>
                <label className="label">To Account</label>
                <select
                  className="input w-full"
                  value={toId}
                  onChange={(e) => setToId(e.target.value)}
                >
                  <option value="">Select destination account</option>
                  {availableToAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {CURRENCY_FLAGS[a.currency] || ''} {a.currency} — {a.balance.toFixed(2)} ({a.id.slice(0, 8)}…)
                    </option>
                  ))}
                </select>
              </div>

              {/* Rate & Preview */}
              <AnimatePresence>
                {rate !== null && fromAccount && toAccount && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass rounded-xl p-4 space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Exchange Rate</span>
                      <span className="text-white font-mono">
                        1 {fromAccount.currency} = {rate.toFixed(6)} {toAccount.currency}
                      </span>
                    </div>
                    {convertedAmount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">You will receive</span>
                        <span className="text-emerald-400 font-bold font-mono">
                          {CURRENCY_FLAGS[toAccount.currency]}{convertedAmount} {toAccount.currency}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={!fromId || !toId || !amount || submitting || parseFloat(amount) <= 0}
                onClick={handleExchange}
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                {submitting ? 'Exchanging...' : 'Exchange'}
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Last result */}
        <div className="lg:col-span-2">
          <AnimatePresence>
            {lastResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard glow="purple">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Last Exchange</h3>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-400 num">
                        -{lastResult.fromAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">{lastResult.fromCurrency}</p>
                    </div>
                    <ArrowRight size={18} className="text-slate-600" />
                    <div className="text-center">
                      <p className="text-lg font-bold text-emerald-400 num">
                        +{lastResult.toAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">{lastResult.toCurrency}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 text-center">
                    Rate: {lastResult.rate.toFixed(6)}
                  </p>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {accounts.length < 2 && (
            <GlassCard>
              <p className="text-sm text-slate-400 text-center py-4">
                You need at least 2 accounts with different currencies to exchange.
              </p>
            </GlassCard>
          )}
        </div>
      </div>

      {/* History */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock size={18} className="text-cyan-400" />
            Exchange History
          </h2>
        </div>

        {history && history.content.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th className="text-left text-xs text-slate-500 pb-2">From</th>
                    <th className="text-left text-xs text-slate-500 pb-2">To</th>
                    <th className="text-right text-xs text-slate-500 pb-2">Rate</th>
                    <th className="text-right text-xs text-slate-500 pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.content.map((ex) => (
                    <tr key={ex.id} className="border-t border-white/[0.04]">
                      <td className="py-2.5 text-sm">
                        <span className="text-red-400 num font-medium">-{ex.fromAmount.toFixed(2)}</span>
                        <span className="text-slate-500 ml-1">{ex.fromCurrency}</span>
                      </td>
                      <td className="py-2.5 text-sm">
                        <span className="text-emerald-400 num font-medium">+{ex.toAmount.toFixed(2)}</span>
                        <span className="text-slate-500 ml-1">{ex.toCurrency}</span>
                      </td>
                      <td className="py-2.5 text-sm text-right text-slate-400 num">
                        {ex.exchangeRate.toFixed(4)}
                      </td>
                      <td className="py-2.5 text-sm text-right text-slate-500">
                        {new Date(ex.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {history.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  className="btn-ghost text-xs"
                  disabled={history.first}
                  onClick={() => loadHistory(historyPage - 1)}
                >
                  Previous
                </button>
                <span className="text-xs text-slate-500 py-2">
                  {historyPage + 1} / {history.totalPages}
                </span>
                <button
                  className="btn-ghost text-xs"
                  disabled={history.last}
                  onClick={() => loadHistory(historyPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500 text-center py-6">No exchange history yet</p>
        )}
      </GlassCard>
    </div>
  )
}
