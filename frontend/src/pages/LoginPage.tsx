import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn, Hexagon, Zap } from 'lucide-react'
import { login } from '../api/auth'
import { useAuthStore } from '../store/useAuthStore'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { ToastContainer } from '../components/Toast'
import { useToastStore } from '../store/useToastStore'
import type { Role } from '../types'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const push = useToastStore((s) => s.push)

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login({ email, password })
      setAuth(data.token!, data.userId, data.role as Role)
      push('Welcome back!', 'success')
      navigate('/dashboard')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid credentials'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-space-950 relative overflow-hidden">
      <AnimatedBackground />

      {/* Centered card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md mx-4 relative"
      >
        {/* Glow behind card */}
        <div
          className="absolute -inset-px rounded-2xl pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(168,85,247,0.1), transparent)', filter: 'blur(1px)' }}
        />

        <div className="glass-heavy rounded-2xl relative overflow-hidden"
          style={{ boxShadow: '0 0 80px rgba(6,182,212,0.06), 0 32px 80px rgba(0,0,0,0.5)' }}>

          {/* Top accent bar */}
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.6), rgba(168,85,247,0.4), transparent)' }} />

          <div className="px-8 pt-8 pb-9">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center mb-8"
            >
              <div className="relative mb-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(168,85,247,0.15))', border: '1px solid rgba(6,182,212,0.25)' }}
                >
                  <Hexagon size={32} className="text-cyan-400" />
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.4)' }}
                >
                  <Zap size={10} className="text-cyan-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-widest gradient-text">NEXUS BANK</h1>
              <p className="text-xs text-slate-500 mt-1 tracking-wider">Next-Generation Banking</p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@nexusbank.io"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-11"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 spin rounded-full" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                    <span>Authenticating…</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </motion.form>

            <p className="text-center text-xs text-slate-500 mt-6">
              No account?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                Create one
              </Link>
            </p>
          </div>

          {/* Bottom accent bar */}
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.3), rgba(6,182,212,0.2), transparent)' }} />
        </div>

        {/* Demo hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 text-center text-xs text-slate-600"
        >
          Admin: <span className="text-slate-500 font-mono">admin@bank.local</span> /
          <span className="text-slate-500 font-mono"> admin123</span>
        </motion.div>
      </motion.div>

      <ToastContainer />
    </div>
  )
}
