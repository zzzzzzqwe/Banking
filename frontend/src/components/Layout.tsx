import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar, MobileSidebar } from './Sidebar'
import { AnimatedBackground } from './AnimatedBackground'
import { ToastContainer } from './Toast'
import { NotificationBell } from './NotificationBell'
import { useAuthStore } from '../store/useAuthStore'
import { useNotificationStore } from '../store/useNotificationStore'

export function Layout() {
  const token = useAuthStore((s) => s.token)
  const connect = useNotificationStore((s) => s.connect)
  const disconnect = useNotificationStore((s) => s.disconnect)
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (token) {
      connect(token)
      fetchUnreadCount()
    }
    return () => disconnect()
  }, [token])

  return (
    <div className="flex h-screen overflow-hidden bg-space-950">
      <AnimatedBackground />
      <Sidebar />
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 sm:px-8 py-3 border-b border-white/[0.05] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all md:hidden"
          >
            <Menu size={18} />
          </button>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full p-4 sm:p-6 md:p-8">
            <Outlet />
          </div>
        </div>
      </main>

      <ToastContainer />
    </div>
  )
}
