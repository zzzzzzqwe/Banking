import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, UserX, ChevronLeft, ChevronRight, RefreshCw, Shield } from 'lucide-react'
import { getUsers, deactivateUser } from '../../api/admin'
import { GlassCard } from '../../components/GlassCard'
import { PageLoader } from '../../components/LoadingSpinner'
import { useToastStore } from '../../store/useToastStore'
import type { User, Page } from '../../types'

export function AdminUsersPage() {
  const push = useToastStore((s) => s.push)
  const [data, setData]       = useState<Page<User> | null>(null)
  const [page, setPage]       = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [deactivating, setDeactivating] = useState<string | null>(null)

  const load = async (p = 0) => {
    setLoading(true)
    try {
      const res = await getUsers(p, 15)
      setData(res)
      setPage(p)
    } catch {
      push('Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDeactivate = async (user: User) => {
    if (!confirm(`Deactivate ${user.email}? They will not be able to log in.`)) return
    setDeactivating(user.id)
    try {
      await deactivateUser(user.id)
      push(`${user.email} deactivated`, 'success')
      load(page)
    } catch (err: any) {
      push(err.response?.data?.message || 'Failed to deactivate', 'error')
    } finally {
      setDeactivating(null)
    }
  }

  const filtered = data?.content.filter((u) =>
    !search || u.email.includes(search) || u.firstName.includes(search) || u.lastName.includes(search)
  ) ?? []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}>
            <Users size={18} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Users</h1>
            <p className="text-xs text-slate-500">{data?.totalElements ?? 0} total users</p>
          </div>
        </div>
        <button onClick={() => load(page)} className="btn-ghost text-xs flex items-center gap-2"><RefreshCw size={14} /></button>
      </div>

      {/* Filter bar */}
      <GlassCard padding={false}>
        <div className="flex items-center gap-3 px-4 py-3">
          <Search size={14} className="text-slate-500 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-300 placeholder-slate-600"
            placeholder="Filter by name or email…"
          />
          {data && (
            <span className="text-xs text-slate-600 whitespace-nowrap">
              Page {page + 1}/{data.totalPages}
            </span>
          )}
        </div>
      </GlassCard>

      {loading ? <PageLoader /> : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard padding={false}>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold flex-shrink-0"
                            style={{ background: u.role === 'ADMIN' ? 'rgba(251,146,60,0.12)' : 'rgba(6,182,212,0.1)', color: u.role === 'ADMIN' ? '#fb923c' : '#06b6d4' }}
                          >
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-slate-200 text-sm">{u.firstName} {u.lastName}</p>
                            <p className="text-xs font-mono text-slate-600">{u.id.slice(0, 10)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-400 text-sm">{u.email}</td>
                      <td>
                        <span className={u.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}>
                          {u.role === 'ADMIN' && <Shield size={10} className="mr-1" />}
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={u.active ? 'badge-active' : 'badge-inactive'}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="text-right">
                        {u.active && u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeactivate(u)}
                            disabled={deactivating === u.id}
                            className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1.5 ml-auto"
                          >
                            {deactivating === u.id ? <div className="w-3 h-3 spin rounded-full" style={{ border: '1px solid rgba(248,113,113,0.3)', borderTopColor: '#f87171' }} /> : <UserX size={12} />}
                            Deactivate
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-white/[0.04]">
                <p className="text-xs text-slate-600">{data.totalElements} users</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => load(page - 1)} disabled={data.first} className="p-1.5 rounded-lg hover:bg-white/[0.05] disabled:opacity-30 text-slate-400 hover:text-slate-200 transition-colors">
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs text-slate-500 px-2">{page + 1} / {data.totalPages}</span>
                  <button onClick={() => load(page + 1)} disabled={data.last} className="p-1.5 rounded-lg hover:bg-white/[0.05] disabled:opacity-30 text-slate-400 hover:text-slate-200 transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
