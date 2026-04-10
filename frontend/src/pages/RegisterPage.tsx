import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, Eye, EyeOff, Hexagon } from 'lucide-react'
import { register } from '../api/auth'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { ToastContainer } from '../components/Toast'
import { useToastStore } from '../store/useToastStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const push = useToastStore((s) => s.push)

  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form)
      push('Account created! Please log in.', 'success')
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-space-950 relative overflow-hidden">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4 relative"
      >
        <div className="glass-heavy rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 0 80px rgba(168,85,247,0.06), 0 32px 80px rgba(0,0,0,0.5)' }}>
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.6), rgba(6,182,212,0.4), transparent)' }} />

          <div className="px-8 pt-8 pb-9">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center mb-8"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(6,182,212,0.15))', border: '1px solid rgba(168,85,247,0.25)' }}
              >
                <Hexagon size={28} className="text-purple-400" />
              </div>
              <h1 className="text-xl font-bold tracking-widest" style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                CREATE ACCOUNT
              </h1>
              <p className="text-xs text-slate-500 mt-1">Join the future of banking</p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First Name</label>
                  <input type="text" value={form.firstName} onChange={set('firstName')} className="input" placeholder="Alex" required />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input type="text" value={form.lastName} onChange={set('lastName')} className="input" placeholder="Smith" required />
                </div>
              </div>

              <div>
                <label className="label">Email Address</label>
                <input type="email" value={form.email} onChange={set('email')} className="input" placeholder="you@nexusbank.io" required />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    className="input pr-11"
                    placeholder="Min. 6 characters"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </motion.p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-1"
                style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.9), rgba(6,182,212,0.8))' }}>
                {loading ? (
                  <><div className="w-4 h-4 spin rounded-full" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} /><span>Creating…</span></>
                ) : (
                  <><UserPlus size={16} /><span>Create Account</span></>
                )}
              </button>
            </motion.form>

            <p className="text-center text-xs text-slate-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">Sign in</Link>
            </p>
          </div>

          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.3), rgba(168,85,247,0.2), transparent)' }} />
        </div>
      </motion.div>

      <ToastContainer />
    </div>
  )
}
