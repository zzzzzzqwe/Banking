import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage }       from './pages/LoginPage'
import { RegisterPage }    from './pages/RegisterPage'
import { DashboardPage }   from './pages/DashboardPage'
import { TransfersPage }   from './pages/TransfersPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { LoansPage }       from './pages/LoansPage'
import { AdminUsersPage }    from './pages/admin/AdminUsersPage'
import { AdminAccountsPage } from './pages/admin/AdminAccountsPage'
import { AdminRequestsPage } from './pages/admin/AdminRequestsPage'
import { AdminAuditPage }    from './pages/admin/AdminAuditPage'
import { AdminStatsPage }    from './pages/admin/AdminStatsPage'
import { ProfilePage }       from './pages/ProfilePage'
import { ExchangePage }      from './pages/ExchangePage'
import { AnalyticsPage }     from './pages/AnalyticsPage'
import { SavingsGoalsPage }  from './pages/SavingsGoalsPage'
import { CardsPage }         from './pages/CardsPage'
import { BudgetsPage }       from './pages/BudgetsPage'
import { BeneficiariesPage } from './pages/BeneficiariesPage'

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
          <Route path="/accounts"     element={<Navigate to="/cards" replace />} />
          <Route path="/cards"        element={<CardsPage />} />
          <Route path="/budgets"      element={<BudgetsPage />} />
          <Route path="/beneficiaries" element={<BeneficiariesPage />} />
          <Route path="/transfers"    element={<TransfersPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/exchange"     element={<ExchangePage />} />
          <Route path="/analytics"    element={<AnalyticsPage />} />
          <Route path="/loans"        element={<LoansPage />} />
          <Route path="/savings-goals" element={<SavingsGoalsPage />} />
          <Route path="/profile"      element={<ProfilePage />} />

          {/* Admin only */}
          <Route path="/admin/stats"    element={<ProtectedRoute adminOnly><AdminStatsPage /></ProtectedRoute>} />
          <Route path="/admin/users"    element={<ProtectedRoute adminOnly><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/accounts" element={<ProtectedRoute adminOnly><AdminAccountsPage /></ProtectedRoute>} />
          <Route path="/admin/requests" element={<ProtectedRoute adminOnly><AdminRequestsPage /></ProtectedRoute>} />
          <Route path="/admin/audit"    element={<ProtectedRoute adminOnly><AdminAuditPage /></ProtectedRoute>} />
          <Route path="/admin/loans"    element={<Navigate to="/admin/requests" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
