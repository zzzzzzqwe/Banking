import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PiggyBank, Plus, Trash2, AlertTriangle, TrendingUp } from 'lucide-react'
import { GlassCard } from '../components/GlassCard'
import { Modal } from '../components/Modal'
import { PageLoader } from '../components/LoadingSpinner'
import { getBudgets, createBudget, deleteBudget, getCategories } from '../api/budgets'
import { useToastStore } from '../store/useToastStore'
import type { Budget, BudgetPeriod, Category } from '../types'

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
  if (!icon) return '📁'
  if (ICON_FALLBACK[icon]) return ICON_FALLBACK[icon]
  if (/^[a-z]/.test(icon)) return '📁'
  return icon
}

export function BudgetsPage() {
  const push = useToastStore((s) => s.push)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  const [form, setForm] = useState({
    categoryId: '',
    period: 'MONTHLY' as BudgetPeriod,
    limitAmount: '',
    currency: 'USD',
    alertThreshold: '80',
  })

  const load = async () => {
    setLoading(true)
    try {
      const [bs, cs] = await Promise.all([getBudgets(), getCategories()])
      setBudgets(bs)
      setCategories(cs)
    } catch { push('Failed to load budgets', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.categoryId || !form.limitAmount) { push('Fill all fields', 'warning'); return }
    try {
      await createBudget({
        categoryId: form.categoryId,
        period: form.period,
        limitAmount: form.limitAmount,
        currency: form.currency,
        alertThreshold: form.alertThreshold,
      })
      push('Budget created', 'success')
      setCreateOpen(false)
      setForm({ ...form, categoryId: '', limitAmount: '' })
      load()
    } catch (e: any) {
      push(e.response?.data?.message || 'Failed to create', 'error')
    }
  }

  const handleDelete = async (b: Budget) => {
    if (!confirm(`Delete budget for ${b.categoryName}?`)) return
    try {
      await deleteBudget(b.id)
      push('Budget deleted', 'success')
      load()
    } catch { push('Failed to delete', 'error') }
  }

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE')
  const usedCategoryIds = new Set(budgets.map((b) => b.categoryId))
  const availableCats = expenseCategories.filter((c) => !usedCategoryIds.has(c.id))

  if (loading) return <PageLoader />

  const totalSpent = budgets.reduce((s, b) => s + Number(b.spent), 0)
  const totalLimit = budgets.reduce((s, b) => s + Number(b.limitAmount), 0)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Budgets</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track spending against your category limits</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2" disabled={availableCats.length === 0}>
          <Plus size={16} /> New Budget
        </button>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Spent</p>
            <p className="text-xl font-bold text-cyan-400 num">{totalSpent.toFixed(2)}</p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Limit</p>
            <p className="text-xl font-bold text-purple-400 num">{totalLimit.toFixed(2)}</p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Budgets</p>
            <p className="text-xl font-bold text-emerald-400 num">{budgets.length}</p>
          </GlassCard>
        </div>
      )}

      {budgets.length === 0 ? (
        <GlassCard className="text-center py-16">
          <PiggyBank size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No budgets yet</p>
          <p className="text-slate-600 text-sm mt-1">Create one to monitor your spending</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const pct = Math.min(100, Number(b.percentUsed))
            const overThreshold = b.alertThreshold && pct >= Number(b.alertThreshold)
            const exceeded = pct >= 100
            const barColor = exceeded ? '#ef4444' : overThreshold ? '#f59e0b' : (b.categoryColor || '#06b6d4')
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <GlassCard>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: `${b.categoryColor || '#06b6d4'}15`, border: `1px solid ${b.categoryColor || '#06b6d4'}30` }}
                      >
                        {resolveIcon(b.categoryIcon)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{b.categoryName}</p>
                        <p className="text-xs text-slate-500">{b.period.toLowerCase()} · {b.currency}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {exceeded && <AlertTriangle size={14} className="text-red-400" />}
                      <button onClick={() => handleDelete(b)} className="text-slate-600 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Spent</p>
                        <p className="text-lg font-bold num text-white">
                          {Number(b.spent).toFixed(2)}<span className="text-slate-600 text-sm font-normal"> / {Number(b.limitAmount).toFixed(2)}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Remaining</p>
                        <p className={`text-sm font-semibold num ${exceeded ? 'text-red-400' : 'text-emerald-400'}`}>
                          {Number(b.remaining).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ background: barColor, boxShadow: `0 0 10px ${barColor}80` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{Number(b.percentUsed).toFixed(1)}% used</span>
                      <span className="text-slate-600">{b.periodStart} — {b.periodEnd}</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create budget modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Budget">
        <div className="space-y-4">
          <div>
            <label className="label">Category</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input w-full">
              <option value="">Select category</option>
              {availableCats.map((c) => (
                <option key={c.id} value={c.id}>{resolveIcon(c.icon)} {c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Period</label>
              <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value as BudgetPeriod })} className="input w-full">
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </div>
            <div>
              <label className="label">Currency</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="input w-full">
                {['USD', 'EUR', 'GBP', 'RUB', 'KZT', 'JPY', 'CNY'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Limit</label>
            <input type="number" min="0" step="0.01" value={form.limitAmount} onChange={(e) => setForm({ ...form, limitAmount: e.target.value })} className="input w-full" placeholder="0.00" />
          </div>

          <div>
            <label className="label flex items-center gap-2"><TrendingUp size={12} /> Alert threshold (%)</label>
            <input type="number" min="0" max="100" step="1" value={form.alertThreshold} onChange={(e) => setForm({ ...form, alertThreshold: e.target.value })} className="input w-full" placeholder="80" />
            <p className="text-xs text-slate-600 mt-1">Highlight bar when spending reaches this percent</p>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setCreateOpen(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleCreate} className="btn-primary flex-1">Create</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
