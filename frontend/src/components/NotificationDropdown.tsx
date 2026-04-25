import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowDownLeft, CheckCircle2, XCircle, Target, CreditCard,
  AlertTriangle, Bell, CheckCheck, Lock
} from 'lucide-react'
import clsx from 'clsx'
import { useNotificationStore } from '../store/useNotificationStore'
import { getNotifications, markAsRead, markAllAsRead } from '../api/notifications'
import type { AppNotification, NotificationType } from '../types'

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string }> = {
  TRANSFER_RECEIVED:  { icon: ArrowDownLeft,  color: 'text-emerald-400' },
  LOAN_APPROVED:      { icon: CheckCircle2,   color: 'text-cyan-400' },
  LOAN_REJECTED:      { icon: XCircle,        color: 'text-red-400' },
  GOAL_COMPLETED:     { icon: Target,         color: 'text-purple-400' },
  LOAN_REPAYMENT:     { icon: CreditCard,     color: 'text-blue-400' },
  INSTALLMENT_OVERDUE:    { icon: AlertTriangle,  color: 'text-amber-400' },
  CARD_REQUEST_APPROVED:  { icon: Lock,           color: 'text-emerald-400' },
  CARD_REQUEST_REJECTED:  { icon: Lock,           color: 'text-red-400' },
  SYSTEM:                 { icon: Bell,           color: 'text-slate-400' },
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

interface Props {
  onClose: () => void
}

export function NotificationDropdown({ onClose }: Props) {
  const { notifications, markRead, markAllRead: storeMarkAllRead } = useNotificationStore()
  const [items, setItems] = useState<AppNotification[]>(notifications)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotifications(0, 30)
      .then((page) => setItems(page.content))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleMarkRead = async (n: AppNotification) => {
    if (n.read) return
    try {
      await markAsRead(n.id)
      markRead(n.id)
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
    } catch { /* ignore */ }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead()
      storeMarkAllRead()
      setItems((prev) => prev.map((x) => ({ ...x, read: true })))
    } catch { /* ignore */ }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[360px] rounded-2xl border border-white/[0.08] backdrop-blur-2xl z-50 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(15,23,42,0.97), rgba(10,15,30,0.98))',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-slate-200">Notifications</h3>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <CheckCheck size={13} />
          Mark all read
        </button>
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={28} className="mx-auto mb-2 text-slate-600" />
            <p className="text-sm text-slate-500">No notifications yet</p>
          </div>
        ) : (
          items.map((n) => {
            const { icon: Icon, color } = typeConfig[n.type] ?? typeConfig.SYSTEM
            return (
              <button
                key={n.id}
                onClick={() => handleMarkRead(n)}
                className={clsx(
                  'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]',
                  !n.read && 'bg-cyan-500/[0.04]'
                )}
              >
                <div
                  className={clsx(
                    'mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                    'bg-white/[0.06]'
                  )}
                >
                  <Icon size={15} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={clsx('text-xs font-medium truncate', n.read ? 'text-slate-400' : 'text-slate-200')}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span
                        className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-400"
                        style={{ boxShadow: '0 0 4px rgba(6,182,212,0.6)' }}
                      />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </motion.div>
  )
}
