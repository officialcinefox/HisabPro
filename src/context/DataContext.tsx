import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CustomerWithBalance, DashboardSummary, Expense, Reminder, Transaction } from '../types';
import { useAuth } from './AuthContext';
import { dataService } from '../services/dataService';
import {
  calculateDashboardSummary,
  enrichCustomersWithBalances,
} from '../utils/calculations';

interface DataContextType {
  customers: CustomerWithBalance[];
  transactions: Transaction[];
  expenses: Expense[];
  reminders: Reminder[];
  dashboardSummary: DashboardSummary;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  getCustomerById: (id: string) => CustomerWithBalance | undefined;
  getCustomerTransactions: (customerId: string) => Transaction[];
  getCustomerReminders: (customerId: string) => Reminder[];
}

const defaultSummary: DashboardSummary = {
  totalGiven: 0,
  totalReceived: 0,
  lenaHai: 0,
  denaHai: 0,
  netBalance: 0,
  todayCount: 0,
  todayAmount: 0,
  monthExpenses: 0,
};

const DataContext = createContext<DataContextType>({
  customers: [],
  transactions: [],
  expenses: [],
  reminders: [],
  dashboardSummary: defaultSummary,
  isLoading: true,
  refreshData: async () => {},
  getCustomerById: () => undefined,
  getCustomerTransactions: () => [],
  getCustomerReminders: () => [],
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>(defaultSummary);
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = useCallback(async () => {
    if (!user) {
      setCustomers([]);
      setTransactions([]);
      setExpenses([]);
      setReminders([]);
      setDashboardSummary(defaultSummary);
      setIsLoading(false);
      return;
    }

    try {
      const [custRes, txRes, expRes, remRes] = await Promise.all([
        dataService.getCustomers(user.id),
        dataService.getTransactions(user.id),
        dataService.getExpenses(user.id),
        dataService.getReminders(user.id),
      ]);

      const rawCustomers = custRes.data || [];
      const rawTx = txRes.data || [];
      const rawExp = expRes.data || [];
      const rawRem = remRes.data || [];

      const enriched = enrichCustomersWithBalances(rawCustomers, rawTx, rawRem);
      const summary = calculateDashboardSummary(enriched, rawTx, rawExp);

      setCustomers(enriched);
      setTransactions(rawTx);
      setExpenses(rawExp);
      setReminders(rawRem);
      setDashboardSummary(summary);
    } catch (e) {
      console.warn('Error loading hisab data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const getCustomerById = (id: string) => {
    return customers.find((c) => c.id === id);
  };

  const getCustomerTransactions = (customerId: string) => {
    return transactions.filter((t) => t.customer_id === customerId);
  };

  const getCustomerReminders = (customerId: string) => {
    return reminders.filter((r) => r.customer_id === customerId);
  };

  return (
    <DataContext.Provider
      value={{
        customers,
        transactions,
        expenses,
        reminders,
        dashboardSummary,
        isLoading,
        refreshData: loadAll,
        getCustomerById,
        getCustomerTransactions,
        getCustomerReminders,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
