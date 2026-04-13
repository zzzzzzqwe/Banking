import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target, Plus, ArrowDownToLine, ArrowUpFromLine,
  Trash2, PartyPopper, Wallet
} from 'lucide-react'
import { getGoals, createGoal, depositToGoal, withdrawFromGoal, deleteGoal } from '../api/savingsGoals'
import { getAccounts } from '../api/accounts'
import { GlassCard } from '../components/GlassCard'
import { Modal } from '../components/Modal'
import { useToastStore } from '../store/useToastStore'
import type { SavingsGoal, Account } from '../types'

const currencySymbols: Record<string, string> = { USD: '$', EUR: '\u20ac', RUB: '\u20bd', GBP: '\u00a3' }
function fmt(amount: number, currency: string) {
  const sym = currencySymbols[currency] || currency + ' '
  return sym + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function GoalProgress({ current, target }: { current: number; target: number }) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
        <span>{pct}% complete</span>
        <span className="text-cyan-400">{pct === 100 ? 'Done!' : `${100 - pct}% left`}</span>
      </div>
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={pct === 100 ? {
            background: 'linear-gradient(90deg, #06b6d4, #a855f7, #06b6d4)',
            backgroundSize: '200% 100%',
            animation: 'border-spin 3s linear infinite',
          } : {}}
        />
      </div>
    </div>
  )
}

function GoalCard({ goal, onAction }: { goal: SavingsGoal; onAction: () => void }) {
  const push = useToastStore((s) => s.push)
  const [depositOpen, setDepositOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDeposit = async () => {
    const val = parseFloat(amount)
    if (!val || val <= 0) return
    setLoading(true)
    try {
      await depositToGoal(goal.id, val)
      push('Deposited to goal!', 'success')
      setDepositOpen(false)
      setAmount('')
      onAction()
    } catch (err: any) {
      push(err.response?.data?.message || 'Deposit failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    const val = parseFloat(amount)
    if (!val || val <= 0) return
    setLoading(true)
    try {
      await withdrawFromGoal(goal.id, val)
      push('Withdrawn from goal', 'success')
      setWithdrawOpen(false)
      setAmount('')
      onAction()
    } catch (err: any) {
      push(err.response?.data?.message || 'Withdraw failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this goal? Remaining funds will return to your account.')) return
    try {
      await deleteGoal(goal.id)
      push('Goal deleted', 'info')
      onAction()
    } catch (err: any) {
      push(err.response?.data?.message || 'Delete failed', 'error')
    }
  }

  const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0

  return (
    <>
      <GlassCard>
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: goal.completed
                    ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(6,182,212,0.2))'
                    : 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.15))',
                  border: `1px solid ${goal.completed ? 'rgba(168,85,247,0.3)' : 'rgba(6,182,212,0.2)'}`,
                }}
              >
                {goal.completed ? (
                  <PartyPopper size={18} className="text-purple-400" />
                ) : (
                  <Target size={18} className="text-cyan-400" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">{goal.name}</h3>
                {goal.description && (
                  <p className="text-[11px] text-slate-500 mt-0.5">{goal.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-lg font-bold text-slate-100">{fmt(goal.currentAmount, goal.currency)}</span>
              <span className="text-xs text-slate-500">of {fmt(goal.targetAmount, goal.currency)}</span>
            </div>
            <GoalProgress current={goal.currentAmount} target={goal.targetAmount} />
          </div>

          {goal.completed ? (
            <div
              className="text-center py-2 rounded-xl text-xs font-medium text-purple-300"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(6,182,212,0.1))' }}
            >
              Goal reached!
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setAmount(''); setDepositOpen(true) }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20 transition-all"
              >
                <ArrowDownToLine size={13} /> Deposit
              </button>
              <button
                onClick={() => { setAmount(''); setWithdrawOpen(true) }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-white/[0.04] border border-white/[0.08] transition-all"
                disabled={goal.currentAmount <= 0}
              >
                <ArrowUpFromLine size={13} /> Withdraw
              </button>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Deposit modal */}
      <Modal open={depositOpen} onClose={() => setDepositOpen(false)} title="Deposit to Goal">
        <div className="space-y-4">
          <div>
            <label className="label">Amount ({goal.currency})</label>
            <input
              type="number"
              className="input w-full"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
            />
          </div>
          {amount && parseFloat(amount) > 0 && (
            <p className="text-xs text-slate-500">
              Progress after deposit: {Math.min(100, Math.round(((goal.currentAmount + parseFloat(amount)) / goal.targetAmount) * 100))}%
            </p>
          )}
          <button
            onClick={handleDeposit}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="btn-primary w-full"
          >
            {loading ? 'Processing...' : 'Deposit'}
          </button>
        </div>
      </Modal>

      {/* Withdraw modal */}
      <Modal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} title="Withdraw from Goal">
        <div className="space-y-4">
          <div>
            <label className="label">Amount ({goal.currency})</label>
            <input
              type="number"
              className="input w-full"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              max={goal.currentAmount}
            />
            <p className="text-[11px] text-slate-600 mt-1">Available: {fmt(goal.currentAmount, goal.currency)}</p>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > goal.currentAmount}
            className="btn-primary w-full"
          >
            {loading ? 'Processing...' : 'Withdraw'}
          </button>
        </div>
      </Modal>
    </>
  )
}

export function SavingsGoalsPage() {
  const push = useToastStore((s) => s.push)
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  // Create form
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [creating, setCreating] = useState(false)

  const load = async () => {
    try {
      const [g, a] = await Promise.all([getGoals(), getAccounts()])
      setGoals(g)
      setAccounts(a.filter((acc) => acc.status === 'ACTIVE'))
    } catch {
      push('Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    const amt = parseFloat(targetAmount)
    if (!name.trim() || !amt || amt <= 0 || !selectedAccount) return
    setCreating(true)
    try {
      await createGoal(selectedAccount, name.trim(), description.trim(), amt)
      push('Goal created!', 'success')
      setCreateOpen(false)
      resetForm()
      load()
    } catch (err: any) {
      push(err.response?.data?.message || 'Failed to create goal', 'error')
    } finally {
      setCreating(false)
    }
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setTargetAmount('')
    setSelectedAccount('')
  }

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
  const completedCount = goals.filter((g) => g.completed).length

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-white/[0.06]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Savings Goals</h1>
          <p className="text-xs text-slate-500 mt-1">
            {goals.length > 0
              ? `${completedCount} of ${goals.length} completed`
              : 'Create your first savings goal'}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setCreateOpen(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={14} />
          New Goal
        </button>
      </div>

      {/* Stats */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard>
            <div className="p-4 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total Saved</p>
              <p className="text-lg font-bold text-cyan-400">
                {totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-4 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total Target</p>
              <p className="text-lg font-bold text-slate-200">
                {totalTarget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-4 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Completed</p>
              <p className="text-lg font-bold text-purple-400">{completedCount}</p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <GlassCard>
          <div className="p-12 text-center">
            <Target size={40} className="mx-auto mb-3 text-slate-600" />
            <p className="text-sm text-slate-400 mb-1">No savings goals yet</p>
            <p className="text-xs text-slate-600">Start saving for something you love!</p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <GoalCard goal={goal} onAction={load} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Savings Goal">
        <div className="space-y-4">
          <div>
            <label className="label">Goal Name</label>
            <input
              type="text"
              className="input w-full"
              placeholder="e.g. Vacation, New Laptop..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <input
              type="text"
              className="input w-full"
              placeholder="What are you saving for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={255}
            />
          </div>
          <div>
            <label className="label">Account</label>
            <select
              className="input w-full"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              <option value="">Select account...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.currency} — {fmt(acc.balance, acc.currency)}
                  {acc.cardNetwork ? ` (${acc.cardNetwork})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Target Amount</label>
            <input
              type="number"
              className="input w-full"
              placeholder="0.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              min="0.01"
              step="0.01"
            />
            {selectedAccount && targetAmount && parseFloat(targetAmount) > 0 && (
              <p className="text-[11px] text-slate-600 mt-1">
                Currency: {accounts.find((a) => a.id === selectedAccount)?.currency || '—'}
              </p>
            )}
          </div>
          <button
            onClick={handleCreate}
            disabled={creating || !name.trim() || !targetAmount || parseFloat(targetAmount) <= 0 || !selectedAccount}
            className="btn-primary w-full"
          >
            {creating ? 'Creating...' : 'Create Goal'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
