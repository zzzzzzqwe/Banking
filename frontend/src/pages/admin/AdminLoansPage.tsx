import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { getAllLoans, approveLoan, rejectLoan } from '../../api/admin'
import { GlassCard } from '../../components/GlassCard'
import { PageLoader } from '../../components/LoadingSpinner'
import { useToastStore } from '../../store/useToastStore'
import type { Loan, Page } from '../../types'

function LoanBadge({ status }: { status: string }) {
  const map: Record<string, string> = { PENDING: 'badge-pending', ACTIVE: 'badge-active', REJECTED: 'badge-rejected', CLOSED: 'badge-closed' }
  return <span className={map[status] || 'badge'}>{status}</span>
}

export function AdminLoansPage() {
  const push = useToastStore((s) => s.push)
  const [data, setData]         = useState<Page<Loan> | null>(null)
  const [page, setPage]         = useState(0)
  const [loading, setLoading]   = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const load = async (p = 0) => {
    setLoading(true)
    try {
      const res = await getAllLoans(p, 15)
      setData(res)
      setPage(p)
    } catch {
      push('Failed to load loans', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (loan: Loan) => {
    if (!confirm(`Approve loan ${loan.id.slice(0, 8)}…?\n\n$${loan.principalAmount} will be credited to the account.`)) return
    setActionId(loan.id)
    try {
      await approveLoan(loan.id)
      push('Loan approved — funds disbursed!', 'success')
      load(page)
    } catch (err: any) {
      push(err.response?.data?.message || 'Approval failed', 'error')
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (loan: Loan) => {
    if (!confirm(`Reject loan ${loan.id.slice(0, 8)}…?`)) return
    setActionId(loan.id)
    try {
      await rejectLoan(loan.id)
      push('Loan rejected', 'success')
      load(page)
    } catch (err: any) {
      push(err.response?.data?.message || 'Rejection failed', 'error')
    } finally {
      setActionId(null)
    }
  }

  const pending = data?.content.filter((l) => l.status === 'PENDING').length ?? 0
  const active  = data?.content.filter((l) => l.status === 'ACTIVE').length ?? 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}>
            <ShieldCheck size={18} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Loan Management</h1>
            <p className="text-xs text-slate-500">{data?.totalElements ?? 0} loans in system</p>
          </div>
        </div>
        <button onClick={() => load(page)} className="btn-ghost text-xs flex items-center gap-2"><RefreshCw size={14} /></button>
      </div>

      {/* Pending banner */}
      {pending > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}
        >
          <Clock size={18} className="text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-300">{pending} loan{pending !== 1 ? 's' : ''} awaiting approval</p>
            <p className="text-xs text-amber-600">Review and approve or reject pending applications below</p>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: data.totalElements, color: 'text-slate-300' },
            { label: 'Pending', value: pending, color: 'text-amber-400' },
            { label: 'Active', value: active, color: 'text-emerald-400' },
            { label: 'Other', value: data.content.length - pending - active, color: 'text-slate-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass rounded-xl p-4 text-center">
              <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-2xl font-bold num ${color}`}>{value}</p>
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
                    <th>Loan ID</th>
                    <th>Borrower</th>
                    <th>Principal</th>
                    <th>Rate</th>
                    <th>Term</th>
                    <th>Monthly</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.content.map((l, i) => (
                    <motion.tr
                      key={l.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className={l.status === 'PENDING' ? 'bg-amber-500/[0.02]' : ''}
                    >
                      <td className="font-mono text-xs text-slate-500">{l.id.slice(0, 12)}…</td>
                      <td className="font-mono text-xs text-slate-500">{l.borrowerId.slice(0, 10)}…</td>
                      <td className="num font-semibold text-white">${Number(l.principalAmount).toLocaleString()}</td>
                      <td className="text-amber-400 num">{(Number(l.annualInterestRate) * 100).toFixed(1)}%</td>
                      <td className="text-slate-400">{l.termMonths} mo.</td>
                      <td className="num text-cyan-400">{l.monthlyPayment ? `$${Number(l.monthlyPayment).toFixed(2)}` : '—'}</td>
                      <td><LoanBadge status={l.status} /></td>
                      <td className="text-xs text-slate-500">{new Date(l.createdAt).toLocaleDateString()}</td>
                      <td>
                        {l.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(l)}
                              disabled={actionId === l.id}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(52,211,153,0.15)' }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(52,211,153,0.08)' }}
                            >
                              {actionId === l.id ? <div className="w-3 h-3 spin rounded-full" style={{ border: '1px solid rgba(52,211,153,0.3)', borderTopColor: '#34d399' }} /> : <CheckCircle size={12} />}
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(l)}
                              disabled={actionId === l.id}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)' }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)' }}
                            >
                              <XCircle size={12} />
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-white/[0.04]">
                <p className="text-xs text-slate-600">{data.totalElements} loans</p>
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
