import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Shield, Calendar, Edit3, Check, X,
  Lock, Eye, EyeOff, Wallet, CreditCard, CheckCircle2,
  AlertCircle, Loader2,
} from 'lucide-react'
import { getProfile, updateProfile, changePassword } from '../api/profile'
import { getAccounts } from '../api/accounts'
import { getMyLoans } from '../api/loans'
import { useAuthStore } from '../store/useAuthStore'
import { useToastStore } from '../store/useToastStore'
import { GlassCard } from '../components/GlassCard'
import { PageLoader } from '../components/LoadingSpinner'
import type { User as UserType } from '../types'

/* ─── Password strength ─────────────────────────────────── */
function passwordStrength(p: string): { score: number; label: string; color: string } {
  if (!p) return { score: 0, label: '', color: '' }
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' }
  if (score === 2) return { score, label: 'Fair', color: '#f59e0b' }
  if (score === 3) return { score, label: 'Good', color: '#06b6d4' }
  return { score, label: 'Strong', color: '#10b981' }
}

/* ─── Avatar ─────────────────────────────────────────────── */
function Avatar({ firstName, lastName, size = 'lg' }: { firstName: string; lastName: string; size?: 'sm' | 'lg' }) {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
  const dim = size === 'lg' ? 'w-24 h-24 text-3xl' : 'w-10 h-10 text-sm'
  return (
    <div className={`relative ${dim} rounded-2xl flex items-center justify-center font-bold flex-shrink-0`}
      style={{
        background: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(168,85,247,0.25))',
        border: '1px solid rgba(6,182,212,0.3)',
        boxShadow: '0 0 40px rgba(6,182,212,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <span style={{ background: 'linear-gradient(135deg, #06b6d4, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {initials}
      </span>
      {size === 'lg' && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(168,85,247,0.1))' }}
        />
      )}
    </div>
  )
}

/* ─── Stat chip ──────────────────────────────────────────── */
function StatChip({ icon: Icon, label, value, color }: { icon: typeof Wallet; label: string; value: string | number; color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className="flex-1 rounded-2xl p-4 flex flex-col items-center gap-1 min-w-[100px]"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-1"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={15} style={{ color }} />
      </div>
      <p className="text-lg font-bold num text-white">{value}</p>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
    </motion.div>
  )
}

/* ─── Main page ──────────────────────────────────────────── */
export function ProfilePage() {
  const { setName } = useAuthStore()
  const push = useToastStore((s) => s.push)

  const [profile, setProfile]   = useState<UserType | null>(null)
  const [loading, setLoading]   = useState(true)
  const [accCount, setAccCount] = useState(0)
  const [loanCount, setLoanCount] = useState(0)

  /* Edit name */
  const [editing, setEditing]   = useState(false)
  const [editFirst, setEditFirst] = useState('')
  const [editLast, setEditLast]   = useState('')
  const [saving, setSaving]       = useState(false)

  /* Change password */
  const [curPass, setCurPass]   = useState('')
  const [newPass, setNewPass]   = useState('')
  const [confPass, setConfPass] = useState('')
  const [showCur, setShowCur]   = useState(false)
  const [showNew, setShowNew]   = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [passSuccess, setPassSuccess] = useState(false)

  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    // Profile is required; stats are best-effort
    getProfile()
      .then((prof) => {
        if (!mounted.current) return
        setProfile(prof)
        // Load stats independently — don't block profile on failure
        Promise.all([
          getAccounts().catch(() => []),
          getMyLoans().catch(() => []),
        ]).then(([accs, loans]) => {
          if (!mounted.current) return
          setAccCount((accs as typeof accs).filter((a) => a.status === 'ACTIVE').length)
          setLoanCount((loans as typeof loans).filter((l) => l.status === 'ACTIVE').length)
        })
      })
      .catch((err) => {
        if (!mounted.current) return
        const msg = err?.response?.data?.message || err?.message || 'Failed to load profile'
        push(msg, 'error')
      })
      .finally(() => { if (mounted.current) setLoading(false) })
    return () => { mounted.current = false }
  }, [])

  const startEdit = () => {
    setEditFirst(profile?.firstName ?? '')
    setEditLast(profile?.lastName ?? '')
    setEditing(true)
  }

  const cancelEdit = () => setEditing(false)

  const handleSaveName = async () => {
    if (!editFirst.trim() || !editLast.trim()) return
    setSaving(true)
    try {
      const updated = await updateProfile(editFirst.trim(), editLast.trim())
      setProfile(updated)
      setName(updated.firstName, updated.lastName)
      setEditing(false)
      push('Profile updated', 'success')
    } catch (err: any) {
      push(err.response?.data?.message || 'Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confPass) { push('Passwords do not match', 'error'); return }
    if (newPass.length < 6)   { push('Password must be at least 6 characters', 'error'); return }
    setPassLoading(true)
    try {
      await changePassword(curPass, newPass)
      setPassSuccess(true)
      setCurPass(''); setNewPass(''); setConfPass('')
      push('Password changed successfully', 'success')
      setTimeout(() => setPassSuccess(false), 3000)
    } catch (err: any) {
      push(err.response?.data?.message || 'Failed to change password', 'error')
    } finally {
      setPassLoading(false)
    }
  }

  if (loading) return <PageLoader />
  if (!profile) return null

  const strength = passwordStrength(newPass)
  const memberSince = new Date(profile.createdAt).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })
  const initials = `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your personal information and security</p>
      </motion.div>

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="relative rounded-2xl overflow-hidden"
          style={{ background: 'rgba(6,6,20,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Gradient banner */}
          <div className="h-28 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(168,85,247,0.12) 50%, rgba(59,130,246,0.1) 100%)' }}>
            {/* Animated orbs */}
            <motion.div className="absolute w-48 h-48 rounded-full"
              animate={{ x: [0, 30, 0], y: [0, -15, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ top: '-60px', left: '10%', background: 'radial-gradient(circle, rgba(6,182,212,0.2), transparent 70%)' }}
            />
            <motion.div className="absolute w-64 h-64 rounded-full"
              animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              style={{ top: '-80px', right: '5%', background: 'radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)' }}
            />
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
            />
          </div>

          {/* Profile content */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-5 -mt-12 mb-5">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}>
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center font-bold text-3xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(6,6,20,0.9), rgba(6,6,20,0.95))',
                      border: '3px solid rgba(6,6,20,0.9)',
                      boxShadow: '0 0 0 1px rgba(6,182,212,0.3), 0 0 40px rgba(6,182,212,0.15)',
                    }}
                  >
                    <span style={{ background: 'linear-gradient(135deg, #06b6d4, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {initials}
                    </span>
                    <motion.div className="absolute inset-0 rounded-2xl pointer-events-none"
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(168,85,247,0.08))' }}
                    />
                  </div>
                  {/* Online dot */}
                  <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2"
                    style={{ borderColor: 'rgba(6,6,20,0.95)', boxShadow: '0 0 8px rgba(52,211,153,0.6)' }}
                  />
                </div>
              </motion.div>

              <div className="pb-1 flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  {editing ? (
                    <motion.div key="edit" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-2">
                      <input value={editFirst} onChange={(e) => setEditFirst(e.target.value)}
                        className="input py-1 text-sm w-28" placeholder="First" autoFocus />
                      <input value={editLast} onChange={(e) => setEditLast(e.target.value)}
                        className="input py-1 text-sm w-28" placeholder="Last" />
                      <button onClick={handleSaveName} disabled={saving}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
                        {saving ? <Loader2 size={14} className="text-emerald-400 spin" /> : <Check size={14} className="text-emerald-400" />}
                      </button>
                      <button onClick={cancelEdit}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
                        <X size={14} className="text-red-400" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="view" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-white truncate">
                        {profile.firstName} {profile.lastName}
                      </h2>
                      <button onClick={startEdit}
                        className="w-7 h-7 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Edit3 size={12} className="text-slate-300" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    style={profile.role === 'ADMIN'
                      ? { background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.25)', color: '#fb923c' }
                      : { background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', color: '#06b6d4' }}>
                    {profile.role}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar size={10} /> Member since {memberSince}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex gap-3">
              <StatChip icon={Wallet}     label="Active Accs"  value={accCount}   color="#06b6d4" />
              <StatChip icon={CreditCard} label="Active Loans" value={loanCount}   color="#a855f7" />
              <StatChip icon={Shield}     label="Security"     value="Secured"     color="#10b981" />
              <StatChip icon={User}       label="Status"       value={profile.active ? 'Active' : 'Inactive'} color={profile.active ? '#10b981' : '#ef4444'} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Two-column: personal info + security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Personal info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard glow="cyan" className="h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <User size={16} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Personal Information</p>
                <p className="text-xs text-slate-500">Your account details</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: 'First Name', value: profile.firstName, icon: User },
                { label: 'Last Name',  value: profile.lastName,  icon: User },
                { label: 'Email',      value: profile.email,     icon: Mail },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label}>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Icon size={10} /> {label}
                  </label>
                  <div className="rounded-xl px-3.5 py-2.5 text-sm text-slate-200"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {value}
                  </div>
                </div>
              ))}

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Shield size={10} /> Role
                </label>
                <div className="rounded-xl px-3.5 py-2.5 flex items-center justify-between"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-sm text-slate-200">{profile.role}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={profile.role === 'ADMIN'
                      ? { background: 'rgba(251,146,60,0.1)', color: '#fb923c' }
                      : { background: 'rgba(6,182,212,0.1)', color: '#06b6d4' }}>
                    {profile.role === 'ADMIN' ? 'Full Access' : 'Standard'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar size={10} /> Member Since
                </label>
                <div className="rounded-xl px-3.5 py-2.5 text-sm text-slate-200"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {memberSince}
                </div>
              </div>
            </div>

            <button onClick={startEdit}
              className="btn-ghost w-full flex items-center justify-center gap-2 text-sm mt-6">
              <Edit3 size={14} /> Edit Name
            </button>
          </GlassCard>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard glow="purple" className="h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <Lock size={16} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Security</p>
                <p className="text-xs text-slate-500">Update your password</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {passSuccess ? (
                <motion.div key="success"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-10 gap-3">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
                    <CheckCircle2 size={48} className="text-emerald-400" />
                  </motion.div>
                  <p className="text-emerald-400 font-semibold">Password changed!</p>
                  <p className="text-xs text-slate-500">Your account is now secured with the new password</p>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleChangePassword} className="space-y-4"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                  {/* Current password */}
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 block">Current Password</label>
                    <div className="relative">
                      <input type={showCur ? 'text' : 'password'} value={curPass}
                        onChange={(e) => setCurPass(e.target.value)} className="input pr-10" placeholder="••••••••" required />
                      <button type="button" onClick={() => setShowCur(!showCur)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showCur ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* New password */}
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 block">New Password</label>
                    <div className="relative">
                      <input type={showNew ? 'text' : 'password'} value={newPass}
                        onChange={(e) => setNewPass(e.target.value)} className="input pr-10" placeholder="••••••••" required />
                      <button type="button" onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {/* Strength bar */}
                    <AnimatePresence>
                      {newPass && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="mt-2 overflow-hidden">
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4].map((i) => (
                              <motion.div key={i} className="h-1 flex-1 rounded-full"
                                animate={{ backgroundColor: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)' }}
                                transition={{ duration: 0.3 }}
                              />
                            ))}
                          </div>
                          <p className="text-[10px]" style={{ color: strength.color }}>{strength.label}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 block">Confirm New Password</label>
                    <div className="relative">
                      <input type={showConf ? 'text' : 'password'} value={confPass}
                        onChange={(e) => setConfPass(e.target.value)} className="input pr-10" placeholder="••••••••" required />
                      <button type="button" onClick={() => setShowConf(!showConf)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {/* Match indicator */}
                    <AnimatePresence>
                      {confPass && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="mt-1.5 flex items-center gap-1.5">
                          {newPass === confPass
                            ? <><CheckCircle2 size={11} className="text-emerald-400" /><span className="text-[10px] text-emerald-400">Passwords match</span></>
                            : <><AlertCircle size={11} className="text-red-400" /><span className="text-[10px] text-red-400">Passwords do not match</span></>
                          }
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button type="submit" disabled={passLoading || newPass !== confPass}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
                    style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.8), rgba(6,182,212,0.7))' }}>
                    {passLoading
                      ? <><Loader2 size={15} className="spin" /><span>Updating…</span></>
                      : <><Lock size={15} /><span>Change Password</span></>
                    }
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
