import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { AnimatedBackground } from './AnimatedBackground'
import { ToastContainer } from './Toast'
import { useLocation } from 'react-router-dom'

export function Layout() {
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden bg-space-950">
      <AnimatedBackground />
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="sync">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-full p-8"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <ToastContainer />
    </div>
  )
}
