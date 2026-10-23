import {
  Customer,
  CustomerBalance,
  CustomerStatus,
  CustomerWithBalance,
  DashboardSummary,
  Expense,
  Reminder,
  Transaction,
} from '../types';
import { getTodayDateString } from './formatting';

/**
 * Calculate balance for a single customer from their transactions:
 * Customer Balance = Sum of You Gave transactions − Sum of You Got transactions
 */
export const calculateCustomerBalance = (transactions: Transaction[]): CustomerBalance => {
  let totalGave = 0;
  let totalGot = 0;

  for (const tx of transactions) {
    const amount = Number(tx.amount) || 0;
    if (tx.transaction_type === 'you_gave') {
      totalGave += amount;
    } else if (tx.transaction_type === 'you_got') {
      totalGot += amount;
    }
  }

  // Round safely to 2 decimal places to prevent floating point inaccuracies
  totalGave = Math.round(totalGave * 100) / 100;
  totalGot = Math.round(totalGot * 100) / 100;
  const netBalance = Math.round((totalGave - totalGot) * 100) / 100;

  let status: CustomerStatus = 'settled';
  if (netBalance > 0.001) {
    status = 'lena_hai'; // Positive balance: Lena Hai (Customer owes user)
  } else if (netBalance < -0.001) {
    status = 'dena_hai'; // Negative balance: Dena Hai (User owes customer)
  } else {
    status = 'settled';
  }

  return {
    totalGave,
    totalGot,
    netBalance,
    status,
    displayAmount: Math.abs(netBalance),
  };
};

/**
 * Calculate balances for all customers and attach transaction/reminder metadata
 */
export const enrichCustomersWithBalances = (
  customers: Customer[],
  transactions: Transaction[],
  reminders: Reminder[] = []
): CustomerWithBalance[] => {
  // Group transactions by customer_id
  const txByCustomer: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    if (!txByCustomer[tx.customer_id]) {
      txByCustomer[tx.customer_id] = [];
    }
    txByCustomer[tx.customer_id].push(tx);
  }

  // Count pending reminders by customer_id
  const remindersByCustomer: Record<string, number> = {};
  for (const rem of reminders) {
    if (rem.status === 'pending') {
      remindersByCustomer[rem.customer_id] = (remindersByCustomer[rem.customer_id] || 0) + 1;
    }
  }

  return customers.map((customer) => {
    const customerTx = txByCustomer[customer.id] || [];
    const balance = calculateCustomerBalance(customerTx);
    const pendingRemindersCount = remindersByCustomer[customer.id] || 0;

    return {
      ...customer,
      ...balance,
      transactionCount: customerTx.length,
      pendingRemindersCount,
    };
  });
};

/**
 * Calculate Dashboard Totals as per Section 9:
 * - Total Given = sum of all You Gave transactions
 * - Total Received = sum of all You Got transactions
 * - Lena Hai = sum of positive customer balances
 * - Dena Hai = sum of absolute values of negative customer balances
 * - Net Balance = Lena Hai − Dena Hai
 */
export const calculateDashboardSummary = (
  enrichedCustomers: CustomerWithBalance[],
  allTransactions: Transaction[],
  allExpenses: Expense[] = []
): DashboardSummary => {
  let totalGiven = 0;
  let totalReceived = 0;
  let todayCount = 0;
  let todayAmount = 0;
  const todayDateStr = getTodayDateString();

  for (const tx of allTransactions) {
    const amount = Number(tx.amount) || 0;
    if (tx.transaction_type === 'you_gave') {
      totalGiven += amount;
    } else if (tx.transaction_type === 'you_got') {
      totalReceived += amount;
    }

    if (tx.transaction_date === todayDateStr) {
      todayCount += 1;
      todayAmount += amount;
    }
  }

  let lenaHai = 0;
  let denaHai = 0;

  for (const c of enrichedCustomers) {
    if (c.status === 'lena_hai') {
      lenaHai += c.displayAmount;
    } else if (c.status === 'dena_hai') {
      denaHai += c.displayAmount;
    }
  }

  // Round values
  totalGiven = Math.round(totalGiven * 100) / 100;
  totalReceived = Math.round(totalReceived * 100) / 100;
  lenaHai = Math.round(lenaHai * 100) / 100;
  denaHai = Math.round(denaHai * 100) / 100;
  const netBalance = Math.round((lenaHai - denaHai) * 100) / 100;
  todayAmount = Math.round(todayAmount * 100) / 100;

  // Calculate current month's expenses
  const currentMonthPrefix = todayDateStr.substring(0, 7); // YYYY-MM
  let monthExpenses = 0;
  for (const exp of allExpenses) {
    if (exp.expense_date.startsWith(currentMonthPrefix)) {
      monthExpenses += Number(exp.amount) || 0;
    }
  }
  monthExpenses = Math.round(monthExpenses * 100) / 100;

  return {
    totalGiven,
    totalReceived,
    lenaHai,
    denaHai,
    netBalance,
    todayCount,
    todayAmount,
    monthExpenses,
  };
};
