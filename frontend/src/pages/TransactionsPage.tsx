import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { getAccounts, getTransactions, exportTransactions, updateTransactionCategory } from '../api/accounts'
import { getCategories } from '../api/budgets'
import { GlassCard } from '../components/GlassCard'
import { AccountSelect } from '../components/AccountSelect'
import { PageLoader } from '../components/LoadingSpinner'
import { useToastStore } from '../store/useToastStore'
import type { Account, Transaction, Page, Category } from '../types'

const ICON_FALLBACK: Record<string, string> = {
  'heart-pulse': '🏥', 'send': '🔁', 'shopping-bag': '🛍️', 'utensils': '🍽️',
  'car': '🚗', 'film': '🎬', 'lightbulb': '💡', 'book-open': '📚',
  'briefcase': '💼', 'gift': '🎁', 'undo-2': '↩️', 'shopping-cart': '🛒',
  'credit-card': '💳', 'package': '📦', 'repeat': '🔁', 'arrow-left-right': '💱',
  'wallet': '💼', 'banknote': '💵', 'receipt': '🧾', 'home': '🏠',
  'plane': '✈️', 'coffee': '☕', 'music': '🎵', 'gamepad-2': '🎮',
  'dumbbell': '💪', 'shirt': '👕', 'scissors': '✂️', 'phone': '📱',
  'wifi': '📶', 'baby': '👶', 'dog': '🐕', 'flower-2': '🌸',
}

function resolveIcon(icon: string | null | undefined): string {
  if (!icon) return ''
  if (ICON_FALLBACK[icon]) return ICON_FALLBACK[icon]
  if (/^[a-z]/.test(icon)) return ''
  return icon
}

const txColor = (type: string) => {
  if (type.includes('DEPOSIT') || type.includes('CREDIT') || type.includes('LOAN') || type === 'EXCHANGE_IN')
    return { color: 'text-emerald-400', bg: 'rgba(52,211,153,0.08)', icon: ArrowDownLeft }
  return { color: 'text-red-400', bg: 'rgba(248,113,113,0.08)', icon: ArrowUpRight }
}

export function TransactionsPage() {
  const push = useToastStore((s) => s.push)
  const [accounts, setAccounts]       = useState<Account[]>([])
  const [categories, setCategories]   = useState<Category[]>([])
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [accountId, setAccountId] = useState('')
  const [fromDate, setFromDate]   = useState('')
  const [toDate, setToDate]       = useState('')
  const [data, setData]           = useState<Page<Transaction> | null>(null)
  const [page, setPage]           = useState(0)
  const [loading, setLoading]     = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    getAccounts()
      .then((accs) => {
        setAccounts(accs)
        const first = accs.find((a) => a.status === 'ACTIVE') ?? accs[0]
        if (first) {
          setAccountId(first.id)
          load(0, first.id)
        }
      })
      .catch(() => {})
      .finally(() => setAccountsLoading(false))
    getCategories().then(setCategories).catch(() => {})
  }, [])

  const categoryByCode = (code?: string | null) =>
    code ? categories.find((c) => c.code.toUpperCase() === code.toUpperCase()) : undefined

  const load = async (p = 0, overrideId?: string) => {
    const id = overrideId || accountId
    if (!id.trim()) { push('Select a card', 'warning'); return }
    setLoading(true)
    try {
      const res = await getTransactions(id.trim(), p)
      setData(res)
      setPage(p)
    } catch {
      push('Account not found or access denied', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!accountId.trim()) { push('Select a card first', 'warning'); return }
    setExporting(true)
    try {
      const blob = await exportTransactions(accountId.trim(), fromDate || undefined, toDate || undefined)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `statement-${accountId.trim()}.csv`
      a.click()
      URL.revokeObjectURL(url)
      push('Statement exported', 'success')
    } catch {
      push('Export failed', 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Transaction History</h1>
        <p className="text-sm text-slate-500 mt-0.5">View all operations on a card</p>
      </div>

      <GlassCard>
        <div className="flex gap-3 mb-3 items-end">
          <div className="flex-1">
            <AccountSelect
              accounts={accounts}
              value={accountId}
              onChange={(id) => { setAccountId(id); load(0, id) }}
              label="Card"
              placeholder="Select card"
              loading={accountsLoading}
            />
          </div>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <label className="text-xs text-slate-500 whitespace-nowrap">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input text-xs flex-1" />
            <label className="text-xs text-slate-500 whitespace-nowrap">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input text-xs flex-1" />
            {(fromDate || toDate) && (
              <button onClick={() => { setFromDate(''); setToDate('') }} className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">
                Clear
              </button>
            )}
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || !accountId.trim()}
            className="btn-ghost flex items-center gap-2 text-xs whitespace-nowrap"
            title="Export CSV"
          >
            {exporting
              ? <div className="w-3 h-3 spin rounded-full" style={{ border: '1px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
              : <Download size={14} />}
            Export CSV
          </button>
        </div>
      </GlassCard>

      {loading && <PageLoader />}

      {!loading && data && (() => {
        const filtered = data.content.filter((tx) => {
          const txDate = tx.createdAt.slice(0, 10)
          if (fromDate && txDate < fromDate) return false
          if (toDate && txDate > toDate) return false
          return true
        })
        return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard padding={false}>
            <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-cyan-400" />
                <p className="text-sm font-medium text-white">Transactions</p>
                <span className="text-xs text-slate-500">
                  ({(fromDate || toDate) ? `${filtered.length} shown / ` : ''}{data.totalElements} total)
                </span>
              </div>
              {data.totalPages > 1 && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <button onClick={() => load(page - 1)} disabled={data.first} className="p-1 hover:text-cyan-400 disabled:opacity-30 transition-colors"><ChevronLeft size={14} /></button>
                  <span>{page + 1} / {data.totalPages}</span>
                  <button onClick={() => load(page + 1)} disabled={data.last} className="p-1 hover:text-cyan-400 disabled:opacity-30 transition-colors"><ChevronRight size={14} /></button>
                </div>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">No transactions found</div>
            ) : (
              <div className="divide-y divide-white/[0.03] overflow-x-auto">
                {filtered.map((tx, i) => {
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
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-400 font-medium">{tx.type.replace(/_/g, ' ')}</p>
                          {tx.category ? (
                            (() => {
                              const cat = categoryByCode(tx.category)
                              return (
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded inline-flex items-center gap-1"
                                  style={{
                                    background: cat?.color ? `${cat.color}15` : 'rgba(255,255,255,0.06)',
                                    color: cat?.color || '#94a3b8',
                                    border: cat?.color ? `1px solid ${cat.color}30` : '1px solid rgba(255,255,255,0.06)',
                                  }}
                                >
                                  {resolveIcon(cat?.icon)} {cat?.name || tx.category}
                                </span>
                              )
                            })()
                          ) : (
                            <select
                              className="text-[10px] bg-transparent border border-white/[0.08] rounded px-1 py-0.5 text-slate-500 cursor-pointer hover:border-cyan-500/30"
                              value=""
                              onChange={async (e) => {
                                try {
                                  await updateTransactionCategory(tx.id, e.target.value)
                                  tx.category = e.target.value
                                  setData({ ...data! })
                                  push('Category updated', 'success')
                                } catch { push('Failed to update category', 'error') }
                              }}
                            >
                              <option value="" disabled>+ category</option>
                              {categories.map((c) => <option key={c.id} value={c.code}>{resolveIcon(c.icon)} {c.name}</option>)}
                            </select>
                          )}
                        </div>
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
        )
      })()}

      {!loading && !data && (
        <GlassCard className="text-center py-16">
          <ClipboardList size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Select a card to view transactions</p>
          <p className="text-slate-600 text-sm mt-1">Choose from the dropdown above</p>
        </GlassCard>
      )}
    </div>
  )
}
