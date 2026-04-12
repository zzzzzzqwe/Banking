import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, ArrowUp, ArrowDown, X, RefreshCw,
  CreditCard, Shield, Crown, Gem, Check, ArrowRight, ArrowLeft, Wallet
} from 'lucide-react'
import { getAccounts, createAccount, deposit, withdraw, closeAccount } from '../api/accounts'
import { getSupportedCurrencies } from '../api/exchange'
import { GlassCard } from '../components/GlassCard'
import { AccountsSkeleton } from '../components/Skeleton'
import { Modal } from '../components/Modal'
import { useToastStore } from '../store/useToastStore'
import type { Account, CardNetwork, CardTier } from '../types'

/* ──────────────────── Card Design Config ──────────────────── */

const CARD_DESIGNS: Record<string, {
  bg: string
  accent: string
  glow: string
  border: string
  logoColor: string
  chipColor: string
}> = {
  'VISA-STANDARD': {
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)',
    accent: 'rgba(56,189,248,0.15)',
    glow: 'rgba(56,189,248,0.08)',
    border: 'rgba(56,189,248,0.2)',
    logoColor: '#38bdf8',
    chipColor: 'rgba(56,189,248,0.3)',
  },
  'VISA-PREMIUM': {
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
    accent: 'rgba(99,102,241,0.2)',
    glow: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.3)',
    logoColor: '#818cf8',
    chipColor: 'rgba(129,140,248,0.3)',
  },
  'VISA-DELUXE': {
    bg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 40%, #44318d 100%)',
    accent: 'rgba(196,181,253,0.2)',
    glow: 'rgba(167,139,250,0.15)',
    border: 'rgba(167,139,250,0.35)',
    logoColor: '#c4b5fd',
    chipColor: 'rgba(196,181,253,0.35)',
  },
  'MASTERCARD-STANDARD': {
    bg: 'linear-gradient(135deg, #1c1917 0%, #292524 40%, #44403c 100%)',
    accent: 'rgba(251,146,60,0.15)',
    glow: 'rgba(251,146,60,0.08)',
    border: 'rgba(251,146,60,0.2)',
    logoColor: '#fb923c',
    chipColor: 'rgba(251,146,60,0.3)',
  },
  'MASTERCARD-PREMIUM': {
    bg: 'linear-gradient(135deg, #1a0a0a 0%, #3b0d0d 40%, #7f1d1d 100%)',
    accent: 'rgba(248,113,113,0.2)',
    glow: 'rgba(248,113,113,0.12)',
    border: 'rgba(248,113,113,0.3)',
    logoColor: '#fca5a5',
    chipColor: 'rgba(252,165,165,0.3)',
  },
  'MASTERCARD-DELUXE': {
    bg: 'linear-gradient(135deg, #1a0f00 0%, #451a03 40%, #78350f 100%)',
    accent: 'rgba(251,191,36,0.2)',
    glow: 'rgba(245,158,11,0.15)',
    border: 'rgba(245,158,11,0.35)',
    logoColor: '#fbbf24',
    chipColor: 'rgba(251,191,36,0.35)',
  },
}

const TIER_BENEFITS: Record<CardTier, { icon: typeof Shield; label: string; color: string; benefits: string[] }> = {
  STANDARD: {
    icon: Shield,
    label: 'Standard',
    color: '#38bdf8',
    benefits: [
      'Free basic transfers',
      'Up to 3 active accounts',
      'Standard exchange rates',
      'Email notifications',
      'Transaction categorization',
    ],
  },
  PREMIUM: {
    icon: Crown,
    label: 'Premium',
    color: '#a78bfa',
    benefits: [
      'Zero-fee international transfers',
      'Up to 10 active accounts',
      'Preferred exchange rates (+0.2%)',
      'Priority email & chat support',
      'Advanced analytics dashboard',
      'Custom categories',
    ],
  },
  DELUXE: {
    icon: Gem,
    label: 'Deluxe',
    color: '#fbbf24',
    benefits: [
      'Unlimited free transfers worldwide',
      'Unlimited accounts',
      'Best exchange rates (+0.5%)',
      '24/7 priority phone & chat support',
      'Full analytics with AI insights',
      'Cashback up to 2%',
      'Airport lounge access',
      'Exclusive partner offers',
    ],
  },
}

function getDesign(network: string | null, tier: string | null) {
  const key = `${network || 'VISA'}-${tier || 'STANDARD'}`
  return CARD_DESIGNS[key] || CARD_DESIGNS['VISA-STANDARD']
}

/* ──────────────────── Visa / Mastercard Logos ──────────────────── */

function VisaLogo({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <svg viewBox="0 0 780 500" width={size * 1.56} height={size} fill="none">
      <path
        d="M293.2 348.7l33.4-195.7h53.4l-33.4 195.7h-53.4zm246.8-190.9c-10.6-4-27.2-8.3-47.9-8.3-52.8 0-90 26.6-90.2 64.7-.3 28.2 26.5 43.9 46.7 53.3 20.8 9.6 27.8 15.8 27.7 24.4-.1 13.2-16.6 19.2-31.9 19.2-21.4 0-32.7-3-50.3-10.2l-6.9-3.1-7.5 43.8c12.5 5.5 35.6 10.2 59.6 10.5 56.1 0 92.6-26.3 93-67.1.2-22.3-14-39.4-44.8-53.4-18.6-9.1-30.1-15.2-30-24.4 0-8.2 9.7-16.9 30.6-16.9 17.5-.3 30.1 3.5 40 7.5l4.8 2.3 7.2-42.3h.3zm130.5-4.8h-41.3c-12.8 0-22.4 3.5-28 16.3l-79.5 179.4h56.2s9.2-24.1 11.3-29.4c6.1 0 60.8.1 68.6.1 1.6 6.9 6.5 29.3 6.5 29.3h49.6l-43.4-195.7zm-66 126.3c4.4-11.3 21.4-54.8 21.4-54.8-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47 12.5 56.6h-44.6zm-396.7-126.3l-52.4 133.4-5.6-27.1c-9.7-31.2-40-65.1-73.9-82l47.8 171.1 56.6-.1 84.2-195.3h-56.7z"
        fill={color}
      />
      <path
        d="M146.9 153h-86.4l-.7 3.8c67.2 16.2 111.6 55.4 130 102.5l-18.8-90c-3.2-12.3-12.5-15.8-24.1-16.3z"
        fill={color}
        opacity="0.7"
      />
    </svg>
  )
}

function MastercardLogo({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <svg viewBox="0 0 780 500" width={size * 1.56} height={size} fill="none">
      <circle cx="312" cy="250" r="150" fill={color} opacity="0.6" />
      <circle cx="468" cy="250" r="150" fill={color} opacity="0.4" />
      <path
        d="M390 130c-32.5 24.2-56.7 58.5-66.7 98h133.4c-10-39.5-34.2-73.8-66.7-98z"
        fill={color}
        opacity="0.8"
      />
      <path
        d="M390 370c32.5-24.2 56.7-58.5 66.7-98H323.3c10 39.5 34.2 73.8 66.7 98z"
        fill={color}
        opacity="0.8"
      />
    </svg>
  )
}

/* ──────────────────── Card Visual Component ──────────────────── */

function CardVisual({ account, compact }: { account: Account; compact?: boolean }) {
  const network = account.cardNetwork || 'VISA'
  const tier = account.cardTier || 'STANDARD'
  const design = getDesign(network, tier)
  const tierInfo = TIER_BENEFITS[tier as CardTier] || TIER_BENEFITS.STANDARD

  const h = compact ? 'h-44' : 'h-52'

  return (
    <div
      className={`relative ${h} w-full rounded-2xl overflow-hidden select-none`}
      style={{
        background: design.bg,
        border: `1px solid ${design.border}`,
        boxShadow: `0 0 40px ${design.glow}, 0 20px 60px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, ${design.accent} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${design.accent} 0%, transparent 50%)`,
        }}
      />

      {/* Decorative circles */}
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full" style={{ background: design.accent, filter: 'blur(40px)' }} />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full" style={{ background: design.accent, filter: 'blur(30px)', opacity: 0.5 }} />

      {/* Content */}
      <div className="relative h-full p-5 flex flex-col justify-between">
        {/* Top row: tier + network */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {/* Chip */}
            <div
              className="w-9 h-7 rounded-md"
              style={{
                background: `linear-gradient(135deg, ${design.chipColor}, rgba(255,255,255,0.08))`,
                border: `1px solid rgba(255,255,255,0.1)`,
              }}
            />
            <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: design.logoColor, opacity: 0.7 }}>
              {tierInfo.label}
            </span>
          </div>
          <div style={{ opacity: 0.9 }}>
            {network === 'VISA'
              ? <VisaLogo color={design.logoColor} size={compact ? 20 : 24} />
              : <MastercardLogo color={design.logoColor} size={compact ? 20 : 24} />
            }
          </div>
        </div>

        {/* Balance */}
        <div>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: design.logoColor, opacity: 0.5 }}>Balance</p>
          <p className="text-2xl font-bold num text-white">
            {Number(account.balance).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-sm ml-1.5" style={{ color: design.logoColor, opacity: 0.6 }}>{account.currency}</span>
          </p>
        </div>

        {/* Bottom row: ID + status */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-mono" style={{ color: design.logoColor, opacity: 0.4 }}>
              •••• •••• •••• {account.id.slice(-4).toUpperCase()}
            </p>
          </div>
          <span
            className="text-[9px] font-semibold tracking-wider px-2 py-0.5 rounded-full"
            style={{
              background: account.status === 'ACTIVE' ? 'rgba(52,211,153,0.15)' : 'rgba(148,163,184,0.1)',
              color: account.status === 'ACTIVE' ? '#34d399' : '#94a3b8',
              border: `1px solid ${account.status === 'ACTIVE' ? 'rgba(52,211,153,0.25)' : 'rgba(148,163,184,0.15)'}`,
            }}
          >
            {account.status}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────── Single Account Card ──────────────────── */

function AccountCard({ account, onRefresh }: { account: Account; onRefresh: () => void }) {
  const push = useToastStore((s) => s.push)
  const [expanded, setExpanded] = useState(false)
  const [txType, setTxType] = useState<'deposit' | 'withdraw' | null>(null)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)

  const isActive = account.status === 'ACTIVE'
  const design = getDesign(account.cardNetwork, account.cardTier)

  const handleTx = async () => {
    if (!txType || !amount) return
    setLoading(true)
    try {
      const fn = txType === 'deposit' ? deposit : withdraw
      await fn(account.id, account.currency, parseFloat(amount), category || undefined)
      push(`${txType === 'deposit' ? 'Deposit' : 'Withdrawal'} successful`, 'success')
      setTxType(null)
      setAmount('')
      setCategory('')
      onRefresh()
    } catch (err: any) {
      push(err.response?.data?.message || 'Transaction failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = async () => {
    if (!confirm('Close this account? Balance must be 0.')) return
    setLoading(true)
    try {
      await closeAccount(account.id)
      push('Account closed', 'success')
      onRefresh()
    } catch (err: any) {
      push(err.response?.data?.message || 'Cannot close account', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div layout className="space-y-0">
      {/* Card visual */}
      <div className="cursor-pointer" onClick={() => { setExpanded(!expanded); if (expanded) setTxType(null) }}>
        <CardVisual account={account} />
      </div>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-b-2xl mt-[-8px] pt-5 pb-4 px-4 space-y-3"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${design.border}`,
                borderTop: 'none',
              }}
            >
              {/* Action buttons */}
              {isActive && (
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setTxType(txType === 'deposit' ? null : 'deposit') }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      txType === 'deposit'
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                        : 'btn-ghost'
                    }`}
                  >
                    <ArrowDown size={12} /> Deposit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setTxType(txType === 'withdraw' ? null : 'withdraw') }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      txType === 'withdraw'
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                        : 'btn-ghost'
                    }`}
                  >
                    <ArrowUp size={12} /> Withdraw
                  </button>
                </div>
              )}

              {/* Transaction form */}
              <AnimatePresence>
                {txType && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="input flex-1 py-2 text-sm"
                          placeholder="Amount"
                          min="0.01"
                          step="0.01"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button onClick={(e) => { e.stopPropagation(); handleTx() }} disabled={loading || !amount} className="btn-primary px-4 py-2 text-xs">
                          {loading ? '...' : 'Send'}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setTxType(null) }} className="p-2 text-slate-500 hover:text-slate-300">
                          <X size={14} />
                        </button>
                      </div>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="input w-full py-1.5 text-xs text-slate-400"
                      >
                        <option value="">Category (optional)</option>
                        {['SALARY', 'GROCERIES', 'TRANSPORT', 'ENTERTAINMENT', 'UTILITIES', 'HEALTHCARE', 'EDUCATION', 'SHOPPING', 'RESTAURANT', 'TRANSFER', 'LOAN', 'OTHER'].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Details */}
              <div className="space-y-2 text-xs pt-1" style={{ borderTop: `1px solid ${design.border}` }}>
                <div className="flex justify-between text-slate-400">
                  <span className="text-slate-600">Account ID</span>
                  <span className="font-mono text-[10px]">{account.id}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="text-slate-600">Network</span>
                  <span>{account.cardNetwork || 'VISA'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="text-slate-600">Tier</span>
                  <span>{account.cardTier || 'STANDARD'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="text-slate-600">Created</span>
                  <span>{new Date(account.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Close account */}
              {isActive && (
                <button onClick={(e) => { e.stopPropagation(); handleClose() }} disabled={loading} className="btn-danger w-full text-xs py-1.5">
                  Close Account
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ──────────────────── Card Creation Wizard ──────────────────── */

type WizardStep = 'network' | 'tier' | 'currency' | 'confirm'

function CardCreationWizard({
  currencies,
  onClose,
  onCreated,
}: {
  currencies: string[]
  onClose: () => void
  onCreated: () => void
}) {
  const push = useToastStore((s) => s.push)
  const [step, setStep] = useState<WizardStep>('network')
  const [network, setNetwork] = useState<CardNetwork | null>(null)
  const [tier, setTier] = useState<CardTier | null>(null)
  const [currency, setCurrency] = useState('USD')
  const [initBal, setInitBal] = useState('0')
  const [creating, setCreating] = useState(false)

  const steps: WizardStep[] = ['network', 'tier', 'currency', 'confirm']
  const stepIndex = steps.indexOf(step)

  const canNext = () => {
    if (step === 'network') return !!network
    if (step === 'tier') return !!tier
    if (step === 'currency') return !!currency
    return true
  }

  const next = () => {
    const i = steps.indexOf(step)
    if (i < steps.length - 1) setStep(steps[i + 1])
  }

  const prev = () => {
    const i = steps.indexOf(step)
    if (i > 0) setStep(steps[i - 1])
  }

  const handleCreate = async () => {
    if (!network || !tier) return
    setCreating(true)
    try {
      await createAccount(currency.toUpperCase(), parseFloat(initBal) || 0, network, tier)
      push('Card created!', 'success')
      onCreated()
    } catch (err: any) {
      push(err.response?.data?.message || 'Failed to create card', 'error')
    } finally {
      setCreating(false)
    }
  }

  // Preview account for the confirm step
  const previewAccount: Account = {
    id: '00000000-0000-0000-0000-000000000000',
    ownerId: '',
    balance: parseFloat(initBal) || 0,
    currency,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    cardNetwork: network,
    cardTier: tier,
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{
                background: i <= stepIndex
                  ? 'linear-gradient(90deg, #06b6d4, #a855f7)'
                  : 'rgba(255,255,255,0.06)',
              }}
            />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Network */}
        {step === 'network' && (
          <motion.div key="network" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">Choose Card Network</h3>
            <p className="text-xs text-slate-500 mb-5">Select your preferred payment network</p>
            <div className="grid grid-cols-2 gap-3">
              {(['VISA', 'MASTERCARD'] as CardNetwork[]).map((n) => {
                const selected = network === n
                const color = n === 'VISA' ? '#38bdf8' : '#fb923c'
                return (
                  <button
                    key={n}
                    onClick={() => setNetwork(n)}
                    className="relative rounded-2xl p-5 transition-all duration-200 text-left"
                    style={{
                      background: selected
                        ? `linear-gradient(135deg, ${n === 'VISA' ? 'rgba(56,189,248,0.1)' : 'rgba(251,146,60,0.1)'}, rgba(0,0,0,0.4))`
                        : 'rgba(0,0,0,0.3)',
                      border: `1px solid ${selected ? color + '60' : 'rgba(255,255,255,0.06)'}`,
                      boxShadow: selected ? `0 0 30px ${color}15` : 'none',
                    }}
                  >
                    {selected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: color + '25', border: `1px solid ${color}50` }}>
                        <Check size={10} style={{ color }} />
                      </div>
                    )}
                    <div className="mb-3">
                      {n === 'VISA'
                        ? <VisaLogo color={color} size={28} />
                        : <MastercardLogo color={color} size={28} />
                      }
                    </div>
                    <p className="text-sm font-semibold text-slate-200">{n === 'VISA' ? 'Visa' : 'Mastercard'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {n === 'VISA' ? 'Global acceptance' : 'Worldwide coverage'}
                    </p>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Step 2: Tier */}
        {step === 'tier' && (
          <motion.div key="tier" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">Choose Card Tier</h3>
            <p className="text-xs text-slate-500 mb-5">Select the plan that fits your needs</p>
            <div className="space-y-3">
              {(['STANDARD', 'PREMIUM', 'DELUXE'] as CardTier[]).map((t) => {
                const info = TIER_BENEFITS[t]
                const Icon = info.icon
                const selected = tier === t
                return (
                  <button
                    key={t}
                    onClick={() => setTier(t)}
                    className="relative w-full rounded-2xl p-4 transition-all duration-200 text-left"
                    style={{
                      background: selected
                        ? `linear-gradient(135deg, ${info.color}12, rgba(0,0,0,0.4))`
                        : 'rgba(0,0,0,0.3)',
                      border: `1px solid ${selected ? info.color + '50' : 'rgba(255,255,255,0.06)'}`,
                      boxShadow: selected ? `0 0 30px ${info.color}10` : 'none',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: info.color + '15', border: `1px solid ${info.color}25` }}
                      >
                        <Icon size={18} style={{ color: info.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-slate-200">{info.label}</p>
                          {selected && (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: info.color + '25', border: `1px solid ${info.color}50` }}>
                              <Check size={10} style={{ color: info.color }} />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {info.benefits.slice(0, 3).map((b, i) => (
                            <span key={i} className="text-[10px] text-slate-500 flex items-center gap-1">
                              <span style={{ color: info.color, fontSize: '8px' }}>●</span> {b}
                            </span>
                          ))}
                          {info.benefits.length > 3 && (
                            <span className="text-[10px]" style={{ color: info.color }}>
                              +{info.benefits.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded benefits when selected */}
                    <AnimatePresence>
                      {selected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: `1px solid ${info.color}15` }}>
                            {info.benefits.map((b, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                                <Check size={10} style={{ color: info.color }} />
                                <span>{b}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Step 3: Currency & Balance */}
        {step === 'currency' && (
          <motion.div key="currency" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">Account Details</h3>
            <p className="text-xs text-slate-500 mb-5">Select currency and initial deposit</p>
            <div className="space-y-4">
              <div>
                <label className="label">Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input">
                  {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Initial Balance</label>
                <input
                  type="number"
                  value={initBal}
                  onChange={(e) => setInitBal(e.target.value)}
                  className="input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Confirm */}
        {step === 'confirm' && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">Review Your Card</h3>
            <p className="text-xs text-slate-500 mb-5">Confirm details and create your card</p>

            {/* Card preview */}
            <div className="mb-5">
              <CardVisual account={previewAccount} compact />
            </div>

            {/* Summary */}
            <div className="glass rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span className="text-slate-600">Network</span>
                <span>{network}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="text-slate-600">Tier</span>
                <span>{tier}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="text-slate-600">Currency</span>
                <span>{currency}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="text-slate-600">Initial Balance</span>
                <span className="num">{parseFloat(initBal || '0').toFixed(2)} {currency}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex gap-3 pt-2">
        {stepIndex > 0 ? (
          <button onClick={prev} className="btn-ghost flex items-center gap-1.5 text-xs flex-1">
            <ArrowLeft size={12} /> Back
          </button>
        ) : (
          <button onClick={onClose} className="btn-ghost flex-1 text-xs">Cancel</button>
        )}
        {step === 'confirm' ? (
          <button
            onClick={handleCreate}
            disabled={creating}
            className="btn-primary flex items-center justify-center gap-2 flex-1 text-xs"
            style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.9), rgba(168,85,247,0.9))' }}
          >
            {creating ? (
              <>
                <div className="w-3.5 h-3.5 spin rounded-full" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <CreditCard size={14} />
                <span>Create Card</span>
              </>
            )}
          </button>
        ) : (
          <button onClick={next} disabled={!canNext()} className="btn-primary flex items-center justify-center gap-1.5 flex-1 text-xs">
            Next <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

/* ──────────────────── Main Page ──────────────────── */

export function AccountsPage() {
  const push = useToastStore((s) => s.push)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(false)
  const [currencies, setCurrencies] = useState<string[]>(['USD', 'EUR', 'GBP', 'RUB', 'JPY'])

  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    getSupportedCurrencies()
      .then((c) => { if (mountedRef.current) setCurrencies(c) })
      .catch(() => {})
    return () => { mountedRef.current = false }
  }, [])

  const load = () => {
    setLoading(true)
    getAccounts()
      .then((data) => { if (mountedRef.current) setAccounts(data) })
      .catch(() => { if (mountedRef.current) push('Failed to load accounts', 'error') })
      .finally(() => { if (mountedRef.current) setLoading(false) })
  }

  useEffect(load, [])

  if (loading) return <AccountsSkeleton />

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Cards</h1>
          <p className="text-sm text-slate-500 mt-0.5">{accounts.length} card{accounts.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-ghost flex items-center gap-2 text-xs"><RefreshCw size={14} /></button>
          <button onClick={() => setShowWizard(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> New Card
          </button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <GlassCard className="text-center py-16">
          <CreditCard size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-medium mb-2">No cards yet</p>
          <p className="text-slate-600 text-sm mb-5">Create your first card to start banking</p>
          <button onClick={() => setShowWizard(true)} className="btn-primary mx-auto flex items-center gap-2">
            <Plus size={16} /> Create Card
          </button>
        </GlassCard>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {accounts.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <AccountCard account={a} onRefresh={load} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal open={showWizard} onClose={() => setShowWizard(false)} title="Create New Card" maxWidth="max-w-lg">
        <CardCreationWizard
          currencies={currencies}
          onClose={() => setShowWizard(false)}
          onCreated={() => { setShowWizard(false); load() }}
        />
      </Modal>
    </div>
  )
}
