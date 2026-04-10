import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore } from '../store/useToastStore'
import clsx from 'clsx'

const iconMap = {
  success: { Icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  error:   { Icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
  warning: { Icon: AlertTriangle, color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
  info:    { Icon: Info,          color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/20' },
}

export function ToastContainer() {
  const { toasts, remove } = useToastStore()

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const { Icon, color, bg } = iconMap[t.type]
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={clsx(
                'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border',
                'backdrop-blur-xl shadow-2xl min-w-[280px] max-w-sm',
                bg
              )}
            >
              <Icon size={16} className={clsx(color, 'flex-shrink-0')} />
              <span className="text-sm text-slate-200 flex-1">{t.message}</span>
              <button onClick={() => remove(t.id)} className="text-slate-500 hover:text-slate-300 flex-shrink-0">
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
