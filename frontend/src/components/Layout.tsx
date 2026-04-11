import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { AnimatedBackground } from './AnimatedBackground'
import { ToastContainer } from './Toast'

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-space-950">
      <AnimatedBackground />
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-8">
          <Outlet />
        </div>
      </main>

      <ToastContainer />
    </div>
  )
}
