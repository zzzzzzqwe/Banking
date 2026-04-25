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
export type CardType = 'PHYSICAL' | 'VIRTUAL'
export type CardStatus = 'ACTIVE' | 'BLOCKED' | 'CLOSED'

/**
 * A Card is the primary money-holding entity owned by a user.
 * Kept as `Account` for legacy API-path compatibility, but represents a card in the UX.
 */
export interface Account {
  id: string
  ownerId: string
  balance: number
  currency: string
  status: CardStatus
  createdAt: string
  cardNetwork: CardNetwork | null
  cardTier: CardTier | null
  cardNumber: string | null
  cardType: CardType | null
  dailyLimit: number | null
  expiryDate: string | null
  holderName: string | null
}

export type Card = Account

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

export type CardRequestType = 'BLOCK' | 'UNBLOCK'
export type CardRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface CardRequest {
  id: string
  userId: string
  accountId: string
  requestType: CardRequestType
  status: CardRequestStatus
  createdAt: string
  resolvedAt: string | null
  cardNumber: string | null
  holderName: string | null
}

export type NotificationType =
  | 'TRANSFER_RECEIVED'
  | 'LOAN_APPROVED'
  | 'LOAN_REJECTED'
  | 'GOAL_COMPLETED'
  | 'LOAN_REPAYMENT'
  | 'INSTALLMENT_OVERDUE'
  | 'CARD_REQUEST_APPROVED'
  | 'CARD_REQUEST_REJECTED'
  | 'SYSTEM'

export interface AppNotification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
}

export interface Beneficiary {
  id: string
  nickname: string
  accountNumber: string
  accountId: string | null
  bankName: string | null
  holderName: string | null
  currency: string
  favorite: boolean
  createdAt: string
  lastUsedAt: string | null
  internal: boolean
}

export interface Category {
  id: string
  code: string
  name: string
  icon: string | null
  color: string | null
  type: 'INCOME' | 'EXPENSE'
  system: boolean
}

export type BudgetPeriod = 'WEEKLY' | 'MONTHLY'

export interface Budget {
  id: string
  categoryId: string
  categoryCode: string | null
  categoryName: string | null
  categoryIcon: string | null
  categoryColor: string | null
  period: BudgetPeriod
  limitAmount: number
  currency: string
  alertThreshold: number | null
  startDate: string
  spent: number
  remaining: number
  percentUsed: number
  periodStart: string
  periodEnd: string
}

export interface AuditLogEntry {
  id: string
  userId: string | null
  userEmail: string
  action: string
  entityType: string | null
  entityId: string | null
  details: string | null
  ipAddress: string | null
  createdAt: string
}

export interface SavingsGoal {
  id: string
  userId: string
  accountId: string
  name: string
  description: string | null
  targetAmount: number
  currentAmount: number
  currency: string
  completed: boolean
  createdAt: string
  updatedAt: string
  completedAt: string | null
}
