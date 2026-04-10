import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ClipboardList, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { getTransactions } from '../api/accounts'
import { GlassCard } from '../components/GlassCard'
import { PageLoader } from '../components/LoadingSpinner'
import { useToastStore } from '../store/useToastStore'
import type { Transaction, Page } from '../types'

const txColor = (type: string) => {
  if (type.includes('DEPOSIT') || type.includes('CREDIT') || type.includes('LOAN')) return { color: 'text-emerald-400', bg: 'rgba(52,211,153,0.08)', icon: ArrowDownLeft }
  return { color: 'text-red-400', bg: 'rgba(248,113,113,0.08)', icon: ArrowUpRight }
}

export function TransactionsPage() {
  const push = useToastStore((s) => s.push)
  const [accountId, setAccountId] = useState('')
  const [data, setData]           = useState<Page<Transaction> | null>(null)
  const [page, setPage]           = useState(0)
  const [loading, setLoading]     = useState(false)

  const load = async (p = 0) => {
    if (!accountId.trim()) { push('Enter an account ID', 'warning'); return }
    setLoading(true)
    try {
      const res = await getTransactions(accountId.trim(), p)
      setData(res)
      setPage(p)
    } catch {
      push('Account not found or access denied', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Transaction History</h1>
        <p className="text-sm text-slate-500 mt-0.5">View all operations on an account</p>
      </div>

      <GlassCard>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load(0)}
              className="input pl-9 font-mono text-sm"
              placeholder="Paste account UUID…"
            />
          </div>
          <button onClick={() => load(0)} disabled={loading} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            {loading ? <div className="w-4 h-4 spin rounded-full" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : <Search size={16} />}
            <span>Search</span>
          </button>
        </div>
      </GlassCard>

      {loading && <PageLoader />}

      {!loading && data && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard padding={false}>
            <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-cyan-400" />
                <p className="text-sm font-medium text-white">Transactions</p>
                <span className="text-xs text-slate-500">({data.totalElements} total)</span>
              </div>
              {data.totalPages > 1 && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <button onClick={() => load(page - 1)} disabled={data.first} className="p-1 hover:text-cyan-400 disabled:opacity-30 transition-colors"><ChevronLeft size={14} /></button>
                  <span>{page + 1} / {data.totalPages}</span>
                  <button onClick={() => load(page + 1)} disabled={data.last} className="p-1 hover:text-cyan-400 disabled:opacity-30 transition-colors"><ChevronRight size={14} /></button>
                </div>
              )}
            </div>

            {data.content.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">No transactions found</div>
            ) : (
              <div className="divide-y divide-white/[0.03]">
                {data.content.map((tx, i) => {
                  const { color, bg, icon: TxIcon } = txColor(tx.type)
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                        <TxIcon size={14} className={color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 font-medium">{tx.type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-slate-600 font-mono truncate">{tx.id}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-semibold num ${color}`}>
                          {tx.amount > 0 ? '+' : ''}{Number(tx.amount).toFixed(2)} {tx.currency}
                        </p>
                        <p className="text-xs text-slate-600">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}

      {!loading && !data && (
        <GlassCard className="text-center py-16">
          <ClipboardList size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Enter an account ID to view transactions</p>
          <p className="text-slate-600 text-sm mt-1">Paste the UUID from your Accounts page</p>
        </GlassCard>
      )}
    </div>
  )
}
