import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight,
  Clock, Lock, Unlock, CreditCard,
} from 'lucide-react'
import {
  getAllLoans, approveLoan, rejectLoan,
  getAllCardRequests, approveCardRequest, rejectCardRequest,
} from '../../api/admin'
import { GlassCard } from '../../components/GlassCard'
import { PageLoader } from '../../components/LoadingSpinner'
import { useToastStore } from '../../store/useToastStore'
import type { Loan, CardRequest, Page } from '../../types'

type Tab = 'loans' | 'cards'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'badge-pending', ACTIVE: 'badge-active', APPROVED: 'badge-active',
    REJECTED: 'badge-rejected', CLOSED: 'badge-closed',
  }
  return <span className={map[status] || 'badge'}>{status}</span>
}

/* ── Pagination ── */
function Pagination({ data, page, onPage }: { data: Page<any>; page: number; onPage: (p: number) => void }) {
  if (data.totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-white/[0.04]">
      <p className="text-xs text-slate-600">{data.totalElements} items</p>
      <div className="flex items-center gap-2">
        <button onClick={() => onPage(page - 1)} disabled={data.first} className="p-1.5 rounded-lg hover:bg-white/[0.05] disabled:opacity-30 text-slate-400 hover:text-slate-200 transition-colors"><ChevronLeft size={14} /></button>
        <span className="text-xs text-slate-500 px-2">{page + 1} / {data.totalPages}</span>
        <button onClick={() => onPage(page + 1)} disabled={data.last} className="p-1.5 rounded-lg hover:bg-white/[0.05] disabled:opacity-30 text-slate-400 hover:text-slate-200 transition-colors"><ChevronRight size={14} /></button>
      </div>
    </div>
  )
}

/* ── Action buttons (shared) ── */
function ActionButtons({ isPending, actionId, itemId, onApprove, onReject }: {
  isPending: boolean; actionId: string | null; itemId: string
  onApprove: () => void; onReject: () => void
}) {
  if (!isPending) return null
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={onApprove} disabled={actionId === itemId}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
        style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(52,211,153,0.15)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(52,211,153,0.08)' }}
      >
        {actionId === itemId
          ? <div className="w-3 h-3 spin rounded-full" style={{ border: '1px solid rgba(52,211,153,0.3)', borderTopColor: '#34d399' }} />
          : <CheckCircle size={12} />}
        Approve
      </button>
      <button
        onClick={onReject} disabled={actionId === itemId}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
        style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)' }}
      >
        <XCircle size={12} /> Reject
      </button>
    </div>
  )
}

/* ═══════════════════════  Loans Tab  ═══════════════════════ */

function LoansTab() {
  const push = useToastStore((s) => s.push)
  const [data, setData]         = useState<Page<Loan> | null>(null)
  const [page, setPage]         = useState(0)
  const [loading, setLoading]   = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const load = async (p = 0) => {
    setLoading(true)
    try { setData(await getAllLoans(p, 15)); setPage(p) }
    catch { push('Failed to load loans', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (loan: Loan) => {
    if (!confirm(`Approve loan ${loan.id.slice(0, 8)}…?\n\n$${loan.principalAmount} will be credited to the account.`)) return
    setActionId(loan.id)
    try { await approveLoan(loan.id); push('Loan approved — funds disbursed!', 'success'); load(page) }
    catch (err: any) { push(err.response?.data?.message || 'Approval failed', 'error') }
    finally { setActionId(null) }
  }

  const handleReject = async (loan: Loan) => {
    if (!confirm(`Reject loan ${loan.id.slice(0, 8)}…?`)) return
    setActionId(loan.id)
    try { await rejectLoan(loan.id); push('Loan rejected', 'success'); load(page) }
    catch (err: any) { push(err.response?.data?.message || 'Rejection failed', 'error') }
    finally { setActionId(null) }
  }

  if (loading) return <PageLoader />

  return (
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
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={l.status === 'PENDING' ? 'bg-amber-500/[0.02]' : ''}
                >
                  <td className="font-mono text-xs text-slate-500">{l.id.slice(0, 12)}…</td>
                  <td className="font-mono text-xs text-slate-500">{l.borrowerId.slice(0, 10)}…</td>
                  <td className="num font-semibold text-white">${Number(l.principalAmount).toLocaleString()}</td>
                  <td className="text-amber-400 num">{(Number(l.annualInterestRate) * 100).toFixed(1)}%</td>
                  <td className="text-slate-400">{l.termMonths} mo.</td>
                  <td className="num text-cyan-400">{l.monthlyPayment ? `$${Number(l.monthlyPayment).toFixed(2)}` : '—'}</td>
                  <td><StatusBadge status={l.status} /></td>
                  <td className="text-xs text-slate-500">{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td>
                    <ActionButtons
                      isPending={l.status === 'PENDING'} actionId={actionId} itemId={l.id}
                      onApprove={() => handleApprove(l)} onReject={() => handleReject(l)}
                    />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && <Pagination data={data} page={page} onPage={load} />}
      </GlassCard>
    </motion.div>
  )
}

/* ═══════════════════════  Card Requests Tab  ═══════════════════════ */

function CardRequestsTab() {
  const push = useToastStore((s) => s.push)
  const [data, setData]         = useState<Page<CardRequest> | null>(null)
  const [page, setPage]         = useState(0)
  const [loading, setLoading]   = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const load = async (p = 0) => {
    setLoading(true)
    try { setData(await getAllCardRequests(p, 15)); setPage(p) }
    catch { push('Failed to load card requests', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (r: CardRequest) => {
    const action = r.requestType === 'BLOCK' ? 'block' : 'unblock'
    if (!confirm(`Approve ${action} request for card ${r.cardNumber || r.accountId.slice(0, 8)}…?`)) return
    setActionId(r.id)
    try { await approveCardRequest(r.id); push(`Card ${action} approved`, 'success'); load(page) }
    catch (err: any) { push(err.response?.data?.message || 'Approval failed', 'error') }
    finally { setActionId(null) }
  }

  const handleReject = async (r: CardRequest) => {
    if (!confirm(`Reject request ${r.id.slice(0, 8)}…?`)) return
    setActionId(r.id)
    try { await rejectCardRequest(r.id); push('Request rejected', 'success'); load(page) }
    catch (err: any) { push(err.response?.data?.message || 'Rejection failed', 'error') }
    finally { setActionId(null) }
  }

  if (loading) return <PageLoader />

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard padding={false}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Card</th>
                <th>Holder</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created</th>
                <th>Resolved</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.content.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={r.status === 'PENDING' ? 'bg-amber-500/[0.02]' : ''}
                >
                  <td className="font-mono text-xs text-slate-500">{r.id.slice(0, 12)}…</td>
                  <td className="font-mono text-xs text-slate-400">{r.cardNumber || r.accountId.slice(0, 12) + '…'}</td>
                  <td className="text-xs text-slate-400">{r.holderName || '—'}</td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium"
                      style={{ color: r.requestType === 'BLOCK' ? '#f87171' : '#34d399' }}>
                      {r.requestType === 'BLOCK' ? <Lock size={11} /> : <Unlock size={11} />}
                      {r.requestType}
                    </span>
                  </td>
                  <td><StatusBadge status={r.status} /></td>
                  <td className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="text-xs text-slate-500">{r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <ActionButtons
                      isPending={r.status === 'PENDING'} actionId={actionId} itemId={r.id}
                      onApprove={() => handleApprove(r)} onReject={() => handleReject(r)}
                    />
                  </td>
                </motion.tr>
              ))}
              {data?.content.length === 0 && (
                <tr><td colSpan={8} className="text-center text-slate-600 py-10">No card requests yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {data && <Pagination data={data} page={page} onPage={load} />}
      </GlassCard>
    </motion.div>
  )
}

/* ═══════════════════════  Main Page  ═══════════════════════ */

const TABS: { key: Tab; label: string; icon: typeof ShieldCheck }[] = [
  { key: 'loans', label: 'Loans', icon: ShieldCheck },
  { key: 'cards', label: 'Card Requests', icon: CreditCard },
]

export function AdminRequestsPage() {
  const [tab, setTab] = useState<Tab>('loans')

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}>
            <ShieldCheck size={18} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Request Management</h1>
            <p className="text-xs text-slate-500">Approve or reject user requests</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl glass" style={{ width: 'fit-content' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200"
            style={tab === key
              ? { background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.25)', color: '#fb923c' }
              : { background: 'transparent', border: '1px solid transparent', color: '#64748b' }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'loans' && <LoansTab />}
      {tab === 'cards' && <CardRequestsTab />}
    </div>
  )
}
