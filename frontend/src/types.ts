export type Role = 'USER' | 'ADMIN'

export interface AuthResponse {
  token: string | null
  userId: string
  role: Role
  firstName: string
  lastName: string
}

export type CardNetwork = 'VISA' | 'MASTERCARD'
export type CardTier = 'STANDARD' | 'PREMIUM' | 'DELUXE'

export interface Account {
  id: string
  ownerId: string
  balance: number
  currency: string
  status: 'ACTIVE' | 'CLOSED'
  createdAt: string
  cardNetwork: CardNetwork | null
  cardTier: CardTier | null
}

export interface Transaction {
  id: string
  type: string
  currency: string
  amount: number
  createdAt: string
  category?: string
}

export interface ExchangeRecord {
  id: string
  fromAccountId: string
  toAccountId: string
  fromAmount: number
  toAmount: number
  fromCurrency: string
  toCurrency: string
  exchangeRate: number
  createdAt: string
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
}

export interface DailyAggregate {
  date: string
  income: number
  expense: number
}

export interface AnalyticsResponse {
  totalIncome: number
  totalExpense: number
  net: number
  categoryBreakdown: CategoryBreakdown[]
  dailyAggregates: DailyAggregate[]
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export type LoanStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'CLOSED'
export type RepaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE'

export interface Loan {
  id: string
  borrowerId: string
  accountId: string
  principalAmount: number
  annualInterestRate: number
  termMonths: number
  monthlyPayment: number | null
  status: LoanStatus
  startDate: string | null
  endDate: string | null
  createdAt: string
}

export interface RepaymentEntry {
  installmentNumber: number
  dueDate: string
  principal: number
  interest: number
  totalPayment: number
  status: RepaymentStatus
  paidAt: string | null
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  active: boolean
  role: Role
  createdAt: string
}
