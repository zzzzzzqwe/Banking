import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage }       from './pages/LoginPage'
import { RegisterPage }    from './pages/RegisterPage'
import { DashboardPage }   from './pages/DashboardPage'
import { AccountsPage }    from './pages/AccountsPage'
import { TransfersPage }   from './pages/TransfersPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { LoansPage }       from './pages/LoansPage'
import { AdminUsersPage }    from './pages/admin/AdminUsersPage'
import { AdminAccountsPage } from './pages/admin/AdminAccountsPage'
import { AdminLoansPage }    from './pages/admin/AdminLoansPage'
import { ProfilePage }       from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"    element={<DashboardPage />} />
          <Route path="/accounts"     element={<AccountsPage />} />
          <Route path="/transfers"    element={<TransfersPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/loans"        element={<LoansPage />} />
          <Route path="/profile"      element={<ProfilePage />} />

          {/* Admin only */}
          <Route path="/admin/users"    element={<ProtectedRoute adminOnly><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/accounts" element={<ProtectedRoute adminOnly><AdminAccountsPage /></ProtectedRoute>} />
          <Route path="/admin/loans"    element={<ProtectedRoute adminOnly><AdminLoansPage /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
