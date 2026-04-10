import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, CreditCard, Clock, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { getAccounts } from '../api/accounts'
import { getMyLoans } from '../api/loans'
import { StatCard } from '../components/StatCard'
import { GlassCard } from '../components/GlassCard'
import { PageLoader } from '../components/LoadingSpinner'
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

// Mock chart data based on balance
function generateChartData(balance: number) {
  const points = 12
  return Array.from({ length: points }, (_, i) => ({
    name: `${i + 1}`,
    value: Math.max(0, balance * (0.6 + 0.4 * Math.sin(i * 0.8) + i * 0.03)),
  }))
}

export function DashboardPage() {
  const { userId, role } = useAuthStore()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loans, setLoans]       = useState<Loan[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([getAccounts(), getMyLoans()])
      .then(([accs, lns]) => { setAccounts(accs); setLoans(lns) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const totalBalance  = accounts.reduce((s, a) => s + a.balance, 0)
  const activeAccs    = accounts.filter((a) => a.status === 'ACTIVE').length
  const activeLoans   = loans.filter((l) => l.status === 'ACTIVE').length
  const pendingLoans  = loans.filter((l) => l.status === 'PENDING').length
  const chartData     = generateChartData(totalBalance || 10000)

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
        <Link to="/accounts" className="btn-ghost flex items-center gap-2 text-xs">
          <Plus size={14} /> New Account
        </Link>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Balance"    value={totalBalance}  prefix="$"      icon={Wallet}     color="cyan"    animateNumber delay={0}    />
        <StatCard label="Active Accounts"  value={activeAccs}                    icon={TrendingUp}  color="blue"    animateNumber delay={0.05} />
        <StatCard label="Active Loans"     value={activeLoans}                   icon={CreditCard}  color="purple"  animateNumber delay={0.1}  />
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
                <p className="text-xs text-slate-500 uppercase tracking-wider">Portfolio Balance</p>
                <p className="text-3xl font-bold num text-white mt-1">${totalBalance.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-400 flex items-center gap-1 justify-end">
                  <ArrowUpRight size={12} /> All accounts
                </span>
                <p className="text-xs text-slate-600 mt-0.5">{activeAccs} active</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={120}>
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
                  formatter={(v: number) => [`$${v.toFixed(2)}`, 'Balance']}
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
              <p className="text-xs text-slate-500 uppercase tracking-wider">Your Accounts</p>
              <Link to="/accounts" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">View all</Link>
            </div>

            {accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Wallet size={28} className="text-slate-700 mb-3" />
                <p className="text-xs text-slate-500">No accounts yet</p>
                <Link to="/accounts" className="text-xs text-cyan-400 mt-2 hover:underline">Create one</Link>
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
                      <p className="text-xs font-mono text-slate-400 truncate">{a.id.slice(0, 12)}…</p>
                      <p className="text-sm font-semibold num text-white">${Number(a.balance).toFixed(2)}</p>
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
