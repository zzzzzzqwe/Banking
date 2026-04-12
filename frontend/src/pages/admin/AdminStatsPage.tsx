import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Wallet, CreditCard, AlertTriangle,
  TrendingUp, Clock, CheckCircle2, XCircle, RefreshCw,
  BarChart3,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { getAdminStats } from '../../api/admin'
import { GlassCard } from '../../components/GlassCard'
import { useToastStore } from '../../store/useToastStore'
import type { AdminStats } from '../../api/admin'

/* ─── Animated counter ───────────────────────────────────── */
function Counter({ to, duration = 1200 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (to === 0) return
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      setVal(Math.floor(p * to))
      if (p < 1) requestAnimationFrame(tick)
      else setVal(to)
    }
    requestAnimationFrame(tick)
  }, [to, duration])
  return <>{val.toLocaleString()}</>
}

/* ─── Stat card ──────────────────────────────────────────── */
function StatCard({
  icon: Icon, label, value, sub, color, delay = 0,
}: {
  icon: typeof Users; label: string; value: number
  sub?: string; color: string; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass rounded-2xl p-5 relative overflow-hidden"
      style={{ border: `1px solid ${color}18` }}
    >
      <motion.div
        className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
        animate={{ opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)`, transform: 'translate(30%,-30%)' }}
      />
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-bold num text-white">
        <Counter to={value} />
      </p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </motion.div>
  )
}

/* ─── Custom tooltip ─────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(4,4,16,0.95)', border: '1px solid rgba(6,182,212,0.2)' }}>
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-semibold">{p.value}</span></p>
      ))}
    </div>
  )
}

/* ─── Pie tooltip ────────────────────────────────────────── */
const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(4,4,16,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p style={{ color: payload[0].payload.fill }}>{payload[0].name}: <span className="font-semibold">{payload[0].value}</span></p>
    </div>
  )
}

const PIE_COLORS: Record<string, string> = {
  ACTIVE: '#06b6d4', PENDING: '#f59e0b', CLOSED: '#64748b', REJECTED: '#ef4444',
}
const CURRENCY_COLORS = ['#06b6d4', '#a855f7', '#10b981', '#f59e0b', '#3b82f6']

/* ─── Main page ──────────────────────────────────────────── */
export function AdminStatsPage() {
  const push = useToastStore((s) => s.push)
  const [stats, setStats]   = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  const load = () => {
    setLoading(true)
    getAdminStats()
      .then((s) => { if (mounted.current) setStats(s) })
      .catch(() => { if (mounted.current) push('Failed to load stats', 'error') })
      .finally(() => { if (mounted.current) setLoading(false) })
  }

  useEffect(() => {
    mounted.current = true
    load()
    return () => { mounted.current = false }
  }, [])

  const pieData = stats
    ? Object.entries(stats.loanStatusCounts)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value, fill: PIE_COLORS[name] ?? '#94a3b8' }))
    : []

  const monthLabels = stats?.monthlyVolume.map((m) => m.month.slice(5)) ?? []

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={16} className="text-orange-400" />
            <p className="text-xs text-orange-400/70 uppercase tracking-widest">Admin</p>
          </div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Platform overview — real-time data</p>
        </div>
        <button onClick={load} disabled={loading}
          className="btn-ghost flex items-center gap-2 text-xs">
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}         label="Total Users"    value={stats?.totalUsers ?? 0}     sub={`${stats?.activeUsers ?? 0} active`}    color="#06b6d4" delay={0}    />
        <StatCard icon={Wallet}        label="Accounts"       value={stats?.totalAccounts ?? 0}  sub={`${stats?.activeAccounts ?? 0} active`} color="#a855f7" delay={0.06} />
        <StatCard icon={CreditCard}    label="Loans Issued"   value={stats?.totalLoans ?? 0}     sub={`${stats?.activeLoans ?? 0} active`}    color="#10b981" delay={0.12} />
        <StatCard icon={AlertTriangle} label="Overdue"        value={stats?.overdueCount ?? 0}   sub={`${stats?.pendingLoans ?? 0} pending approval`} color="#ef4444" delay={0.18} />
      </div>

      {/* Charts row 1: monthly volume + loan status pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Monthly volume — area chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2">
          <GlassCard glow="cyan" className="h-full">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-cyan-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">Transaction Volume</p>
              <span className="text-xs text-slate-600 ml-auto">last 6 months</span>
            </div>
            <p className="text-lg font-semibold text-white mb-5">Deposits vs Withdrawals</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={stats?.monthlyVolume ?? []}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gDep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gWit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickFormatter={(v) => v.slice(5)}
                  tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="deposits"    name="Deposits"    stroke="#06b6d4" strokeWidth={2} fill="url(#gDep)" />
                <Area type="monotone" dataKey="withdrawals" name="Withdrawals" stroke="#a855f7" strokeWidth={2} fill="url(#gWit)" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Loan status pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GlassCard className="h-full">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={14} className="text-purple-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">Loan Status</p>
            </div>
            <p className="text-lg font-semibold text-white mb-4">Distribution</p>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65}
                      paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                        <span className="text-slate-400">{d.name}</span>
                      </div>
                      <span className="num font-semibold text-white">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-32 text-xs text-slate-600">No loans yet</div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Charts row 2: currency distribution + quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Currency distribution bar chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={14} className="text-emerald-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">Currency Distribution</p>
              <span className="text-xs text-slate-600 ml-auto">active accounts</span>
            </div>
            <p className="text-lg font-semibold text-white mb-5">Balance by Currency</p>
            {(stats?.currencyDistribution.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats?.currencyDistribution ?? []}
                  margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis dataKey="currency" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="totalBalance" name="Total Balance" radius={[6, 6, 0, 0]}>
                    {stats?.currencyDistribution.map((_, i) => (
                      <Cell key={i} fill={CURRENCY_COLORS[i % CURRENCY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-32 text-xs text-slate-600">No accounts yet</div>
            )}
          </GlassCard>
        </motion.div>

        {/* Quick breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard className="h-full">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Platform Health</p>
            <div className="space-y-3">
              {[
                { label: 'Active Users',    value: stats?.activeUsers ?? 0,    total: stats?.totalUsers ?? 0,    color: '#06b6d4', icon: Users },
                { label: 'Active Accounts', value: stats?.activeAccounts ?? 0, total: stats?.totalAccounts ?? 0, color: '#a855f7', icon: Wallet },
                { label: 'Active Loans',    value: stats?.activeLoans ?? 0,    total: stats?.totalLoans ?? 0,    color: '#10b981', icon: CreditCard },
              ].map(({ label, value, total, color, icon: Icon }) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Icon size={11} style={{ color }} />
                        <span className="text-slate-400">{label}</span>
                      </div>
                      <span className="text-white font-semibold num">{value} <span className="text-slate-600 font-normal">/ {total}</span></span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                        style={{ background: color }}
                      />
                    </div>
                  </div>
                )
              })}

              <div className="pt-3 border-t border-white/[0.05] space-y-2.5">
                {[
                  { icon: Clock,        label: 'Pending Approvals', value: stats?.pendingLoans ?? 0,  color: '#f59e0b' },
                  { icon: AlertTriangle,label: 'Overdue Payments',  value: stats?.overdueCount ?? 0,  color: '#ef4444' },
                  { icon: CheckCircle2, label: 'Closed Loans',      value: (stats?.loanStatusCounts?.CLOSED ?? 0), color: '#64748b' },
                  { icon: XCircle,      label: 'Rejected Loans',    value: (stats?.loanStatusCounts?.REJECTED ?? 0), color: '#ef4444' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Icon size={11} style={{ color }} />
                      <span className="text-slate-500">{label}</span>
                    </div>
                    <span className="num font-semibold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Currency table */}
      {(stats?.currencyDistribution.length ?? 0) > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard padding={false}>
            <div className="px-6 py-4 border-b border-white/[0.05]">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Currency Breakdown</p>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Currency</th>
                  <th>Active Accounts</th>
                  <th>Total Balance</th>
                  <th>Avg Balance</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {stats?.currencyDistribution.map((row, i) => {
                  const totalAll = stats.currencyDistribution.reduce((s, r) => s + Number(r.totalBalance), 0)
                  const pct = totalAll > 0 ? ((Number(row.totalBalance) / totalAll) * 100).toFixed(1) : '0'
                  const avg = row.count > 0 ? (Number(row.totalBalance) / row.count).toFixed(2) : '0'
                  return (
                    <tr key={row.currency}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: CURRENCY_COLORS[i % CURRENCY_COLORS.length] }} />
                          <span className="font-semibold text-white">{row.currency}</span>
                        </div>
                      </td>
                      <td className="num">{row.count}</td>
                      <td className="num font-semibold text-cyan-400">{Number(row.totalBalance).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="num text-slate-400">{avg}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CURRENCY_COLORS[i % CURRENCY_COLORS.length] }} />
                          </div>
                          <span className="text-xs text-slate-500 w-10 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
