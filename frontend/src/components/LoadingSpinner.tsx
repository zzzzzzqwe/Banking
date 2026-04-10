import clsx from 'clsx'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: Props) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-10 h-10'
  const b = size === 'sm' ? 'border-2' : 'border-2'

  return (
    <div className={clsx('inline-flex items-center justify-center', className)}>
      <div
        className={clsx(s, b, 'spin rounded-full')}
        style={{ borderColor: 'rgba(6,182,212,0.2)', borderTopColor: '#06b6d4' }}
      />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div
          className="w-12 h-12 spin rounded-full mx-auto mb-4"
          style={{ border: '2px solid rgba(6,182,212,0.15)', borderTopColor: '#06b6d4' }}
        />
        <p className="text-xs text-slate-500 uppercase tracking-widest">Loading</p>
      </div>
    </div>
  )
}

export function SkeletonLine({ className }: { className?: string }) {
  return <div className={clsx('shimmer rounded-lg h-4', className)} />
}
