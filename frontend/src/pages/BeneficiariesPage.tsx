import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Star, StarOff, Trash2, CreditCard } from 'lucide-react'
import { GlassCard } from '../components/GlassCard'
import { Modal } from '../components/Modal'
import { PageLoader } from '../components/LoadingSpinner'
import { getBeneficiaries, createBeneficiary, deleteBeneficiary, updateBeneficiary } from '../api/beneficiaries'
import { useToastStore } from '../store/useToastStore'
import type { Beneficiary } from '../types'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'RUB', 'KZT', 'JPY', 'CNY']

export function BeneficiariesPage() {
  const push = useToastStore((s) => s.push)
  const [items, setItems] = useState<Beneficiary[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    nickname: '',
    accountNumber: '',
    holderName: '',
    currency: 'USD',
    favorite: false,
  })

  const load = async () => {
    setLoading(true)
    try { setItems(await getBeneficiaries()) }
    catch { push('Failed to load beneficiaries', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.nickname || !form.accountNumber) { push('Fill required fields', 'warning'); return }
    try {
      await createBeneficiary(form)
      push('Beneficiary added', 'success')
      setCreateOpen(false)
      setForm({ nickname: '', accountNumber: '', holderName: '', currency: 'USD', favorite: false })
      load()
    } catch (e: any) {
      push(e.response?.data?.message || 'Failed', 'error')
    }
  }

  const handleDelete = async (b: Beneficiary) => {
    if (!confirm(`Remove ${b.nickname}?`)) return
    try { await deleteBeneficiary(b.id); load(); push('Removed', 'success') } catch { push('Failed', 'error') }
  }

  const toggleFavorite = async (b: Beneficiary) => {
    try { await updateBeneficiary(b.id, { favorite: !b.favorite }); load() } catch { push('Failed', 'error') }
  }

  if (loading) return <PageLoader />

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Beneficiaries</h1>
          <p className="text-sm text-slate-500 mt-0.5">Saved recipients for quick transfers</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Beneficiary
        </button>
      </div>

      {items.length === 0 ? (
        <GlassCard className="text-center py-16">
          <Users size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No saved beneficiaries</p>
          <p className="text-slate-600 text-sm mt-1">Add one to speed up future transfers</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((b) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)' }}
                    >
                      <CreditCard size={16} className="text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{b.nickname}</p>
                      {b.holderName && <p className="text-xs text-slate-500">{b.holderName}</p>}
                    </div>
                  </div>
                  <button onClick={() => toggleFavorite(b)} className="text-slate-600 hover:text-amber-400 transition-colors">
                    {b.favorite ? <Star size={14} className="text-amber-400" fill="currentColor" /> : <StarOff size={14} />}
                  </button>
                </div>

                <div className="space-y-1.5 text-xs mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Card</span>
                    <span className="font-mono text-slate-300 truncate ml-2 text-right">{b.accountNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Currency</span>
                    <span className="text-cyan-400 font-mono">{b.currency}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                  <span className="text-[10px] text-slate-600">
                    {b.lastUsedAt ? `Used ${new Date(b.lastUsedAt).toLocaleDateString()}` : 'Never used'}
                  </span>
                  <button onClick={() => handleDelete(b)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Beneficiary">
        <div className="space-y-3">
          <div>
            <label className="label">Nickname *</label>
            <input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="Mom, Roommate, …" className="input w-full" />
          </div>
          <div>
            <label className="label">Card Number *</label>
            <input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} placeholder="XXXX XXXX XXXX XXXX" className="input w-full font-mono" maxLength={19} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Holder Name</label>
              <input value={form.holderName} onChange={(e) => setForm({ ...form, holderName: e.target.value })} placeholder="JOHN DOE" className="input w-full" />
            </div>
            <div>
              <label className="label">Currency</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="input w-full">
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input type="checkbox" checked={form.favorite} onChange={(e) => setForm({ ...form, favorite: e.target.checked })} />
            Mark as favorite
          </label>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setCreateOpen(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleCreate} className="btn-primary flex-1">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
