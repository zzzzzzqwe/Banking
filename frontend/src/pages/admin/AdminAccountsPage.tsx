import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { getAllAccounts } from '../../api/admin'
import { GlassCard } from '../../components/GlassCard'
import { PageLoader } from '../../components/LoadingSpinner'
import { useToastStore } from '../../store/useToastStore'
import type { Account, Page } from '../../types'

export function AdminAccountsPage() {
  const push = useToastStore((s) => s.push)
  const [data, setData]       = useState<Page<Account> | null>(null)
  const [page, setPage]       = useState(0)
  const [loading, setLoading] = useState(true)

  const load = async (p = 0) => {
    setLoading(true)
    try {
      const res = await getAllAccounts(p, 15)
      setData(res)
      setPage(p)
    } catch {
      push('Failed to load accounts', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const totalBalance = data?.content.reduce((s, a) => s + Number(a.balance), 0) ?? 0
  const activeCount  = data?.content.filter((a) => a.status === 'ACTIVE').length ?? 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}>
            <Wallet size={18} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">All Accounts</h1>
            <p className="text-xs text-slate-500">{data?.totalElements ?? 0} accounts in system</p>
          </div>
        </div>
        <button onClick={() => load(page)} className="btn-ghost text-xs flex items-center gap-2"><RefreshCw size={14} /></button>
      </div>

      {/* Quick stats */}
      {data && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'This Page Balance', value: `$${totalBalance.toFixed(2)}`, color: 'text-cyan-400' },
            { label: 'Active on Page', value: activeCount.toString(), color: 'text-emerald-400' },
            { label: 'Total Accounts', value: data.totalElements.toString(), color: 'text-purple-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-xl font-bold num ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? <PageLoader /> : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard padding={false}>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Account ID</th>
                    <th>Owner ID</th>
                    <th>Currency</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.content.map((a, i) => (
                    <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                      <td className="font-mono text-xs text-slate-500">{a.id.slice(0, 14)}…</td>
                      <td className="font-mono text-xs text-slate-500">{a.ownerId.slice(0, 14)}…</td>
                      <td>
                        <span className="px-2 py-0.5 rounded-md text-xs font-mono font-medium" style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }}>
                          {a.currency}
                        </span>
                      </td>
                      <td className="num font-semibold text-white">{Number(a.balance).toFixed(2)}</td>
                      <td><span className={a.status === 'ACTIVE' ? 'badge-active' : 'badge-closed'}>{a.status}</span></td>
                      <td className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-white/[0.04]">
                <p className="text-xs text-slate-600">{data.totalElements} accounts</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => load(page - 1)} disabled={data.first} className="p-1.5 rounded-lg hover:bg-white/[0.05] disabled:opacity-30 text-slate-400 hover:text-slate-200 transition-colors"><ChevronLeft size={14} /></button>
                  <span className="text-xs text-slate-500 px-2">{page + 1} / {data.totalPages}</span>
                  <button onClick={() => load(page + 1)} disabled={data.last} className="p-1.5 rounded-lg hover:bg-white/[0.05] disabled:opacity-30 text-slate-400 hover:text-slate-200 transition-colors"><ChevronRight size={14} /></button>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
