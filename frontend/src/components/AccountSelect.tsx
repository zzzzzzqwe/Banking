import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CreditCard, Wallet } from 'lucide-react'
import type { Account } from '../types'

interface Props {
  accounts: Account[]
  value: string
  onChange: (id: string) => void
  label: string
  placeholder?: string
  loading?: boolean
}

const CARD_ICONS: Record<string, string> = {
  VISA: '💳',
  MASTERCARD: '💳',
}

function formatBalance(balance: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(balance)
}

function displayNumber(acc: Account) {
  if (acc.cardNumber) return acc.cardNumber
  const id = acc.id
  return `${id.slice(0, 4)}…${id.slice(-4)}`
}

export function AccountSelect({ accounts, value, onChange, label, placeholder = 'Select account', loading }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })

  const selected = accounts.find((a) => a.id === value)

  const updatePos = useCallback(() => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 8, left: r.left, width: r.width })
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!open) return
    updatePos()
    const scrollParent = triggerRef.current?.closest('.overflow-y-auto')
    const onScroll = () => updatePos()
    window.addEventListener('resize', onScroll)
    scrollParent?.addEventListener('scroll', onScroll)
    return () => {
      window.removeEventListener('resize', onScroll)
      scrollParent?.removeEventListener('scroll', onScroll)
    }
  }, [open, updatePos])

  const activeAccounts = accounts.filter((a) => a.status === 'ACTIVE')

  return (
    <div ref={ref} className="relative">
      <label className="label">{label}</label>

      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input w-full flex items-center gap-3 text-left cursor-pointer group"
        style={{ paddingRight: '2.5rem' }}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 spin rounded-full" style={{ border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'rgba(6,182,212,0.6)' }} />
            <span className="text-slate-500 text-sm">Loading accounts…</span>
          </div>
        ) : selected ? (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}
            >
              {selected.cardNetwork ? <CreditCard size={14} className="text-cyan-400" /> : <Wallet size={14} className="text-cyan-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-medium">
                  {selected.cardNetwork || 'Account'} {selected.cardTier && <span className="text-slate-500">· {selected.cardTier}</span>}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono text-slate-500">{displayNumber(selected)}</span>
                <span className="text-xs text-slate-600">·</span>
                <span className="text-xs font-mono text-cyan-400">{formatBalance(selected.balance, selected.currency)}</span>
              </div>
            </div>
          </div>
        ) : (
          <span className="text-slate-500 text-sm">{placeholder}</span>
        )}

        <ChevronDown
          size={16}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown (portal) */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="rounded-xl overflow-hidden"
              style={{
                position: 'fixed',
                zIndex: 9999,
                top: pos.top,
                left: pos.left,
                width: pos.width,
                background: 'rgba(8, 8, 24, 0.95)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(6,182,212,0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
                maxHeight: '280px',
                overflowY: 'auto',
              }}
            >
            {activeAccounts.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500">No active accounts</div>
            ) : (
              activeAccounts.map((acc) => {
                const isSelected = acc.id === value
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => { onChange(acc.id); setOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 hover:bg-white/[0.04]"
                    style={isSelected ? { background: 'rgba(6,182,212,0.08)' } : {}}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isSelected ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isSelected ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {acc.cardNetwork
                        ? <CreditCard size={15} className={isSelected ? 'text-cyan-400' : 'text-slate-400'} />
                        : <Wallet size={15} className={isSelected ? 'text-cyan-400' : 'text-slate-400'} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {acc.cardNetwork || 'Account'}
                        </span>
                        {acc.cardTier && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              color: 'rgb(148,163,184)',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            {acc.cardTier}
                          </span>
                        )}
                        <span className="text-xs text-slate-600 font-mono">{acc.currency}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono text-slate-500">{displayNumber(acc)}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`text-sm font-mono font-medium ${isSelected ? 'text-cyan-400' : 'text-slate-300'}`}>
                        {formatBalance(acc.balance, acc.currency)}
                      </span>
                    </div>
                  </button>
                )
              })
            )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
