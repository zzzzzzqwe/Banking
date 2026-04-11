import { motion } from 'framer-motion'

/* ─── Base block ─────────────────────────────────────────── */
function Sk({ w = 'w-full', h = 'h-4', rounded = 'rounded-lg', className = '' }) {
  return <div className={`shimmer ${w} ${h} ${rounded} ${className}`} />
}

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4 } }

/* ─── Dashboard skeleton ─────────────────────────────────── */
export function DashboardSkeleton() {
  return (
    <motion.div {...fade} className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Sk w="w-28" h="h-3" />
          <Sk w="w-48" h="h-7" />
        </div>
        <Sk w="w-32" h="h-9" rounded="rounded-xl" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Sk w="w-20" h="h-3" />
              <Sk w="w-8" h="h-8" rounded="rounded-xl" />
            </div>
            <Sk w="w-24" h="h-8" />
            <Sk w="w-16" h="h-2.5" />
          </div>
        ))}
      </div>

      {/* Chart + accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Sk w="w-32" h="h-3" />
              <Sk w="w-40" h="h-9" />
            </div>
            <div className="text-right space-y-1.5">
              <Sk w="w-20" h="h-3" />
              <Sk w="w-14" h="h-3" />
            </div>
          </div>
          <Sk w="w-full" h="h-[120px]" rounded="rounded-xl" />
        </div>

        {/* Accounts list */}
        <div className="glass rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <Sk w="w-28" h="h-3" />
            <Sk w="w-14" h="h-3" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Sk w="w-8" h="h-8" rounded="rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Sk w="w-24" h="h-2.5" />
                <Sk w="w-16" h="h-3.5" />
              </div>
              <Sk w="w-4" h="h-4" rounded="rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Loans table */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <Sk w="w-28" h="h-3" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <Sk w="w-28" h="h-3" />
              <Sk w="w-20" h="h-3" />
              <Sk w="w-12" h="h-3" />
              <Sk w="w-16" h="h-3" />
              <Sk w="w-20" h="h-3" />
              <Sk w="w-16" h="h-5" rounded="rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Accounts skeleton ──────────────────────────────────── */
export function AccountsSkeleton() {
  return (
    <motion.div {...fade} className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Sk w="w-32" h="h-7" />
          <Sk w="w-24" h="h-3" />
        </div>
        <div className="flex gap-3">
          <Sk w="w-10" h="h-9" rounded="rounded-xl" />
          <Sk w="w-36" h="h-9" rounded="rounded-xl" />
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 space-y-4">
            {/* Card header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Sk w="w-10" h="h-10" rounded="rounded-xl" />
                <div className="space-y-1.5">
                  <Sk w="w-28" h="h-2.5" />
                  <Sk w="w-14" h="h-5" rounded="rounded-full" />
                </div>
              </div>
              <Sk w="w-5" h="h-5" rounded="rounded-md" />
            </div>
            {/* Balance */}
            <div className="space-y-1">
              <Sk w="w-16" h="h-2.5" />
              <Sk w="w-36" h="h-9" />
            </div>
            {/* Date */}
            <Sk w="w-32" h="h-2.5" />
            {/* Buttons */}
            <div className="flex gap-2 mt-2">
              <Sk w="w-full" h="h-9" rounded="rounded-xl" />
              <Sk w="w-full" h="h-9" rounded="rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/* ─── Loans skeleton ─────────────────────────────────────── */
export function LoansSkeleton() {
  return (
    <motion.div {...fade} className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Sk w="w-24" h="h-7" />
          <Sk w="w-20" h="h-3" />
        </div>
        <div className="flex gap-3">
          <Sk w="w-10" h="h-9" rounded="rounded-xl" />
          <Sk w="w-36" h="h-9" rounded="rounded-xl" />
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 space-y-4">
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <Sk w="w-32" h="h-2.5" />
                <Sk w="w-16" h="h-5" rounded="rounded-full" />
              </div>
              <div className="text-right space-y-1.5">
                <Sk w="w-28" h="h-8" />
                <Sk w="w-20" h="h-2.5" />
              </div>
            </div>
            {/* 3 info boxes */}
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="rounded-xl p-2.5 space-y-1.5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <Sk w="w-full" h="h-2" />
                  <Sk w="w-3/4" h="h-3" className="mx-auto" />
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Sk w="w-24" h="h-2.5" />
                <Sk w="w-8" h="h-2.5" />
              </div>
              <Sk w="w-full" h="h-1" rounded="rounded-full" />
            </div>
            {/* Buttons */}
            <div className="flex gap-2">
              <Sk w="w-full" h="h-9" rounded="rounded-xl" />
              <Sk w="w-full" h="h-9" rounded="rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/* ─── Profile skeleton ───────────────────────────────────── */
export function ProfileSkeleton() {
  return (
    <motion.div {...fade} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Sk w="w-24" h="h-7" />
        <Sk w="w-64" h="h-3" />
      </div>

      {/* Hero card */}
      <div className="glass rounded-2xl overflow-hidden">
        <Sk w="w-full" h="h-28" rounded="rounded-none" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-5 -mt-12 mb-5">
            <Sk w="w-24" h="h-24" rounded="rounded-2xl" />
            <div className="pb-1 space-y-2">
              <Sk w="w-40" h="h-6" />
              <div className="flex gap-2">
                <Sk w="w-14" h="h-5" rounded="rounded-full" />
                <Sk w="w-36" h="h-5" />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 rounded-2xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <Sk w="w-8" h="h-8" rounded="rounded-xl" className="mx-auto" />
                <Sk w="w-3/4" h="h-5" className="mx-auto" />
                <Sk w="w-1/2" h="h-2.5" className="mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Sk w="w-9" h="h-9" rounded="rounded-xl" />
              <div className="space-y-1.5">
                <Sk w="w-36" h="h-3.5" />
                <Sk w="w-24" h="h-2.5" />
              </div>
            </div>
            {[...Array(4)].map((_, j) => (
              <div key={j} className="space-y-1.5">
                <Sk w="w-20" h="h-2.5" />
                <Sk w="w-full" h="h-10" rounded="rounded-xl" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
