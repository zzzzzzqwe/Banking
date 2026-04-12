import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hexagon } from 'lucide-react'
import { AnimatedBackground } from './AnimatedBackground'

const PHRASES = [
  'Your finances, your future.',
  'Every transaction tells a story.',
  'Smart money starts here.',
  'Make every dollar count.',
  'The best investment is your next move.',
  'Financial clarity, one click away.',
  'Your wealth, your rules.',
]

interface Props {
  firstName: string
  onComplete: () => void
}

export function WelcomeSplash({ firstName, onComplete }: Props) {
  const [phrase] = useState(() => PHRASES[Math.floor(Math.random() * PHRASES.length)])
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-space-950"
        >
          <AnimatedBackground />

          <div className="relative flex flex-col items-center text-center px-6">
            {/* Logo pulse */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="mb-8"
            >
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(168,85,247,0.15))',
                    border: '1px solid rgba(6,182,212,0.25)',
                  }}
                >
                  <Hexagon size={40} className="text-cyan-400" />
                </div>
                {/* Glow ring */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-2xl"
                  style={{ border: '1px solid rgba(6,182,212,0.4)' }}
                />
              </div>
            </motion.div>

            {/* Welcome text */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl font-bold text-white mb-3"
            >
              Welcome, <span className="gradient-text">{firstName}</span>.
            </motion.h1>

            {/* Motivational phrase */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-sm text-slate-400 tracking-wide"
            >
              {phrase}
            </motion.p>

            {/* Subtle line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-6 h-px w-32"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.5), transparent)' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
