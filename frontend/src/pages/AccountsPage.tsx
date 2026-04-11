import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Wallet, ArrowUp, ArrowDown, X, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { getAccounts, createAccount, deposit, withdraw, closeAccount } from '../api/accounts'
import { GlassCard } from '../components/GlassCard'
import { AccountsSkeleton } from '../components/Skeleton'
import { Modal } from '../components/Modal'
import { useToastStore } from '../store/useToastStore'
import type { Account } from '../types'

function AccountCard({ account, onRefresh }: { account: Account; onRefresh: () => void }) {
  const push = useToastStore((s) => s.push)
  const [expanded, setExpanded] = useState(false)
  const [txType, setTxType]     = useState<'deposit' | 'withdraw' | null>(null)
  const [amount, setAmount]     = useState('')
  const [loading, setLoading]   = useState(false)

  const isActive = account.status === 'ACTIVE'

  const handleTx = async () => {
    if (!txType || !amount) return
    setLoading(true)
    try {
      const fn = txType === 'deposit' ? deposit : withdraw
      await fn(account.id, account.currency, parseFloat(amount))
      push(`${txType === 'deposit' ? 'Deposit' : 'Withdrawal'} successful`, 'success')
      setTxType(null)
      setAmount('')
      onRefresh()
    } catch (err: any) {
      push(err.response?.data?.message || 'Transaction failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = async () => {
    if (!confirm('Close this account? Balance must be 0.')) return
    setLoading(true)
    try {
      await closeAccount(account.id)
      push('Account closed', 'success')
      onRefresh()
    } catch (err: any) {
      push(err.response?.data?.message || 'Cannot close account', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div layout className="glass rounded-2xl overflow-hidden card-glow" style={{ borderColor: isActive ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.05)' }}>
      {/* Card top accent */}
      <div className="h-0.5" style={{ background: isActive ? 'linear-gradient(90deg, transparent, rgba(6,182,212,0.5), transparent)' : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
              style={{ background: isActive ? 'rgba(6,182,212,0.1)' : 'rgba(148,163,184,0.06)', border: `1px solid ${isActive ? 'rgba(6,182,212,0.2)' : 'rgba(148,163,184,0.12)'}`, color: isActive ? '#06b6d4' : '#64748b' }}
            >
              {account.currency}
            </div>
            <div>
              <p className="text-xs font-mono text-slate-500">{account.id.slice(0, 14)}…</p>
              <span className={isActive ? 'badge-active' : 'badge-closed'}>{account.status}</span>
            </div>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        <div className="mb-1">
          <p className="text-xs text-slate-600 mb-0.5">Balance</p>
          <p className="text-3xl font-bold num text-white">
            {Number(account.balance).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-base text-slate-500 ml-1">{account.currency}</span>
          </p>
        </div>

        <p className="text-xs text-slate-600">
          Created {new Date(account.createdAt).toLocaleDateString()}
        </p>

        {/* Actions */}
        {isActive && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setTxType(txType === 'deposit' ? null : 'deposit')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${txType === 'deposit' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' : 'btn-ghost'}`}
            >
              <ArrowDown size={12} /> Deposit
            </button>
            <button
              onClick={() => setTxType(txType === 'withdraw' ? null : 'withdraw')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${txType === 'withdraw' ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' : 'btn-ghost'}`}
            >
              <ArrowUp size={12} /> Withdraw
            </button>
          </div>
        )}

        <AnimatePresence>
          {txType && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-white/[0.05] mt-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input flex-1 py-2 text-sm"
                    placeholder="Amount"
                    min="0.01"
                    step="0.01"
                    autoFocus
                  />
                  <button onClick={handleTx} disabled={loading || !amount} className="btn-primary px-4 py-2 text-xs">
                    {loading ? '…' : 'Send'}
                  </button>
                  <button onClick={() => setTxType(null)} className="p-2 text-slate-500 hover:text-slate-300">
                    <X size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/[0.05]"
          >
            <div className="px-5 py-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span className="text-slate-600">Full ID</span>
                <span className="font-mono">{account.id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="text-slate-600">Owner ID</span>
                <span className="font-mono">{account.ownerId.slice(0, 16)}…</span>
              </div>
              {isActive && (
                <button onClick={handleClose} disabled={loading} className="btn-danger w-full mt-2 text-xs py-1.5">
                  Close Account
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function AccountsPage() {
  const push = useToastStore((s) => s.push)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading]   = useState(true)
  const [creating, setCreating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [currency, setCurrency]   = useState('USD')
  const [initBal, setInitBal]     = useState('0')

  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const load = () => {
    setLoading(true)
    getAccounts()
      .then((data) => { if (mountedRef.current) setAccounts(data) })
      .catch(() => { if (mountedRef.current) push('Failed to load accounts', 'error') })
      .finally(() => { if (mountedRef.current) setLoading(false) })
  }

  useEffect(load, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await createAccount(currency.toUpperCase(), parseFloat(initBal) || 0)
      push('Account created!', 'success')
      setShowModal(false)
      setCurrency('USD')
      setInitBal('0')
      load()
    } catch (err: any) {
      push(err.response?.data?.message || 'Failed to create account', 'error')
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <AccountsSkeleton />

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Accounts</h1>
          <p className="text-sm text-slate-500 mt-0.5">{accounts.length} account{accounts.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-ghost flex items-center gap-2 text-xs"><RefreshCw size={14} /></button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> New Account
          </button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <GlassCard className="text-center py-16">
          <Wallet size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-medium mb-2">No accounts yet</p>
          <p className="text-slate-600 text-sm mb-5">Create your first account to start banking</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mx-auto flex items-center gap-2">
            <Plus size={16} /> Create Account
          </button>
        </GlassCard>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {accounts.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <AccountCard account={a} onRefresh={load} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Account">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input">
              {['USD', 'EUR', 'GBP', 'RUB', 'JPY'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Initial Balance</label>
            <input type="number" value={initBal} onChange={(e) => setInitBal(e.target.value)} className="input" placeholder="0.00" min="0" step="0.01" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary flex-1">
              {creating ? 'Creating…' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
