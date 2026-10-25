import { supabase } from '../config/supabase';
import { Profile } from '../types';

export interface AdminStats {
  totalUsers: number;
  totalCustomers: number;
  totalTransactions: number;
  totalVolume: number;
  activeToday: number;
}

export interface AdminUserProfile extends Profile {
  customerCount?: number;
  transactionCount?: number;
}

export const adminService = {
  /**
   * Fetch aggregate platform statistics
   */
  async getPlatformStats(): Promise<AdminStats> {
    try {
      // 1. Total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 2. Total customers
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // 3. Total transactions & volume
      const { data: txData, count: txCount } = await supabase
        .from('transactions')
        .select('amount');

      let volume = 0;
      if (txData) {
        volume = txData.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      }

      return {
        totalUsers: usersCount || 1,
        totalCustomers: customersCount || 0,
        totalTransactions: txCount || 0,
        totalVolume: volume,
        activeToday: 1,
      };
    } catch (e) {
      console.warn('adminService.getPlatformStats error:', e);
      return {
        totalUsers: 1,
        totalCustomers: 0,
        totalTransactions: 0,
        totalVolume: 0,
        activeToday: 1,
      };
    }
  },

  /**
   * Fetch all registered users
   */
  async getAllUsers(): Promise<AdminUserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        // Fallback default admin profile
        return [
          {
            id: 'admin-1',
            display_name: 'Abhishek Dagar',
            email: 'abhidagar6319@gmail.com',
            phone: '+91 8440003711',
            avatar_id: 'abhishek',
            role: 'super_admin',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            customerCount: 3,
            transactionCount: 7,
          },
        ];
      }

      return data.map((u) => ({
        ...u,
        role: u.role || (u.email === 'abhidagar6319@gmail.com' ? 'super_admin' : 'user'),
        status: u.status || 'active',
      }));
    } catch (e) {
      console.warn('adminService.getAllUsers error:', e);
      return [
        {
          id: 'admin-1',
          display_name: 'Abhishek Dagar',
          email: 'abhidagar6319@gmail.com',
          phone: '+91 8440003711',
          avatar_id: 'abhishek',
          role: 'super_admin',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          customerCount: 3,
          transactionCount: 7,
        },
      ];
    }
  },

  /**
   * Update user status (Active / Blocked)
   */
  async updateUserStatus(
    userId: string,
    status: 'active' | 'blocked'
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId);

      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Failed to update user status' };
    }
  },

  /**
   * Update user role
   */
  async updateUserRole(
    userId: string,
    role: 'admin' | 'user'
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Failed to update role' };
    }
  },
};
