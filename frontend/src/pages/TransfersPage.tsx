import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftRight, CheckCircle2, Copy, TrendingUp, Star, Users, Plus, CreditCard, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { transfer } from '../api/transfers'
import { getAccounts } from '../api/accounts'
import { getExchangeRates, getSupportedCurrencies } from '../api/exchange'
import { getBeneficiaries, touchBeneficiary, createBeneficiary } from '../api/beneficiaries'
import { GlassCard } from '../components/GlassCard'
import { AccountSelect } from '../components/AccountSelect'
import { ExchangeRateBanner } from '../components/ExchangeRateBanner'
import { useToastStore } from '../store/useToastStore'
import type { Account, Beneficiary } from '../types'

const FALLBACK_CURRENCIES = ['USD', 'EUR', 'GBP', 'RUB']

type ToMode = 'own' | 'card'

export function TransfersPage() {
  const push = useToastStore((s) => s.push)

  const [form, setForm] = useState({ fromAccountId: '', toAccountId: '', toCardNumber: '', currency: 'USD', toCurrency: 'USD', amount: '' })
  const [toMode, setToMode] = useState<ToMode>('own')
  const [idempKey, setIdempKey]   = useState<string>(crypto.randomUUID())
  const [loading, setLoading]     = useState(false)
  const [lastTxId, setLastTxId]   = useState<string | null>(null)
  const [currencies, setCurrencies] = useState<string[]>(FALLBACK_CURRENCIES)
  const [rates, setRates]           = useState<Record<string, number>>({})
  const [accounts, setAccounts]     = useState<Account[]>([])
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [usedBeneficiaryId, setUsedBeneficiaryId] = useState<string | null>(null)
  const [saveBeneficiary, setSaveBeneficiary] = useState<{ cardNumber: string; currency: string } | null>(null)
  const [saveNickname, setSaveNickname] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch(() => {})
      .finally(() => setAccountsLoading(false))
    getSupportedCurrencies()
      .then((c) => setCurrencies([...c].sort()))
      .catch(() => {})
    getExchangeRates()
      .then(setRates)
      .catch(() => {})
    getBeneficiaries().then(setBeneficiaries).catch(() => {})
  }, [])

  const handlePickBeneficiary = (b: Beneficiary) => {
    setToMode('card')
    setForm((f) => ({ ...f, toAccountId: '', toCardNumber: b.accountNumber, toCurrency: b.currency }))
    setUsedBeneficiaryId(b.id)
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const resolvedToId = toMode === 'own' ? form.toAccountId : form.toCardNumber.trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fromAccountId || !resolvedToId) {
      push('Please fill both source and destination', 'error')
      return
    }
    if (form.fromAccountId === resolvedToId) {
      push('Source and destination must be different', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await transfer({
        fromAccountId: form.fromAccountId,
        toAccountId: resolvedToId,
        currency: form.currency,
        amount: form.amount,
      }, idempKey)
      setLastTxId(res.transactionId)
      push('Transfer completed!', 'success')
      const sentCardNumber = form.toCardNumber.trim()
      const sentCurrency = form.toCurrency
      setForm((f) => ({ ...f, amount: '', toCardNumber: '' }))
      setIdempKey(crypto.randomUUID())
      if (toMode === 'card' && sentCardNumber && !usedBeneficiaryId) {
        const alreadySaved = beneficiaries.some((b) => b.accountNumber.replace(/\s/g, '') === sentCardNumber.replace(/\s/g, ''))
        if (!alreadySaved) setSaveBeneficiary({ cardNumber: sentCardNumber, currency: sentCurrency })
      }
      if (usedBeneficiaryId) {
        touchBeneficiary(usedBeneficiaryId).then((updated) => {
          setBeneficiaries((bs) => bs.map((b) => b.id === updated.id ? updated : b))
        }).catch(() => {})
        setUsedBeneficiaryId(null)
      }
    } catch (err: any) {
      push(err.response?.data?.message || 'Transfer failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id)
    push('Copied to clipboard', 'info')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Transfers</h1>
        <p className="text-sm text-slate-500 mt-0.5">Send funds between cards securely</p>
      </div>

      {/* Saved beneficiaries */}
      {beneficiaries.filter((b) => b.internal).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-cyan-400" />
                <p className="text-xs text-slate-500 uppercase tracking-wider">Saved Recipients</p>
              </div>
              <Link to="/beneficiaries" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                <Plus size={11} /> Manage
              </Link>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {beneficiaries.filter((b) => b.internal).slice(0, 8).map((b) => (
                <button
                  key={b.id}
                  onClick={() => handlePickBeneficiary(b)}
                  className="flex-shrink-0 px-3 py-2 rounded-xl text-left transition-all hover:bg-white/[0.04] border border-white/[0.05] hover:border-cyan-500/30 min-w-[140px]"
                  style={usedBeneficiaryId === b.id ? { background: 'rgba(6,182,212,0.08)', borderColor: 'rgba(6,182,212,0.3)' } : {}}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {b.favorite && <Star size={9} className="text-amber-400" fill="currentColor" />}
                    <p className="text-xs font-medium text-white truncate">{b.nickname}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{b.accountNumber}</p>
                  <p className="text-[10px] text-cyan-400 mt-0.5">{b.currency}</p>
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard glow="cyan">
          {/* Icon header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <ArrowLeftRight size={18} className="text-cyan-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">New Transfer</p>
              <p className="text-xs text-slate-500">Send funds between cards</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AccountSelect
              accounts={accounts}
              value={form.fromAccountId}
              onChange={(id) => {
                const acc = accounts.find((a) => a.id === id)
                setForm((f) => ({ ...f, fromAccountId: id, currency: acc?.currency ?? f.currency }))
              }}
              label="From Card"
              placeholder="Select source card"
              loading={accountsLoading}
            />

            <div className="relative flex items-center justify-center">
              <div className="flex-1 h-px bg-white/[0.05]" />
              <div className="mx-3 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <ArrowLeftRight size={12} className="text-cyan-400" />
              </div>
              <div className="flex-1 h-px bg-white/[0.05]" />
            </div>

            {/* To mode toggle */}
            <div>
              <label className="label mb-2">To</label>
              <div className="flex gap-1 p-1 rounded-xl glass mb-3" style={{ width: 'fit-content' }}>
                <button
                  type="button"
                  onClick={() => { setToMode('own'); setForm((f) => ({ ...f, toCardNumber: '' })) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={toMode === 'own'
                    ? { background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', color: '#06b6d4' }
                    : { background: 'transparent', border: '1px solid transparent', color: '#64748b' }}
                >
                  My card
                </button>
                <button
                  type="button"
                  onClick={() => { setToMode('card'); setForm((f) => ({ ...f, toAccountId: '' })); setUsedBeneficiaryId(null) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={toMode === 'card'
                    ? { background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', color: '#06b6d4' }
                    : { background: 'transparent', border: '1px solid transparent', color: '#64748b' }}
                >
                  <CreditCard size={12} /> Card number
                </button>
              </div>

              {toMode === 'own' ? (
                <AccountSelect
                  accounts={accounts}
                  value={form.toAccountId}
                  onChange={(id) => {
                    const acc = accounts.find((a) => a.id === id)
                    setForm((f) => ({ ...f, toAccountId: id, toCurrency: acc?.currency ?? f.toCurrency }))
                  }}
                  label=""
                  placeholder="Select destination card"
                  loading={accountsLoading}
                />
              ) : (
                <div>
                  <input
                    value={form.toCardNumber}
                    onChange={(e) => setForm((f) => ({ ...f, toCardNumber: e.target.value }))}
                    className="input font-mono w-full"
                    placeholder="XXXX XXXX XXXX XXXX"
                    maxLength={19}
                  />
                  <p className="text-[10px] text-slate-600 mt-1">Enter the recipient's card number</p>
                </div>
              )}
            </div>

            <ExchangeRateBanner fromCurrency={form.currency} toCurrency={form.toCurrency} />

            <div>
              <label className="label">Amount</label>
              <input type="number" value={form.amount} onChange={set('amount')} className="input num" placeholder="0.00" min="0.01" step="0.01" required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? (
                <><div className="w-4 h-4 spin rounded-full" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} /><span>Processing…</span></>
              ) : (
                <><ArrowLeftRight size={16} /><span>Send Transfer</span></>
              )}
            </button>
          </form>
        </GlassCard>
      </motion.div>

      {/* Exchange rates table */}
      {Object.keys(rates).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-cyan-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">Exchange Rates</p>
              <span className="text-xs text-slate-600 ml-auto">relative to 1 unit</span>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>From \ To</th>
                    {currencies.map((c) => <th key={c}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {currencies.map((from) => (
                    <tr key={from}>
                      <td className="font-semibold text-slate-300">{from}</td>
                      {currencies.map((to) => {
                        const key = `${from}_${to}`
                        const rate = rates[key]
                        return (
                          <td key={to} className={`num text-xs ${from === to ? 'text-slate-600' : 'text-slate-300'}`}>
                            {rate != null ? Number(rate).toFixed(4) : '—'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Last transaction */}
      {lastTxId && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard glow="blue">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-400 mb-1">Transfer successful</p>
                <p className="text-xs text-slate-500 mb-1">Transaction ID:</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs text-slate-300 truncate">{lastTxId}</p>
                  <button onClick={() => copyId(lastTxId)} className="text-slate-500 hover:text-cyan-400 flex-shrink-0 transition-colors">
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Save as beneficiary prompt */}
      {saveBeneficiary && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <UserPlus size={16} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white mb-1">Save recipient?</p>
                <p className="text-xs text-slate-500 mb-3">Save <span className="font-mono text-slate-400">{saveBeneficiary.cardNumber}</span> for quick transfers</p>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <input
                      value={saveNickname}
                      onChange={(e) => setSaveNickname(e.target.value)}
                      className="input w-full text-xs"
                      placeholder="Nickname (e.g. Mom, John)"
                    />
                  </div>
                  <button
                    disabled={saving || !saveNickname.trim()}
                    onClick={async () => {
                      setSaving(true)
                      try {
                        const created = await createBeneficiary({
                          nickname: saveNickname.trim(),
                          accountNumber: saveBeneficiary.cardNumber,
                          currency: saveBeneficiary.currency,
                        })
                        setBeneficiaries((bs) => [...bs, created])
                        push('Beneficiary saved', 'success')
                        setSaveBeneficiary(null)
                        setSaveNickname('')
                      } catch (err: any) {
                        push(err.response?.data?.message || 'Failed to save', 'error')
                      } finally {
                        setSaving(false)
                      }
                    }}
                    className="btn-primary text-xs px-4 py-2.5"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setSaveBeneficiary(null); setSaveNickname('') }}
                    className="btn-ghost text-xs px-3 py-2.5"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
