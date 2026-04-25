import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Plus, ChevronDown, ChevronUp, Calendar, TrendingDown, RefreshCw } from 'lucide-react'
import { getMyLoans, applyForLoan, makeRepayment, getSchedule } from '../api/loans'
import { GlassCard } from '../components/GlassCard'
import { LoansSkeleton } from '../components/Skeleton'
import { Modal } from '../components/Modal'
import { useToastStore } from '../store/useToastStore'
import type { Loan, RepaymentEntry } from '../types'

function LoanBadge({ status }: { status: string }) {
  const map: Record<string, string> = { PENDING: 'badge-pending', ACTIVE: 'badge-active', REJECTED: 'badge-rejected', CLOSED: 'badge-closed' }
  return <span className={map[status] || 'badge'}>{status}</span>
}

function RepayBadge({ status }: { status: string }) {
  const map: Record<string, string> = { PENDING: 'badge-pending', PAID: 'badge-paid', OVERDUE: 'badge-overdue' }
  return <span className={map[status] || 'badge'}>{status}</span>
}

function RepaymentProgress({ paid, total }: { paid: number; total: number }) {
  const pct = total > 0 ? Math.round((paid / total) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
        <span>{paid} of {total} paid</span>
        <span className="text-cyan-400">{pct}%</span>
      </div>
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

function LoanCard({ loan, onRefresh }: { loan: Loan; onRefresh: () => void }) {
  const push = useToastStore((s) => s.push)
  const [expanded, setExpanded]     = useState(false)
  const [schedule, setSchedule]     = useState<RepaymentEntry[] | null>(null)
  const [loadingSched, setLoadingSched] = useState(false)
  const [repaying, setRepaying]     = useState(false)

  const loadSchedule = async () => {
    if (schedule) return
    setLoadingSched(true)
    try {
      const s = await getSchedule(loan.id)
      setSchedule(s)
    } catch {
      push('Failed to load schedule', 'error')
    } finally {
      setLoadingSched(false)
    }
  }

  const handleExpand = () => {
    setExpanded(!expanded)
    if (!expanded) loadSchedule()
  }

  const handleRepay = async () => {
    setRepaying(true)
    try {
      await makeRepayment(loan.id)
      push('Payment processed!', 'success')
      setSchedule(null)
      onRefresh()
      loadSchedule()
    } catch (err: any) {
      push(err.response?.data?.message || 'Repayment failed', 'error')
    } finally {
      setRepaying(false)
    }
  }

  const paidCount = schedule?.filter((e) => e.status === 'PAID').length ?? 0
  const totalCount = schedule?.length ?? loan.termMonths

  const accentColor = loan.status === 'ACTIVE' ? 'rgba(6,182,212,0.15)' :
                      loan.status === 'PENDING' ? 'rgba(251,191,36,0.12)' :
                      loan.status === 'REJECTED' ? 'rgba(248,113,113,0.1)' :
                      'rgba(148,163,184,0.08)'

  return (
    <motion.div layout className="glass rounded-2xl overflow-hidden" style={{ borderColor: accentColor }}>
      <div className="h-0.5" style={{ background: loan.status === 'ACTIVE' ? 'linear-gradient(90deg, transparent, rgba(6,182,212,0.5), transparent)' : loan.status === 'PENDING' ? 'linear-gradient(90deg, transparent, rgba(251,191,36,0.5), transparent)' : 'none' }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-mono text-slate-600 mb-1">{loan.id.slice(0, 16)}…</p>
            <LoanBadge status={loan.status} />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold num text-white">${Number(loan.principalAmount).toLocaleString()}</p>
            <p className="text-xs text-slate-500">{(Number(loan.annualInterestRate) * 100).toFixed(1)}% / yr</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Term', value: `${loan.termMonths} mo.` },
            { label: 'Monthly', value: loan.monthlyPayment ? `$${Number(loan.monthlyPayment).toFixed(2)}` : '—' },
            { label: 'End Date', value: loan.endDate ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider">{label}</p>
              <p className="text-xs font-semibold num text-slate-300 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {loan.status === 'ACTIVE' && schedule && (
          <div className="mb-4">
            <RepaymentProgress paid={paidCount} total={totalCount} />
          </div>
        )}

        <div className="flex gap-2">
          {loan.status === 'ACTIVE' && (
            <button onClick={handleRepay} disabled={repaying} className="btn-primary flex-1 flex items-center justify-center gap-1.5 py-2 text-xs">
              {repaying ? <div className="w-3 h-3 spin rounded-full" style={{ border: '1px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : <TrendingDown size={12} />}
              Make Payment
            </button>
          )}
          <button onClick={handleExpand} className="btn-ghost flex items-center justify-center gap-1.5 py-2 text-xs flex-1">
            <Calendar size={12} />
            {expanded ? 'Hide' : 'Schedule'}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Schedule */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/[0.05]"
          >
            <div className="px-5 py-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Repayment Schedule</p>
              {loadingSched ? (
                <div className="py-4 text-center"><div className="w-5 h-5 spin rounded-full mx-auto" style={{ border: '2px solid rgba(6,182,212,0.2)', borderTopColor: '#06b6d4' }} /></div>
              ) : schedule && schedule.length > 0 ? (
                <div className="max-h-56 overflow-y-auto space-y-1">
                  {schedule.map((e) => (
                    <div
                      key={e.installmentNumber}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg text-xs"
                      style={{ background: e.status === 'PAID' ? 'rgba(52,211,153,0.05)' : e.status === 'OVERDUE' ? 'rgba(248,113,113,0.05)' : 'rgba(255,255,255,0.02)' }}
                    >
                      <span className="text-slate-600 w-4 text-right">{e.installmentNumber}</span>
                      <span className="text-slate-500 w-20">{e.dueDate}</span>
                      <span className="flex-1 num text-slate-300">${Number(e.totalPayment).toFixed(2)}</span>
                      <span className="text-slate-500 num text-[10px]">{Number(e.principal).toFixed(2)} + {Number(e.interest).toFixed(2)}</span>
                      <RepayBadge status={e.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600 py-2">No schedule available yet</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function LoansPage() {
  const push = useToastStore((s) => s.push)
  const [loans, setLoans]       = useState<Loan[]>([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [applying, setApplying] = useState(false)
  const [form, setForm] = useState({ accountId: '', amount: '', annualRatePercent: '12', termMonths: '12' })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const load = () => {
    setLoading(true)
    getMyLoans()
      .then((data) => { if (mountedRef.current) setLoans(data) })
      .catch(() => { if (mountedRef.current) push('Failed to load loans', 'error') })
      .finally(() => { if (mountedRef.current) setLoading(false) })
  }

  useEffect(load, [])

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setApplying(true)
    try {
      await applyForLoan({
        accountId: form.accountId,
        amount: parseFloat(form.amount),
        annualInterestRate: parseFloat(form.annualRatePercent) / 100,
        termMonths: parseInt(form.termMonths),
      })
      push('Loan application submitted! Awaiting admin approval.', 'success')
      setShowModal(false)
      setForm({ accountId: '', amount: '', annualRatePercent: '12', termMonths: '12' })
      load()
    } catch (err: any) {
      push(err.response?.data?.message || 'Application failed', 'error')
    } finally {
      setApplying(false)
    }
  }

  // Monthly payment preview
  const preview = (() => {
    const P = parseFloat(form.amount), r = parseFloat(form.annualRatePercent) / 100 / 12, n = parseInt(form.termMonths)
    if (!P || !n || isNaN(r)) return null
    if (r === 0) return (P / n).toFixed(2)
    const m = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    return m.toFixed(2)
  })()

  if (loading) return <LoansSkeleton />

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Loans</h1>
          <p className="text-sm text-slate-500 mt-0.5">{loans.length} loan{loans.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-ghost text-xs flex items-center gap-2"><RefreshCw size={14} /></button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Apply for Loan
          </button>
        </div>
      </div>

      {loans.length === 0 ? (
        <GlassCard className="text-center py-16">
          <CreditCard size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-medium mb-2">No loans yet</p>
          <p className="text-slate-600 text-sm mb-5">Apply for a loan to get started</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mx-auto flex items-center gap-2">
            <Plus size={16} /> Apply for Loan
          </button>
        </GlassCard>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {loans.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <LoanCard loan={l} onRefresh={load} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Apply for a Loan">
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="label">Account ID (for disbursement)</label>
            <input value={form.accountId} onChange={set('accountId')} className="input font-mono text-sm" placeholder="UUID" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Principal ($)</label>
              <input type="number" value={form.amount} onChange={set('amount')} className="input num" placeholder="10000" min="0.01" step="0.01" required />
            </div>
            <div>
              <label className="label">Annual Rate (%)</label>
              <input type="number" value={form.annualRatePercent} onChange={set('annualRatePercent')} className="input num" placeholder="12" min="0" max="100" step="0.1" required />
            </div>
          </div>
          <div>
            <label className="label">Term (months)</label>
            <input type="number" value={form.termMonths} onChange={set('termMonths')} className="input num" placeholder="12" min="1" required />
          </div>

          {preview && (
            <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
              <p className="text-xs text-slate-400">Estimated monthly payment</p>
              <p className="text-lg font-bold num text-cyan-400">${preview}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={applying} className="btn-primary flex-1">
              {applying ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
