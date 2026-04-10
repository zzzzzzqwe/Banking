import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  prefix?: string
  suffix?: string
  icon: LucideIcon
  color: 'cyan' | 'purple' | 'blue' | 'emerald' | 'amber'
  animateNumber?: boolean
  subtext?: string
  delay?: number
}

const colorMap = {
  cyan:    { icon: 'text-cyan-400',    bg: 'rgba(6,182,212,0.08)',    border: 'rgba(6,182,212,0.15)',    glow: 'rgba(6,182,212,0.2)' },
  purple:  { icon: 'text-purple-400',  bg: 'rgba(168,85,247,0.08)',   border: 'rgba(168,85,247,0.15)',   glow: 'rgba(168,85,247,0.2)' },
  blue:    { icon: 'text-blue-400',    bg: 'rgba(59,130,246,0.08)',   border: 'rgba(59,130,246,0.15)',   glow: 'rgba(59,130,246,0.2)' },
  emerald: { icon: 'text-emerald-400', bg: 'rgba(52,211,153,0.08)',   border: 'rgba(52,211,153,0.15)',   glow: 'rgba(52,211,153,0.2)' },
  amber:   { icon: 'text-amber-400',   bg: 'rgba(251,191,36,0.08)',   border: 'rgba(251,191,36,0.15)',   glow: 'rgba(251,191,36,0.2)' },
}

function useCountUp(target: number, duration = 1200) {
  const [current, setCurrent] = useState(0)
  const start = useRef<number | null>(null)

  useEffect(() => {
    start.current = null
    const step = (ts: number) => {
      if (!start.current) start.current = ts
      const prog = Math.min((ts - start.current) / duration, 1)
      const eased = 1 - Math.pow(1 - prog, 3) // cubic ease-out
      setCurrent(eased * target)
      if (prog < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])

  return current
}

export function StatCard({ label, value, prefix = '', suffix = '', icon: Icon, color, animateNumber = false, subtext, delay = 0 }: Props) {
  const c = colorMap[color]
  const numericValue = typeof value === 'number' ? value : 0
  const countedValue = useCountUp(animateNumber ? numericValue : 0, 1200)

  const displayValue = animateNumber && typeof value === 'number'
    ? (value >= 1000 ? countedValue.toFixed(2) : countedValue.toFixed(2))
    : value

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass rounded-2xl p-5 card-glow relative overflow-hidden"
      style={{ borderColor: c.border }}
    >
      {/* Background glow spot */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: c.glow, filter: 'blur(30px)', opacity: 0.5 }}
      />

      <div className="flex items-start justify-between relative">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <p className={clsx('text-2xl font-bold num mt-1', animateNumber ? 'text-white' : 'text-white')}>
            <span className="text-slate-400 text-sm mr-0.5">{prefix}</span>
            {animateNumber ? displayValue : value}
            {suffix && <span className="text-slate-400 text-sm ml-0.5">{suffix}</span>}
          </p>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>

        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}
        >
          <Icon size={18} className={c.icon} />
        </div>
      </div>
    </motion.div>
  )
}
