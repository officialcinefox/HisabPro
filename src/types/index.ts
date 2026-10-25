export type TransactionType = 'you_gave' | 'you_got';
export type CustomerStatus = 'lena_hai' | 'dena_hai' | 'settled';
export type ExpenseCategory = 'Food' | 'Travel' | 'Shopping' | 'Bills' | 'Other';
export type ReminderStatus = 'pending' | 'completed' | 'dismissed';

export interface Profile {
  id: string;
  display_name: string;
  email: string;
  phone?: string | null;
  avatar_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  customer_id: string;
  transaction_type: TransactionType;
  amount: number;
  transaction_date: string; // YYYY-MM-DD
  note?: string | null;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  customer_id: string;
  amount: number;
  reminder_date: string; // YYYY-MM-DD
  note?: string | null;
  status: ReminderStatus;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: ExpenseCategory;
  expense_date: string; // YYYY-MM-DD
  note?: string | null;
  created_at: string;
}

export interface CustomerBalance {
  totalGave: number;
  totalGot: number;
  netBalance: number; // totalGave - totalGot
  status: CustomerStatus;
  displayAmount: number; // absolute amount
}

export interface CustomerWithBalance extends Customer {
  totalGave: number;
  totalGot: number;
  netBalance: number;
  status: CustomerStatus;
  displayAmount: number;
  transactionCount: number;
  pendingRemindersCount: number;
  lastTransactionDate?: string | null;
}

export interface DashboardSummary {
  totalGiven: number; // Lifetime sum of you_gave
  totalReceived: number; // Lifetime sum of you_got
  lenaHai: number; // Sum of positive customer balances
  denaHai: number; // Sum of absolute negative customer balances
  netBalance: number; // lenaHai - denaHai
  todayCount: number;
  todayAmount: number;
  monthExpenses: number;
}

export interface CategoryExpenseSummary {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

// Navigation Param Lists
export type RootStackParamList = {
  Auth: undefined;
  Main: { screen?: keyof MainTabParamList } | undefined;
  CustomerDetail: { customerId: string };
  AddCustomer: undefined;
  AddTransaction: { customerId: string; initialType?: TransactionType };
  AddReminder: { customerId: string };
  CustomerReport: { customerId: string };
  AddExpense: undefined;
  EditProfile: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
  Notifications: undefined;
  HelpSupport: undefined;
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  VerifyOtp: { email: string };
  ResetPassword: { email: string };
};

export type MainTabParamList = {
  Home: undefined;
  Customers: undefined;
  Expenses: undefined;
  Profile: undefined;
};
