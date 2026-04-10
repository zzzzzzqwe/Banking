import clsx from 'clsx'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: 'cyan' | 'purple' | 'blue' | 'none'
  padding?: boolean
}

export function GlassCard({ children, className, hover = true, glow = 'none', padding = true }: Props) {
  return (
    <div
      className={clsx(
        'glass rounded-2xl',
        padding && 'p-6',
        hover && 'card-glow cursor-default',
        glow === 'cyan'   && 'border-cyan-500/20',
        glow === 'purple' && 'border-purple-500/20',
        glow === 'blue'   && 'border-blue-500/20',
        className
      )}
      style={
        glow !== 'none'
          ? {
              boxShadow:
                glow === 'cyan'   ? '0 0 40px rgba(6,182,212,0.06)'   :
                glow === 'purple' ? '0 0 40px rgba(168,85,247,0.06)'  :
                                    '0 0 40px rgba(59,130,246,0.06)',
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}
