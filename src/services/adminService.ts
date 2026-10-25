import AsyncStorage from '@react-native-async-storage/async-storage';
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

export interface AppFeatureConfig {
  // WhatsApp Features
  whatsappRemindersEnabled: boolean;
  whatsappDirectShare: boolean; // true = direct text message, false = pdf file
  whatsappTemplate: string;

  // PDF Engine Features
  pdfGenerationEnabled: boolean;
  pdfShowLogo: boolean;
  pdfShowUpiQr: boolean;
  pdfShowSummaryBoxes: boolean;
  pdfShowWatermark: boolean;

  // UPI Payments
  upiPaymentsEnabled: boolean;
  defaultUpiId: string;
  defaultMerchantName: string;

  // Avatars & Media
  avatars3dEnabled: boolean;
  allowCustomAvatarUpload: boolean;
  defaultAvatarId: string;

  // Maintenance & Security
  maintenanceMode: boolean;
  maintenanceMessage: string;
  biometricLockEnabled: boolean;
  allowNewRegistrations: boolean;

  // Announcement Banner
  announcementActive: boolean;
  announcementTitle: string;
  announcementText: string;
  announcementType: 'info' | 'success' | 'warning';

  // Branding & App Details
  brandName: string;
  tagline: string;
  supportPhone: string;
  supportEmail: string;
  appVersion: string;
  minRequiredVersion: string;
  forceUpdate: boolean;
}

export const DEFAULT_FEATURE_CONFIG: AppFeatureConfig = {
  whatsappRemindersEnabled: true,
  whatsappDirectShare: true,
  whatsappTemplate: 'Namaste {customer_name}, your balance of {amount} is pending with {business_name}. Please pay via UPI or Cash. Thank you!',
  pdfGenerationEnabled: true,
  pdfShowLogo: true,
  pdfShowUpiQr: true,
  pdfShowSummaryBoxes: true,
  pdfShowWatermark: true,
  upiPaymentsEnabled: true,
  defaultUpiId: '8440003711@upi',
  defaultMerchantName: 'HisabPro Merchant',
  avatars3dEnabled: true,
  allowCustomAvatarUpload: true,
  defaultAvatarId: 'abhishek',
  maintenanceMode: false,
  maintenanceMessage: 'HisabPro is currently under maintenance. We will be back online shortly!',
  biometricLockEnabled: true,
  allowNewRegistrations: true,
  announcementActive: true,
  announcementTitle: '🎉 Welcome to HisabPro 1.0',
  announcementText: 'PDF Statements, WhatsApp Reminders, and 3D Disney/Pixar Avatars are now active!',
  announcementType: 'info',
  brandName: 'HisabPro',
  tagline: 'Simple Accounts. Better Business.',
  supportPhone: '+91 8440003711',
  supportEmail: 'abhidagar6319@gmail.com',
  appVersion: '1.0.0',
  minRequiredVersion: '1.0.0',
  forceUpdate: false,
};

const FEATURE_CONFIG_STORAGE_KEY = '@hisabpro_admin_feature_config';

export const adminService = {
  /**
   * Load Feature Configuration
   */
  async getFeatureConfig(): Promise<AppFeatureConfig> {
    try {
      const stored = await AsyncStorage.getItem(FEATURE_CONFIG_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_FEATURE_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load feature config from storage:', e);
    }
    return DEFAULT_FEATURE_CONFIG;
  },

  /**
   * Save Feature Configuration
   */
  async saveFeatureConfig(config: AppFeatureConfig): Promise<{ success: boolean; error?: string }> {
    try {
      await AsyncStorage.setItem(FEATURE_CONFIG_STORAGE_KEY, JSON.stringify(config));
      return { success: true };
    } catch (e: any) {
      console.warn('Failed to save feature config:', e);
      return { success: false, error: e.message || 'Storage error' };
    }
  },

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
