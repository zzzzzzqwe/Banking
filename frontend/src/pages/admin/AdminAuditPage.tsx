import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ScrollText, ChevronLeft, ChevronRight, Filter, RefreshCw, X,
} from 'lucide-react'
import { getAuditLog, getAuditActions } from '../../api/admin'
import { GlassCard } from '../../components/GlassCard'
import { PageLoader } from '../../components/LoadingSpinner'
import { useToastStore } from '../../store/useToastStore'
import type { AuditLogEntry, Page } from '../../types'

const ACTION_COLORS: Record<string, string> = {
  LOGIN: '#06b6d4',
  REGISTER: '#06b6d4',
  CARD_CREATED: '#a855f7',
  CARD_CLOSED: '#64748b',
  CARD_DEPOSIT: '#34d399',
  CARD_WITHDRAW: '#f87171',
  DAILY_LIMIT_SET: '#f59e0b',
  TRANSFER: '#3b82f6',
  EXCHANGE: '#8b5cf6',
  LOAN_APPLIED: '#f59e0b',
  LOAN_APPROVED: '#34d399',
  LOAN_REJECTED: '#f87171',
  LOAN_REPAYMENT: '#06b6d4',
  CARD_BLOCK_REQUESTED: '#f59e0b',
  CARD_UNBLOCK_REQUESTED: '#f59e0b',
  CARD_BLOCK_APPROVED: '#34d399',
  CARD_BLOCK_REJECTED: '#f87171',
  CARD_UNBLOCK_APPROVED: '#34d399',
  CARD_UNBLOCK_REJECTED: '#f87171',
  SAVINGS_GOAL_CREATED: '#a855f7',
  SAVINGS_GOAL_DEPOSIT: '#34d399',
  SAVINGS_GOAL_WITHDRAW: '#f87171',
  PROFILE_UPDATED: '#64748b',
  PASSWORD_CHANGED: '#f59e0b',
  USER_DEACTIVATED: '#ef4444',
}

function ActionBadge({ action }: { action: string }) {
  const color = ACTION_COLORS[action] ?? '#94a3b8'
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide"
      style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
    >
      {action}
    </span>
  )
}

function Pagination({ data, page, onPage }: { data: Page<any>; page: number; onPage: (p: number) => void }) {
  if (data.totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-white/[0.04]">
      <p className="text-xs text-slate-600">{data.totalElements} entries</p>
      <div className="flex items-center gap-2">
        <button onClick={() => onPage(page - 1)} disabled={data.first} className="p-1.5 rounded-lg hover:bg-white/[0.05] disabled:opacity-30 text-slate-400 hover:text-slate-200 transition-colors"><ChevronLeft size={14} /></button>
        <span className="text-xs text-slate-500 px-2">{page + 1} / {data.totalPages}</span>
        <button onClick={() => onPage(page + 1)} disabled={data.last} className="p-1.5 rounded-lg hover:bg-white/[0.05] disabled:opacity-30 text-slate-400 hover:text-slate-200 transition-colors"><ChevronRight size={14} /></button>
      </div>
    </div>
  )
}

export function AdminAuditPage() {
  const push = useToastStore((s) => s.push)
  const [data, setData] = useState<Page<AuditLogEntry> | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actions, setActions] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const [filterAction, setFilterAction] = useState('')
  const [filterUser, setFilterUser] = useState('')

  const load = async (p = 0) => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filterAction) params.action = filterAction
      if (filterUser) params.userId = filterUser
      setData(await getAuditLog(p, 30, params))
      setPage(p)
    } catch {
      push('Failed to load audit log', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    getAuditActions().then(setActions).catch(() => {})
  }, [])

  const applyFilters = () => { load(0) }
  const clearFilters = () => {
    setFilterAction('')
    setFilterUser('')
    setTimeout(() => load(0), 0)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}>
            <ScrollText size={18} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Audit Log</h1>
            <p className="text-xs text-slate-500">System activity history</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className="btn-ghost flex items-center gap-2 text-xs">
            <Filter size={14} /> Filters
          </button>
          <button onClick={() => load(page)} disabled={loading}
            className="btn-ghost flex items-center gap-2 text-xs">
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
          <GlassCard>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Action</label>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="input-field text-xs w-52"
                >
                  <option value="">All actions</option>
                  {actions.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">User ID</label>
                <input
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  placeholder="UUID..."
                  className="input-field text-xs w-64"
                />
              </div>
              <button onClick={applyFilters}
                className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
                style={{ background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.25)', color: '#fb923c' }}>
                Apply
              </button>
              {(filterAction || filterUser) && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition-colors">
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Table */}
      {loading ? <PageLoader /> : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard padding={false}>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Details</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.content.map((entry, i) => (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.015 }}
                    >
                      <td className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="text-xs text-slate-400 max-w-[140px] truncate" title={entry.userId ?? ''}>
                        {entry.userEmail}
                      </td>
                      <td><ActionBadge action={entry.action} /></td>
                      <td className="text-xs text-slate-500">
                        {entry.entityType && (
                          <span className="text-slate-400">{entry.entityType}</span>
                        )}
                        {entry.entityId && (
                          <span className="text-slate-600 font-mono ml-1">{entry.entityId.slice(0, 8)}…</span>
                        )}
                      </td>
                      <td className="text-xs text-slate-500 max-w-[200px] truncate" title={entry.details ?? ''}>
                        {entry.details || '—'}
                      </td>
                      <td className="text-xs text-slate-600 font-mono">{entry.ipAddress || '—'}</td>
                    </motion.tr>
                  ))}
                  {data?.content.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-slate-600 py-10">No audit entries yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {data && <Pagination data={data} page={page} onPage={load} />}
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
