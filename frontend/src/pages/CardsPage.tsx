import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, ArrowUp, ArrowDown, RefreshCw,
  CreditCard, Shield, Crown, Gem, Check, ArrowRight, ArrowLeft,
  Lock, Unlock, Eye, EyeOff, Trash2, Clock
} from 'lucide-react'
import {
  getAccounts, createAccount, deposit, withdraw, closeAccount,
  setDailyLimit,
} from '../api/accounts'
import { createCardRequest, getMyPendingCardRequests } from '../api/cardRequests'
import { getSupportedCurrencies } from '../api/exchange'
import { GlassCard } from '../components/GlassCard'
import { AccountsSkeleton } from '../components/Skeleton'
import { Modal } from '../components/Modal'
import { useToastStore } from '../store/useToastStore'
import type { Account, CardNetwork, CardTier, CardType, CardRequest } from '../types'

/* ──────────────────── Card Design Config ──────────────────── */

// Simple gradient matrix: network × tier = 6 styles
const CARD_GRADIENTS: Record<string, Record<string, string>> = {
  VISA: {
    STANDARD: 'linear-gradient(135deg, #1a1f71 0%, #00579f 50%, #1a1f71 100%)',
    PREMIUM:  'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #2563eb 100%)',
    DELUXE:   'linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #1e3a8a 100%)',
  },
  MASTERCARD: {
    STANDARD: 'linear-gradient(135deg, #eb001b 0%, #f79e1b 100%)',
    PREMIUM:  'linear-gradient(135deg, #b91c1c 0%, #ea580c 50%, #f59e0b 100%)',
    DELUXE:   'linear-gradient(135deg, #0a0a0a 0%, #2a0a0a 50%, #7f1d1d 100%)',
  },
  DEFAULT: {
    STANDARD: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)',
    PREMIUM:  'linear-gradient(135deg, #0e7490 0%, #6d28d9 100%)',
    DELUXE:   'linear-gradient(135deg, #000000 0%, #0a0a0a 60%, #1a1a2e 100%)',
  },
}

const TIER_LABEL: Record<string, { color: string; label: string }> = {
  STANDARD: { color: '#94a3b8', label: 'Standard' },
  PREMIUM:  { color: '#facc15', label: 'Premium' },
  DELUXE:   { color: '#a855f7', label: 'Deluxe' },
}

const TIER_BENEFITS: Record<CardTier, { icon: typeof Shield; label: string; color: string; benefits: string[] }> = {
  STANDARD: {
    icon: Shield,
    label: 'Standard',
    color: '#38bdf8',
    benefits: [
      'Free basic transfers',
      'Up to 3 active cards',
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
      'Up to 10 active cards',
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
      'Unlimited cards',
      'Best exchange rates (+0.5%)',
      '24/7 priority phone & chat support',
      'Full analytics with AI insights',
      'Cashback up to 2%',
      'Airport lounge access',
      'Exclusive partner offers',
    ],
  },
}

function getGradient(network: string | null, tier: string | null) {
  const n = (network || 'DEFAULT').toUpperCase()
  const t = (tier || 'STANDARD').toUpperCase()
  return (CARD_GRADIENTS[n] || CARD_GRADIENTS.DEFAULT)[t] || CARD_GRADIENTS.DEFAULT.STANDARD
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
      <path d="M390 130c-32.5 24.2-56.7 58.5-66.7 98h133.4c-10-39.5-34.2-73.8-66.7-98z" fill={color} opacity="0.8" />
      <path d="M390 370c32.5-24.2 56.7-58.5 66.7-98H323.3c10 39.5 34.2 73.8 66.7 98z" fill={color} opacity="0.8" />
    </svg>
  )
}

/* ──────────────────── Card Visual Component ──────────────────── */

function maskCardNumber(num: string | null) {
  if (!num) return '•••• •••• •••• ••••'
  const last4 = num.replace(/\s/g, '').slice(-4)
  return `•••• •••• •••• ${last4}`
}

function CardVisual({ account, reveal }: { account: Account; reveal?: boolean }) {
  const network = account.cardNetwork
  const tier = (account.cardTier || 'STANDARD').toUpperCase()
  const gradient = getGradient(network, tier)
  const tierMeta = TIER_LABEL[tier] || TIER_LABEL.STANDARD
  const isBlocked = account.status === 'BLOCKED'

  return (
    <div
      className="relative w-full aspect-[1.6] rounded-2xl p-5 overflow-hidden flex flex-col justify-between"
      style={{
        background: gradient,
        boxShadow: '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
        opacity: isBlocked ? 0.5 : (account.status === 'CLOSED' ? 0.55 : 1),
        filter: isBlocked ? 'grayscale(0.6)' : 'none',
      }}
    >
      {/* Texture */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4), transparent 50%)',
        }}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div>
          {account.cardType === 'VIRTUAL' && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 bg-black/20 px-2 py-0.5 rounded-md">
              Virtual
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-white text-xs font-bold tracking-widest opacity-90">
            {network || 'CARD'}
          </p>
          {account.cardTier && (
            <p className="text-[10px] uppercase tracking-wider opacity-70" style={{ color: tierMeta.color }}>
              {tierMeta.label}
            </p>
          )}
        </div>
      </div>

      {/* Chip */}
      <div className="relative">
        <div
          className="w-10 h-7 rounded-md mb-3"
          style={{
            background: 'linear-gradient(135deg, #fcd34d 0%, #d4a017 100%)',
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.3)',
          }}
        />
        <p className="font-mono text-white text-lg tracking-widest font-medium" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
          {reveal ? (account.cardNumber || '•••• •••• •••• ••••') : maskCardNumber(account.cardNumber)}
        </p>
      </div>

      {/* Footer */}
      <div className="relative flex items-end justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-white/60">Cardholder</p>
          <p className="text-white text-xs font-medium tracking-wider">
            {account.holderName || '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-widest text-white/60">Expires</p>
          <p className="text-white text-xs font-mono tracking-wider">
            {account.expiryDate
              ? new Date(account.expiryDate).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })
              : '—'}
          </p>
        </div>
      </div>

      {isBlocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/70 px-4 py-2 rounded-lg flex items-center gap-2">
            <Lock size={14} className="text-red-400" />
            <span className="text-white text-xs font-bold uppercase tracking-widest">Blocked</span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ──────────────────── Single Card ──────────────────── */

function CardItem({
  account, reveal, pendingRequest, onToggleReveal, onOpenTx, onOpenLimit, onRefresh,
}: {
  account: Account
  reveal: boolean
  pendingRequest?: CardRequest
  onToggleReveal: () => void
  onOpenTx: (mode: 'deposit' | 'withdraw') => void
  onOpenLimit: () => void
  onRefresh: () => void
}) {
  const push = useToastStore((s) => s.push)
  const isActive = account.status === 'ACTIVE'
  const isBlocked = account.status === 'BLOCKED'
  const isClosed = account.status === 'CLOSED'

  const handleBlockToggle = async () => {
    const action = isBlocked ? 'unblock' : 'block'
    if (!confirm(`Send a request to ${action} this card?\n\nThe request will be reviewed by an administrator.`)) return
    try {
      await createCardRequest(account.id, isBlocked ? 'UNBLOCK' : 'BLOCK')
      push(`${action.charAt(0).toUpperCase() + action.slice(1)} request submitted`, 'success')
      onRefresh()
    } catch (err: any) {
      push(err.response?.data?.message || 'Failed', 'error')
    }
  }

  const handleClose = async () => {
    if (!confirm(`Close this card ${account.cardNumber || ''}? Balance must be 0.`)) return
    try {
      await closeAccount(account.id)
      push('Card closed', 'success')
      onRefresh()
    } catch (err: any) {
      push(err.response?.data?.message || 'Cannot close card', 'error')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard>
        <CardVisual account={account} reveal={reveal} />

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Account balance</span>
            <span className="font-mono font-medium text-white">
              {Number(account.balance).toFixed(2)} {account.currency}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Daily limit</span>
            <button
              onClick={onOpenLimit}
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-mono"
            >
              {account.dailyLimit != null ? `${Number(account.dailyLimit).toFixed(2)} ${account.currency}` : 'Set limit'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.04]">
            <button
              onClick={onToggleReveal}
              className="btn-ghost text-xs flex items-center gap-1.5"
            >
              {reveal ? <EyeOff size={12} /> : <Eye size={12} />}
              {reveal ? 'Hide' : 'Reveal'}
            </button>

            {!isClosed && (
              pendingRequest ? (
                <span className="text-xs flex items-center gap-1.5 px-2 py-1 rounded-lg"
                  style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                  <Clock size={12} />
                  {pendingRequest.requestType === 'BLOCK' ? 'Block' : 'Unblock'} pending
                </span>
              ) : (
                <button
                  onClick={handleBlockToggle}
                  className="btn-ghost text-xs flex items-center gap-1.5"
                  style={isBlocked ? { color: '#34d399' } : { color: '#f87171' }}
                >
                  {isBlocked ? <Unlock size={12} /> : <Lock size={12} />}
                  {isBlocked ? 'Unblock' : 'Block'}
                </button>
              )
            )}

            {isActive && (
              <button onClick={() => onOpenTx('deposit')} className="btn-ghost text-xs flex items-center gap-1.5" style={{ color: '#34d399' }}>
                <ArrowDown size={12} /> Deposit
              </button>
            )}
            {isActive && (
              <button onClick={() => onOpenTx('withdraw')} className="btn-ghost text-xs flex items-center gap-1.5" style={{ color: '#fbbf24' }}>
                <ArrowUp size={12} /> Withdraw
              </button>
            )}

            {isActive && (
              <button onClick={handleClose} className="btn-ghost text-xs flex items-center gap-1.5 ml-auto" style={{ color: '#f87171' }}>
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

/* ──────────────────── Card Creation Wizard ──────────────────── */

type WizardStep = 'network' | 'tier' | 'type' | 'currency' | 'confirm'

function CardCreationWizard({
  currencies, onClose, onCreated,
}: {
  currencies: string[]
  onClose: () => void
  onCreated: () => void
}) {
  const push = useToastStore((s) => s.push)
  const [step, setStep] = useState<WizardStep>('network')
  const [network, setNetwork] = useState<CardNetwork | null>(null)
  const [tier, setTier] = useState<CardTier | null>(null)
  const [cardType, setCardType] = useState<CardType>('PHYSICAL')
  const [currency, setCurrency] = useState('USD')
  const [initBal, setInitBal] = useState('0')
  const [creating, setCreating] = useState(false)

  const steps: WizardStep[] = ['network', 'tier', 'type', 'currency', 'confirm']
  const stepIndex = steps.indexOf(step)

  const canNext = () => {
    if (step === 'network') return !!network
    if (step === 'tier') return !!tier
    if (step === 'type') return !!cardType
    if (step === 'currency') return !!currency
    return true
  }

  const next = () => { const i = steps.indexOf(step); if (i < steps.length - 1) setStep(steps[i + 1]) }
  const prev = () => { const i = steps.indexOf(step); if (i > 0) setStep(steps[i - 1]) }

  const handleCreate = async () => {
    if (!network || !tier) return
    setCreating(true)
    try {
      await createAccount(currency.toUpperCase(), parseFloat(initBal) || 0, network, tier, cardType)
      push('Card created!', 'success')
      onCreated()
    } catch (err: any) {
      push(err.response?.data?.message || 'Failed to create card', 'error')
    } finally { setCreating(false) }
  }

  const previewAccount: Account = {
    id: '00000000-0000-0000-0000-000000000000',
    ownerId: '',
    balance: parseFloat(initBal) || 0,
    currency,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    cardNetwork: network,
    cardTier: tier,
    cardNumber: null,
    cardType,
    dailyLimit: null,
    expiryDate: null,
    holderName: null,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: i <= stepIndex ? 'linear-gradient(90deg, #06b6d4, #a855f7)' : 'rgba(255,255,255,0.06)' }}
            />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
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
                    key={n} onClick={() => setNetwork(n)}
                    className="relative rounded-2xl p-5 transition-all duration-200 text-left"
                    style={{
                      background: selected ? `linear-gradient(135deg, ${n === 'VISA' ? 'rgba(56,189,248,0.1)' : 'rgba(251,146,60,0.1)'}, rgba(0,0,0,0.4))` : 'rgba(0,0,0,0.3)',
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
                      {n === 'VISA' ? <VisaLogo color={color} size={28} /> : <MastercardLogo color={color} size={28} />}
                    </div>
                    <p className="text-sm font-semibold text-slate-200">{n === 'VISA' ? 'Visa' : 'Mastercard'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{n === 'VISA' ? 'Global acceptance' : 'Worldwide coverage'}</p>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === 'tier' && (
          <motion.div key="tier" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">Choose Card Tier</h3>
            <p className="text-xs text-slate-500 mb-5">Select the plan that fits your needs</p>
            <div className="space-y-3">
              {(['STANDARD', 'PREMIUM', 'DELUXE'] as CardTier[]).map((t) => {
                const info = TIER_BENEFITS[t]; const Icon = info.icon
                const selected = tier === t
                return (
                  <button key={t} onClick={() => setTier(t)}
                    className="relative w-full rounded-2xl p-4 transition-all duration-200 text-left"
                    style={{
                      background: selected ? `linear-gradient(135deg, ${info.color}12, rgba(0,0,0,0.4))` : 'rgba(0,0,0,0.3)',
                      border: `1px solid ${selected ? info.color + '50' : 'rgba(255,255,255,0.06)'}`,
                      boxShadow: selected ? `0 0 30px ${info.color}10` : 'none',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: info.color + '15', border: `1px solid ${info.color}25` }}>
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
                    <AnimatePresence>
                      {selected && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
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

        {step === 'type' && (
          <motion.div key="type" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">Physical or Virtual?</h3>
            <p className="text-xs text-slate-500 mb-5">Virtual cards are issued instantly for online use</p>
            <div className="grid grid-cols-2 gap-3">
              {(['PHYSICAL', 'VIRTUAL'] as CardType[]).map((t) => {
                const selected = cardType === t
                return (
                  <button key={t} onClick={() => setCardType(t)}
                    className="p-5 rounded-xl text-sm transition-all text-center"
                    style={{
                      background: selected ? 'rgba(6,182,212,0.08)' : 'transparent',
                      border: `1px solid ${selected ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      color: selected ? '#06b6d4' : '#94a3b8',
                    }}
                  >
                    <CreditCard size={18} className="mx-auto mb-2" />
                    <p className="font-semibold">{t === 'PHYSICAL' ? 'Physical' : 'Virtual'}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">
                      {t === 'PHYSICAL' ? 'Ships in 3-5 days' : 'Instant issuance'}
                    </p>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === 'currency' && (
          <motion.div key="currency" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">Card Details</h3>
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
                <input type="number" value={initBal} onChange={(e) => setInitBal(e.target.value)} className="input" placeholder="0.00" min="0" step="0.01" />
              </div>
            </div>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">Review Your Card</h3>
            <p className="text-xs text-slate-500 mb-5">Confirm details and issue the card</p>
            <div className="mb-5"><CardVisual account={previewAccount} /></div>
            <div className="glass rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400"><span className="text-slate-600">Network</span><span>{network}</span></div>
              <div className="flex justify-between text-slate-400"><span className="text-slate-600">Tier</span><span>{tier}</span></div>
              <div className="flex justify-between text-slate-400"><span className="text-slate-600">Type</span><span>{cardType}</span></div>
              <div className="flex justify-between text-slate-400"><span className="text-slate-600">Currency</span><span>{currency}</span></div>
              <div className="flex justify-between text-slate-400"><span className="text-slate-600">Initial Balance</span><span className="num">{parseFloat(initBal || '0').toFixed(2)} {currency}</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            onClick={handleCreate} disabled={creating}
            className="btn-primary flex items-center justify-center gap-2 flex-1 text-xs"
            style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.9), rgba(168,85,247,0.9))' }}
          >
            {creating ? (
              <>
                <div className="w-3.5 h-3.5 spin rounded-full" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                <span>Issuing...</span>
              </>
            ) : (
              <><CreditCard size={14} /><span>Issue Card</span></>
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

export function CardsPage() {
  const push = useToastStore((s) => s.push)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(false)
  const [currencies, setCurrencies] = useState<string[]>(['USD', 'EUR', 'GBP', 'RUB', 'JPY'])

  const [pendingRequests, setPendingRequests] = useState<CardRequest[]>([])
  const [reveal, setRevealMap] = useState<Record<string, boolean>>({})
  const [limitModal, setLimitModal] = useState<Account | null>(null)
  const [limitInput, setLimitInput] = useState('')
  const [txModal, setTxModal] = useState<{ account: Account; mode: 'deposit' | 'withdraw' } | null>(null)
  const [txAmount, setTxAmount] = useState('')
  const [txCategory, setTxCategory] = useState('')
  const [busy, setBusy] = useState(false)

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
    Promise.all([getAccounts(), getMyPendingCardRequests()])
      .then(([cards, reqs]) => {
        if (mountedRef.current) { setAccounts(cards); setPendingRequests(reqs) }
      })
      .catch(() => { if (mountedRef.current) push('Failed to load cards', 'error') })
      .finally(() => { if (mountedRef.current) setLoading(false) })
  }

  useEffect(load, [])

  const handleSaveLimit = async () => {
    if (!limitModal) return
    setBusy(true)
    try {
      const v = limitInput.trim() === '' ? null : parseFloat(limitInput)
      await setDailyLimit(limitModal.id, v)
      push('Daily limit saved', 'success')
      setLimitModal(null); setLimitInput('')
      load()
    } catch { push('Failed to save limit', 'error') }
    finally { setBusy(false) }
  }

  const handleSaveTx = async () => {
    if (!txModal || !txAmount) return
    setBusy(true)
    try {
      const fn = txModal.mode === 'deposit' ? deposit : withdraw
      await fn(txModal.account.id, txModal.account.currency, parseFloat(txAmount), txCategory || undefined)
      push(`${txModal.mode === 'deposit' ? 'Deposit' : 'Withdrawal'} successful`, 'success')
      setTxModal(null); setTxAmount(''); setTxCategory('')
      load()
    } catch (err: any) {
      push(err.response?.data?.message || 'Transaction failed', 'error')
    } finally { setBusy(false) }
  }

  if (loading) return <AccountsSkeleton />

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">My Cards</h1>
          <p className="text-sm text-slate-500 mt-0.5">{accounts.length} card{accounts.length !== 1 ? 's' : ''} across your accounts</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-ghost flex items-center gap-2 text-xs"><RefreshCw size={14} /></button>
          <button onClick={() => setShowWizard(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Issue Card
          </button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <GlassCard className="text-center py-16">
          <CreditCard size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-medium mb-2">No cards yet</p>
          <p className="text-slate-600 text-sm mb-5">Issue your first card to start banking</p>
          <button onClick={() => setShowWizard(true)} className="btn-primary mx-auto flex items-center gap-2">
            <Plus size={16} /> Issue Card
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.map((a) => (
            <CardItem
              key={a.id}
              account={a}
              reveal={!!reveal[a.id]}
              pendingRequest={pendingRequests.find((r) => r.accountId === a.id)}
              onToggleReveal={() => setRevealMap({ ...reveal, [a.id]: !reveal[a.id] })}
              onOpenTx={(mode) => { setTxModal({ account: a, mode }); setTxAmount(''); setTxCategory('') }}
              onOpenLimit={() => { setLimitModal(a); setLimitInput(a.dailyLimit?.toString() || '') }}
              onRefresh={load}
            />
          ))}
        </div>
      )}

      {/* Issue Card wizard */}
      <Modal open={showWizard} onClose={() => setShowWizard(false)} title="Issue New Card" maxWidth="max-w-lg">
        <CardCreationWizard
          currencies={currencies}
          onClose={() => setShowWizard(false)}
          onCreated={() => { setShowWizard(false); load() }}
        />
      </Modal>

      {/* Daily limit modal */}
      <Modal open={!!limitModal} onClose={() => setLimitModal(null)} title="Daily Spending Limit">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Set a daily spending limit for {limitModal?.cardNumber || 'this card'}. Leave empty to remove the limit.
          </p>
          <input
            type="number" value={limitInput}
            onChange={(e) => setLimitInput(e.target.value)}
            placeholder="0.00" min="0" step="0.01"
            className="input w-full"
          />
          <div className="flex gap-2">
            <button onClick={() => setLimitModal(null)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleSaveLimit} disabled={busy} className="btn-primary flex-1">Save</button>
          </div>
        </div>
      </Modal>

      {/* Deposit / Withdraw modal */}
      <Modal
        open={!!txModal}
        onClose={() => setTxModal(null)}
        title={txModal?.mode === 'deposit' ? 'Deposit' : 'Withdraw'}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            {txModal?.mode === 'deposit' ? 'Add funds to' : 'Withdraw funds from'} {txModal?.account.cardNumber || 'this card'}.
          </p>
          <div>
            <label className="label">Amount ({txModal?.account.currency})</label>
            <input
              type="number" value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              placeholder="0.00" min="0.01" step="0.01"
              className="input w-full" autoFocus
            />
          </div>
          <div>
            <label className="label">Category (optional)</label>
            <select value={txCategory} onChange={(e) => setTxCategory(e.target.value)} className="input w-full">
              <option value="">—</option>
              {['SALARY', 'GROCERIES', 'TRANSPORT', 'ENTERTAINMENT', 'UTILITIES', 'HEALTHCARE', 'EDUCATION', 'SHOPPING', 'RESTAURANT', 'TRANSFER', 'LOAN', 'OTHER'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setTxModal(null)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleSaveTx} disabled={busy || !txAmount} className="btn-primary flex-1">
              {txModal?.mode === 'deposit' ? 'Deposit' : 'Withdraw'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
