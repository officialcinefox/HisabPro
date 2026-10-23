import { supabase } from '../config/supabase';
import { Customer, Expense, Reminder, Transaction } from '../types';

export const dataService = {
  // Customers
  async getCustomers(userId: string): Promise<{ data: Customer[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return { data: [], error: error.message };
      return { data: (data as Customer[]) || [], error: null };
    } catch (e: any) {
      return { data: [], error: e.message || 'Failed to load customers' };
    }
  },

  async createCustomer(
    userId: string,
    name: string,
    phone?: string | null,
    notes?: string | null
  ): Promise<{ data: Customer | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          user_id: userId,
          name: name.trim(),
          phone: phone?.trim() || null,
          notes: notes?.trim() || null,
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Customer, error: null };
    } catch (e: any) {
      return { data: null, error: e.message || 'Failed to create customer' };
    }
  },

  async deleteCustomer(customerId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.from('customers').delete().eq('id', customerId);
      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Failed to delete customer' };
    }
  },

  // Transactions
  async getTransactions(
    userId: string,
    customerId?: string
  ): Promise<{ data: Transaction[]; error: string | null }> {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query;
      if (error) return { data: [], error: error.message };
      return { data: (data as Transaction[]) || [], error: null };
    } catch (e: any) {
      return { data: [], error: e.message || 'Failed to load transactions' };
    }
  },

  async createTransaction(
    userId: string,
    customerId: string,
    transactionType: 'you_gave' | 'you_got',
    amount: number,
    transactionDate: string,
    note?: string | null
  ): Promise<{ data: Transaction | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          customer_id: customerId,
          transaction_type: transactionType,
          amount: Math.abs(amount),
          transaction_date: transactionDate,
          note: note?.trim() || null,
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Transaction, error: null };
    } catch (e: any) {
      return { data: null, error: e.message || 'Failed to record transaction' };
    }
  },

  async deleteTransaction(transactionId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Failed to delete transaction' };
    }
  },

  // Reminders
  async getReminders(
    userId: string,
    customerId?: string
  ): Promise<{ data: Reminder[]; error: string | null }> {
    try {
      let query = supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('reminder_date', { ascending: true });

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query;
      if (error) return { data: [], error: error.message };
      return { data: (data as Reminder[]) || [], error: null };
    } catch (e: any) {
      return { data: [], error: e.message || 'Failed to load reminders' };
    }
  },

  async createReminder(
    userId: string,
    customerId: string,
    amount: number,
    reminderDate: string,
    note?: string | null
  ): Promise<{ data: Reminder | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: userId,
          customer_id: customerId,
          amount: Math.abs(amount),
          reminder_date: reminderDate,
          note: note?.trim() || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Reminder, error: null };
    } catch (e: any) {
      return { data: null, error: e.message || 'Failed to create reminder' };
    }
  },

  async updateReminderStatus(
    reminderId: string,
    status: 'pending' | 'completed' | 'dismissed'
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ status })
        .eq('id', reminderId);
      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Failed to update reminder' };
    }
  },

  async deleteReminder(reminderId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.from('reminders').delete().eq('id', reminderId);
      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Failed to delete reminder' };
    }
  },

  // Expenses
  async getExpenses(userId: string): Promise<{ data: Expense[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) return { data: [], error: error.message };
      return { data: (data as Expense[]) || [], error: null };
    } catch (e: any) {
      return { data: [], error: e.message || 'Failed to load expenses' };
    }
  },

  async createExpense(
    userId: string,
    amount: number,
    category: 'Food' | 'Travel' | 'Shopping' | 'Bills' | 'Other',
    expenseDate: string,
    note?: string | null
  ): Promise<{ data: Expense | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: userId,
          amount: Math.abs(amount),
          category,
          expense_date: expenseDate,
          note: note?.trim() || null,
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Expense, error: null };
    } catch (e: any) {
      return { data: null, error: e.message || 'Failed to add expense' };
    }
  },

  async deleteExpense(expenseId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Failed to delete expense' };
    }
  },
};
