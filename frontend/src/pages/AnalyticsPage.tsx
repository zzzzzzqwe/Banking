import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PieChart as PieChartIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import { GlassCard } from '../components/GlassCard'
import { getAccounts, getAnalytics } from '../api/accounts'
import { useToastStore } from '../store/useToastStore'
import type { Account, AnalyticsResponse } from '../types'

const PERIODS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '1y', days: 365 },
]

const CATEGORY_COLORS: Record<string, string> = {
  SALARY: '#10b981',
  GROCERIES: '#f59e0b',
  TRANSPORT: '#3b82f6',
  ENTERTAINMENT: '#a855f7',
  UTILITIES: '#6366f1',
  HEALTHCARE: '#ef4444',
  EDUCATION: '#14b8a6',
  SHOPPING: '#f97316',
  RESTAURANT: '#ec4899',
  TRANSFER: '#06b6d4',
  EXCHANGE: '#8b5cf6',
  LOAN: '#64748b',
  OTHER: '#475569',
}

const PIE_COLORS = [
  '#06b6d4', '#a855f7', '#f59e0b', '#10b981', '#ef4444',
  '#3b82f6', '#ec4899', '#f97316', '#6366f1', '#14b8a6',
  '#64748b', '#475569', '#8b5cf6',
]

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', RUB: '₽', JPY: '¥',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs border border-white/[0.08]"
         style={{ background: 'rgba(4,4,16,0.95)' }}>
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="num">
          {p.name}: {p.value?.toFixed(2)}
        </p>
      ))}
    </div>
  )
}

export function AnalyticsPage() {
  const push = useToastStore((s) => s.push)
  const mountedRef = useRef(true)

  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountId, setAccountId] = useState('')
  const [days, setDays] = useState(30)
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    mountedRef.current = true
    getAccounts()
      .then((accs) => {
        if (!mountedRef.current) return
        const active = accs.filter((a) => a.status === 'ACTIVE')
        setAccounts(active)
        if (active.length > 0) setAccountId(active[0].id)
      })
      .catch(() => push('Failed to load accounts', 'error'))
      .finally(() => { if (mountedRef.current) setInitialLoading(false) })
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!accountId) return
    setLoading(true)
    getAnalytics(accountId, days)
      .then((res) => { if (mountedRef.current) setData(res) })
      .catch(() => { if (mountedRef.current) { setData(null); push('Failed to load analytics', 'error') } })
      .finally(() => { if (mountedRef.current) setLoading(false) })
  }, [accountId, days])

  const selectedAccount = accounts.find((a) => a.id === accountId)
  const sym = selectedAccount ? (CURRENCY_SYMBOLS[selectedAccount.currency] || '') : ''

  // Aggregate daily data for large periods
  const chartData = data ? aggregateForChart(data.dailyAggregates, days) : []

  if (initialLoading) {
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
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Track your spending patterns</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="label">Account</label>
          <select className="input w-full" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.currency} — {a.balance.toFixed(2)} ({a.id.slice(0, 8)}…)
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                days === p.days
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'glass text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
              <GlassCard>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)' }}>
                    <TrendingUp size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Income</p>
                    <p className="text-lg font-bold text-emerald-400 num">{sym}{data.totalIncome.toFixed(2)}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <GlassCard>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
                    <TrendingDown size={18} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Expenses</p>
                    <p className="text-lg font-bold text-red-400 num">{sym}{data.totalExpense.toFixed(2)}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <GlassCard>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ background: data.net >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                    <Minus size={18} className={data.net >= 0 ? 'text-emerald-400' : 'text-red-400'} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Net</p>
                    <p className={`text-lg font-bold num ${data.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {data.net >= 0 ? '+' : ''}{sym}{data.net.toFixed(2)}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart — Spending by Category */}
            <GlassCard glow="purple">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <PieChartIcon size={16} className="text-purple-400" />
                Spending by Category
              </h3>
              {data.categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {data.categoryBreakdown.map((entry, i) => (
                        <Cell
                          key={entry.category}
                          fill={CATEGORY_COLORS[entry.category] || PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null
                        const d = payload[0].payload
                        return (
                          <div className="glass rounded-lg px-3 py-2 text-xs border border-white/[0.08]"
                               style={{ background: 'rgba(4,4,16,0.95)' }}>
                            <p className="text-slate-300 font-medium">{d.category}</p>
                            <p className="text-white num">{sym}{d.amount.toFixed(2)} ({d.percentage}%)</p>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500 text-center py-10">No expense data</p>
              )}
              {/* Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {data.categoryBreakdown.map((entry, i) => (
                  <div key={entry.category} className="flex items-center gap-1.5 text-xs">
                    <div
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ background: CATEGORY_COLORS[entry.category] || PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-slate-400">{entry.category}</span>
                    <span className="text-slate-600">{entry.percentage}%</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Bar Chart — Income vs Expenses */}
            <GlassCard glow="cyan">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Income vs Expenses</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      width={50}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
                    />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500 text-center py-10">No data</p>
              )}
            </GlassCard>
          </div>

          {/* Category breakdown table */}
          {data.categoryBreakdown.length > 0 && (
            <GlassCard>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Category Breakdown</h3>
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th className="text-left text-xs text-slate-500 pb-2">Category</th>
                    <th className="text-right text-xs text-slate-500 pb-2">Amount</th>
                    <th className="text-right text-xs text-slate-500 pb-2">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {data.categoryBreakdown.map((cat, i) => (
                    <tr key={cat.category} className="border-t border-white/[0.04]">
                      <td className="py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                            style={{ background: CATEGORY_COLORS[cat.category] || PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="text-slate-300">{cat.category}</span>
                        </div>
                      </td>
                      <td className="py-2 text-sm text-right text-white num font-medium">
                        {sym}{cat.amount.toFixed(2)}
                      </td>
                      <td className="py-2 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${cat.percentage}%`,
                                background: CATEGORY_COLORS[cat.category] || PIE_COLORS[i % PIE_COLORS.length],
                              }}
                            />
                          </div>
                          <span className="text-slate-400 text-xs num w-10 text-right">{cat.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          )}
        </>
      ) : (
        <GlassCard>
          <p className="text-sm text-slate-500 text-center py-8">Select an account to view analytics</p>
        </GlassCard>
      )}
    </div>
  )
}

interface ChartPoint {
  label: string
  income: number
  expense: number
}

function aggregateForChart(
  daily: { date: string; income: number; expense: number }[],
  days: number
): ChartPoint[] {
  if (days <= 30) {
    // Show daily, but limit labels
    return daily.map((d) => ({
      label: d.date.slice(5), // MM-DD
      income: d.income,
      expense: d.expense,
    }))
  }

  // Aggregate by week for 90d, by month for 1y
  const bucketSize = days <= 90 ? 7 : 30
  const result: ChartPoint[] = []

  for (let i = 0; i < daily.length; i += bucketSize) {
    const slice = daily.slice(i, i + bucketSize)
    const income = slice.reduce((s, d) => s + d.income, 0)
    const expense = slice.reduce((s, d) => s + d.expense, 0)
    const label = slice[0].date.slice(5)
    result.push({ label, income: +income.toFixed(2), expense: +expense.toFixed(2) })
  }

  return result
}
