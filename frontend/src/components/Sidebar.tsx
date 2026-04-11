import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Wallet, ArrowLeftRight, ClipboardList,
  CreditCard, Users, ShieldCheck, LogOut, ChevronRight,
  Hexagon, UserCircle
} from 'lucide-react'
import clsx from 'clsx'
import { useAuthStore } from '../store/useAuthStore'

interface NavItem {
  to: string
  icon: typeof LayoutDashboard
  label: string
  adminOnly?: boolean
}

const userNav: NavItem[] = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/accounts',     icon: Wallet,          label: 'Accounts' },
  { to: '/transfers',    icon: ArrowLeftRight,  label: 'Transfers' },
  { to: '/transactions', icon: ClipboardList,   label: 'Transactions' },
  { to: '/loans',        icon: CreditCard,      label: 'Loans' },
  { to: '/profile',      icon: UserCircle,      label: 'Profile' },
]

const adminNav: NavItem[] = [
  { to: '/admin/users',    icon: Users,       label: 'Users',     adminOnly: true },
  { to: '/admin/accounts', icon: Wallet,      label: 'Accounts',  adminOnly: true },
  { to: '/admin/loans',    icon: ShieldCheck, label: 'Loans',     adminOnly: true },
]

export function Sidebar() {
  const { userId, role, firstName, lastName, logout } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin = role === 'ADMIN'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-60 flex-shrink-0 flex flex-col h-screen glass-heavy border-r border-white/[0.05]"
    >
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="relative">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(6,182,212,0.3)' }}
          >
            <Hexagon size={18} className="text-cyan-400" />
          </div>
          <div
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse-glow"
            style={{ boxShadow: '0 0 6px rgba(6,182,212,0.8)' }}
          />
        </div>
        <div>
          <span className="text-sm font-bold tracking-widest gradient-text">NEXUS</span>
          <p className="text-[10px] text-slate-600 tracking-wider uppercase">Banking</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {/* User nav */}
        <div className="mb-6">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest px-2 mb-2">Navigation</p>
          <nav className="space-y-1">
            {userNav.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group',
                    isActive
                      ? 'nav-active'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={16}
                      className={clsx(
                        'flex-shrink-0 transition-colors',
                        isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                      )}
                    />
                    <span className="font-medium">{label}</span>
                    {isActive && (
                      <ChevronRight size={12} className="ml-auto text-cyan-400/50" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Admin nav */}
        {isAdmin && (
          <div>
            <div className="flex items-center gap-2 px-2 mb-2">
              <p className="text-[10px] text-orange-500/60 uppercase tracking-widest">Admin</p>
              <div className="flex-1 h-px bg-orange-500/10" />
            </div>
            <nav className="space-y-1">
              {adminNav.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group',
                      isActive
                        ? 'bg-orange-500/10 border-l-2 border-orange-400 text-orange-300'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={16}
                        className={clsx(
                          'flex-shrink-0',
                          isActive ? 'text-orange-400' : 'text-slate-600 group-hover:text-slate-400'
                        )}
                      />
                      <span className="font-medium">{label}</span>
                      {isActive && <ChevronRight size={12} className="ml-auto text-orange-400/50" />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/[0.05]">
        <NavLink to="/profile" className={({ isActive }) => clsx(
          'glass rounded-xl px-3 py-2.5 mb-2 block transition-all duration-200',
          isActive ? 'border-cyan-500/25' : 'hover:bg-white/[0.03]'
        )}>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(6,182,212,0.2)' }}
            >
              <span style={{ background: 'linear-gradient(135deg, #06b6d4, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : (isAdmin ? '⬡' : '◇')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 font-medium truncate">
                {firstName && lastName ? `${firstName} ${lastName}` : (userId ? userId.slice(0, 8) + '…' : 'User')}
              </p>
              <p className={clsx(
                'text-[10px] font-medium',
                isAdmin ? 'text-orange-400' : 'text-cyan-400'
              )}>
                {role}
              </p>
            </div>
          </div>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/[0.08] transition-all duration-200 group"
        >
          <LogOut size={14} className="group-hover:text-red-400" />
          <span>Log out</span>
        </button>
      </div>
    </motion.aside>
  )
}
