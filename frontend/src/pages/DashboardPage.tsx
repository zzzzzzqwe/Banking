import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, CreditCard, Clock, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { getAccounts, getBalanceSummary } from '../api/accounts'
import { getMyLoans } from '../api/loans'
import { getExchangeRates } from '../api/exchange'
import { StatCard } from '../components/StatCard'
import { GlassCard } from '../components/GlassCard'
import { DashboardSkeleton } from '../components/Skeleton'
import { useAuthStore } from '../store/useAuthStore'
import type { Account, Loan } from '../types'

function LoanStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING:  'badge-pending',
    ACTIVE:   'badge-active',
    REJECTED: 'badge-rejected',
    CLOSED:   'badge-closed',
  }
  return <span className={map[status] || 'badge'}>{status}</span>
}

export function DashboardPage() {
  const { userId, role } = useAuthStore()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loans, setLoans]       = useState<Loan[]>([])
  const [loading, setLoading]   = useState(true)
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([])
  const [rates, setRates] = useState<Record<string, number>>({})

  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    Promise.all([getAccounts(), getMyLoans(), getExchangeRates().catch(() => ({} as Record<string, number>))])
      .then(async ([accs, lns, rts]) => {
        if (!mounted.current) return
        setAccounts(accs)
        setLoans(lns)
        setRates(rts)

        const active = accs.filter((a) => a.status === 'ACTIVE')
        if (active.length === 0) return

        const convert = (amount: number, from: string) => {
          if (from === 'USD') return amount
          const direct = rts[`${from}_USD`]
          if (direct) return amount * direct
          const reverse = rts[`USD_${from}`]
          if (reverse && reverse !== 0) return amount / reverse
          return 0
        }

        try {
          const summaries = await Promise.all(
            active.map((a) =>
              getBalanceSummary(a.id, 365)
                .then((s) => ({ currency: a.currency, data: s }))
                .catch(() => ({ currency: a.currency, data: [] as { date: string; balance: number }[] }))
            )
          )

          const endOfMonth = new Map<string, number>()
          for (const { currency, data } of summaries) {
            const cardByMonth = new Map<string, number>()
            for (const point of data) {
              cardByMonth.set(point.date.slice(0, 7), convert(point.balance, currency))
            }
            for (const [month, val] of cardByMonth) {
              endOfMonth.set(month, (endOfMonth.get(month) || 0) + val)
            }
          }

          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
          const chartPoints = [...endOfMonth.keys()].sort().map((m) => ({
            name: monthNames[parseInt(m.slice(5, 7), 10) - 1],
            value: Math.round((endOfMonth.get(m) || 0) * 100) / 100,
          }))

          if (mounted.current) setChartData(chartPoints)
        } catch {
          // нет истории — оставляем пустой граф
        }
      })
      .catch(() => {})
      .finally(() => { if (mounted.current) setLoading(false) })
    return () => { mounted.current = false }
  }, [])

  if (loading) return <DashboardSkeleton />

  const activeAccs    = accounts.filter((a) => a.status === 'ACTIVE').length
  const activeLoans   = loans.filter((l) => l.status === 'ACTIVE').length
  const pendingLoans  = loans.filter((l) => l.status === 'PENDING').length
  const primaryCurrency = 'USD'

  const convertToPrimary = (balance: number, fromCurrency: string) => {
    if (fromCurrency === primaryCurrency) return balance
    const direct = rates[`${fromCurrency}_${primaryCurrency}`]
    if (direct && direct !== 0) return balance * direct
    const reverse = rates[`${primaryCurrency}_${fromCurrency}`]
    if (reverse && reverse !== 0) return balance / reverse
    return 0
  }
  const totalBalance = accounts
    .filter((a) => a.status !== 'CLOSED')
    .reduce((s, a) => s + convertToPrimary(a.balance, a.currency), 0)

  const currencySymbol: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', RUB: '₽', JPY: '¥', CNY: '¥', KZT: '₸' }
  const sym = currencySymbol[primaryCurrency] || primaryCurrency + ' '
  const formatCurrency = (amount: number, currency: string) => {
    const s = currencySymbol[currency] || currency + ' '
    return `${s}${Number(amount).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{greeting} 👋</p>
          <h1 className="text-2xl font-bold text-white">
            Dashboard
            {role === 'ADMIN' && (
              <span className="ml-3 text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)', color: '#fb923c' }}>
                ADMIN
              </span>
            )}
          </h1>
        </div>
        <Link to="/cards" className="btn-ghost flex items-center gap-2 text-xs">
          <Plus size={14} /> New Card
        </Link>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Balance"    value={totalBalance}  prefix={sym}    icon={Wallet}     color="cyan"    animateNumber delay={0}    />
        <StatCard label="Active Cards"     value={activeAccs}                    icon={CreditCard}  color="blue"    animateNumber delay={0.05} />
        <StatCard label="Active Loans"     value={activeLoans}                   icon={TrendingUp}  color="purple"  animateNumber delay={0.1}  />
        <StatCard label="Pending Loans"    value={pendingLoans}                  icon={Clock}       color="amber"   animateNumber delay={0.15} subtext={pendingLoans > 0 ? 'Awaiting approval' : 'None pending'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <GlassCard glow="cyan">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Account Balance</p>
                <p className="text-3xl font-bold num text-white mt-1">{sym}{totalBalance.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-400 flex items-center gap-1 justify-end">
                  <ArrowUpRight size={12} /> All cards
                </span>
                <p className="text-xs text-slate-600 mt-0.5">{activeAccs} active</p>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-[120px] text-xs text-slate-600">
                No transaction history yet
              </div>
            ) : null}
            <ResponsiveContainer width="100%" height={chartData.length === 0 ? 0 : 120}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ background: 'rgba(4,4,16,0.9)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
                  formatter={(v: number) => [`${sym}${v.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Balance']}
                />
                <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fill="url(#balGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Account list */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Your Cards</p>
              <Link to="/cards" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">View all</Link>
            </div>

            {accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CreditCard size={28} className="text-slate-700 mb-3" />
                <p className="text-xs text-slate-500">No cards yet</p>
                <Link to="/cards" className="text-xs text-cyan-400 mt-2 hover:underline">Create one</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {accounts.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: a.status === 'ACTIVE' ? 'rgba(6,182,212,0.1)' : 'rgba(148,163,184,0.08)', color: a.status === 'ACTIVE' ? '#06b6d4' : '#64748b' }}
                    >
                      {a.currency}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-slate-400 truncate">{a.cardNumber || a.id.slice(0, 12) + '…'}</p>
                      <p className="text-sm font-semibold num text-white">{formatCurrency(a.balance, a.currency)}</p>
                    </div>
                    {a.status === 'ACTIVE'
                      ? <ArrowUpRight size={12} className="text-emerald-400 flex-shrink-0" />
                      : <ArrowDownLeft size={12} className="text-slate-600 flex-shrink-0" />
                    }
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent loans */}
      {loans.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard>
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Recent Loans</p>
              <Link to="/loans" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Loan ID</th>
                    <th>Principal</th>
                    <th>Rate</th>
                    <th>Term</th>
                    <th>Monthly</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.slice(0, 5).map((l) => (
                    <tr key={l.id}>
                      <td className="font-mono text-slate-500 text-xs">{l.id.slice(0, 12)}…</td>
                      <td className="num font-medium">${Number(l.principalAmount).toFixed(2)}</td>
                      <td className="text-amber-400">{(Number(l.annualInterestRate) * 100).toFixed(1)}%</td>
                      <td className="text-slate-400">{l.termMonths} mo.</td>
                      <td className="num text-cyan-400">{l.monthlyPayment ? `$${Number(l.monthlyPayment).toFixed(2)}` : '—'}</td>
                      <td><LoanStatusBadge status={l.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
