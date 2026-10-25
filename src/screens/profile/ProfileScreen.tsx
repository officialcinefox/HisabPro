import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AvatarPickerModal } from '../../components/AvatarPickerModal';
import { Card } from '../../components/Card';
import { ConfirmModal } from '../../components/ConfirmModal';
import { MonthPickerModal } from '../../components/MonthPickerModal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { isUserAdmin, RootStackParamList } from '../../types';
import { getAvatarSource } from '../../utils/avatars';
import { formatCurrency } from '../../utils/formatting';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, user, signOut, updateAvatar } = useAuth();
  const { setThemeMode, colors, isDark } = useTheme();
  const { customers, transactions, expenses, dashboardSummary } = useData();

  const isAdmin = isUserAdmin(profile, user?.email);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    setLoggingOut(false);
    setLogoutModalVisible(false);
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    await signOut();
    setDeletingAccount(false);
    setDeleteAccountModalVisible(false);
    Alert.alert(
      'Account Deletion Request',
      'You have been signed out. All local session data has been purged. To request immediate permanent deletion of all server ledger archives, email support@hisabpro.app.'
    );
  };

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  const memberSinceStr = 'Oct 2026';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Top Header Row matching Reference Image */}
      <View style={styles.topHeaderRow}>
        <View style={styles.headerTextCol}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Pro<Text style={{ color: colors.primary }}>file</Text>
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Manage your account and preferences
          </Text>
        </View>

        {/* Theme Toggle Pill Dropdown */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleTheme}
          style={[
            styles.themePill,
            { backgroundColor: colors.cardElevated, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={14}
            color={colors.primary}
          />
          <Text style={[styles.themePillText, { color: colors.textPrimary }]}>
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </Text>
          <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Hero Profile Banner Card with Warm Amber/Dark Glow */}
      <View
        style={[
          styles.heroProfileCard,
          {
            backgroundColor: isDark ? '#1C1510' : '#FFF9F3',
            borderColor: isDark ? '#3D2817' : '#FFE5CE',
          },
        ]}
      >
        <View style={styles.heroTopRow}>
          {/* Avatar with Camera badge */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setAvatarPickerVisible(true)}
            style={[
              styles.avatarContainer,
              { borderColor: colors.primary },
            ]}
          >
            <Image
              source={getAvatarSource(profile?.avatar_id || 'abhishek')}
              style={styles.avatarImg}
            />
            <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={12} color="#0B0F11" />
            </View>
          </TouchableOpacity>

          {/* User Name & Email */}
          <View style={styles.userInfoCol}>
            <View style={styles.userNameBadgeRow}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>
                {profile?.display_name || 'Abhishek Dagar'}
              </Text>
              {isAdmin && (
                <View style={styles.adminRoleBadge}>
                  <Text style={{ fontSize: 10 }}>👑</Text>
                  <Text style={styles.adminRoleBadgeText}>Admin</Text>
                </View>
              )}
            </View>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {profile?.email || user?.email || 'abhidagar6319@gmail.com'}
            </Text>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EditProfile')}
            style={[
              styles.editProfileBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="create-outline" size={14} color={colors.textPrimary} />
            <Text style={[styles.editProfileBtnText, { color: colors.textPrimary }]}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View
          style={[
            styles.heroDivider,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
          ]}
        />

        {/* Metadata Chips: Phone, Member Since, Account Status */}
        <View style={styles.metaChipsRow}>
          <View style={styles.metaChip}>
            <View
              style={[
                styles.metaIconCircle,
                { backgroundColor: 'rgba(255, 122, 0, 0.15)' },
              ]}
            >
              <Ionicons name="call" size={12} color={colors.primary} />
            </View>
            <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
              {profile?.phone || '+91 8440003711'}
            </Text>
          </View>

          <View style={styles.metaChip}>
            <View
              style={[
                styles.metaIconCircle,
                { backgroundColor: 'rgba(255, 122, 0, 0.15)' },
              ]}
            >
              <Ionicons name="calendar" size={12} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                Member since
              </Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                {memberSinceStr}
              </Text>
            </View>
          </View>

          <View style={styles.metaChip}>
            <View
              style={[
                styles.metaIconCircle,
                { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
              ]}
            >
              <Ionicons name="shield-checkmark" size={12} color="#22C55E" />
            </View>
            <View>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                Account Status
              </Text>
              <Text style={[styles.metaValueActive, { color: '#22C55E' }]}>
                Active
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Account Summary Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Account <Text style={{ color: colors.primary }}>Summary</Text>
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setMonthPickerVisible(true)}
          style={[
            styles.filterPill,
            { backgroundColor: colors.cardElevated, borderColor: colors.border },
          ]}
        >
          <Ionicons name="calendar-outline" size={13} color={colors.primary} />
          <Text style={[styles.filterPillText, { color: colors.textPrimary }]}>
            This Month
          </Text>
          <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* 2x3 Grid of Summary Cards matching Reference Image */}
      <View style={styles.summaryGrid}>
        {/* Total Customers */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Main', { screen: 'Customers' } as any)}
          style={[
            styles.summaryCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.summaryCardTop}>
            <View
              style={[
                styles.summaryIconBox,
                { backgroundColor: 'rgba(255, 122, 0, 0.15)' },
              ]}
            >
              <Ionicons name="people" size={18} color={colors.primary} />
            </View>
            <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
          </View>
          <Text style={[styles.summaryCardLabel, { color: colors.textSecondary }]}>
            Total Customers
          </Text>
          <Text style={[styles.summaryCardValue, { color: colors.textPrimary }]}>
            {customers.length}
          </Text>
        </TouchableOpacity>

        {/* Total Transactions */}
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.summaryCardTop}>
            <View
              style={[
                styles.summaryIconBox,
                { backgroundColor: 'rgba(139, 92, 246, 0.15)' },
              ]}
            >
              <Ionicons name="document-text" size={18} color="#8B5CF6" />
            </View>
            <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
          </View>
          <Text style={[styles.summaryCardLabel, { color: colors.textSecondary }]}>
            Total Transactions
          </Text>
          <Text style={[styles.summaryCardValue, { color: colors.textPrimary }]}>
            {transactions.length}
          </Text>
        </View>

        {/* Total Expenses */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Main', { screen: 'Expenses' } as any)}
          style={[
            styles.summaryCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.summaryCardTop}>
            <View
              style={[
                styles.summaryIconBox,
                { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
              ]}
            >
              <Ionicons name="wallet" size={18} color="#F59E0B" />
            </View>
            <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
          </View>
          <Text style={[styles.summaryCardLabel, { color: colors.textSecondary }]}>
            Total Expenses
          </Text>
          <Text style={[styles.summaryCardValue, { color: colors.textPrimary }]}>
            {expenses.length}
          </Text>
        </TouchableOpacity>

        {/* Total Given */}
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.summaryCardTop}>
            <View
              style={[
                styles.summaryIconBox,
                { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
              ]}
            >
              <Ionicons name="arrow-up" size={18} color="#EF4444" />
            </View>
            <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
          </View>
          <Text style={[styles.summaryCardLabel, { color: colors.textSecondary }]}>
            Total Given
          </Text>
          <Text style={[styles.summaryCardValue, { color: '#EF4444' }]}>
            {formatCurrency(dashboardSummary.totalGiven)}
          </Text>
        </View>

        {/* Total Received */}
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.summaryCardTop}>
            <View
              style={[
                styles.summaryIconBox,
                { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
              ]}
            >
              <Ionicons name="arrow-down" size={18} color="#22C55E" />
            </View>
            <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
          </View>
          <Text style={[styles.summaryCardLabel, { color: colors.textSecondary }]}>
            Total Received
          </Text>
          <Text style={[styles.summaryCardValue, { color: '#22C55E' }]}>
            {formatCurrency(dashboardSummary.totalReceived)}
          </Text>
        </View>

        {/* Net Balance */}
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.summaryCardTop}>
            <View
              style={[
                styles.summaryIconBox,
                { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
              ]}
            >
              <Ionicons name="bar-chart" size={18} color="#3B82F6" />
            </View>
            <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
          </View>
          <Text style={[styles.summaryCardLabel, { color: colors.textSecondary }]}>
            Net Balance
          </Text>
          <Text
            style={[
              styles.summaryCardValue,
              {
                color:
                  dashboardSummary.netBalance >= 0 ? '#22C55E' : '#EF4444',
              },
            ]}
          >
            {formatCurrency(dashboardSummary.netBalance)}
          </Text>
        </View>
      </View>

      {/* Admin Access Section - ONLY visible if isAdmin */}
      {isAdmin && (
        <View style={styles.adminAccessSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 10 }]}>
            Admin <Text style={{ color: colors.primary }}>Access</Text>
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AdminDashboard')}
            style={[
              styles.adminAccessCard,
              {
                backgroundColor: isDark ? '#1C1510' : '#FFF9F3',
                borderColor: '#FF7A00',
              },
            ]}
          >
            <View style={styles.adminAccessLeft}>
              <View style={styles.adminCrownBox}>
                <Text style={{ fontSize: 20 }}>👑</Text>
              </View>
              <View style={styles.adminAccessTextCol}>
                <Text style={[styles.adminAccessTitle, { color: colors.textPrimary }]}>
                  Go to Admin Dashboard
                </Text>
                <Text style={[styles.adminAccessSubtitle, { color: colors.textSecondary }]}>
                  Manage users, data, settings and more
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Settings & Support Section */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 14 }]}>
        Settings & <Text style={{ color: colors.primary }}>Support</Text>
      </Text>

      <Card style={styles.menuCard}>
        {/* Edit Profile */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.menuRow}
        >
          <View style={styles.menuRowLeft}>
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: 'rgba(255, 122, 0, 0.15)' },
              ]}
            >
              <Ionicons name="person" size={18} color={colors.primary} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={[styles.menuRowTitle, { color: colors.textPrimary }]}>
                Edit Profile
              </Text>
              <Text style={[styles.menuRowSub, { color: colors.textSecondary }]}>
                Update your name, email, and profile photo
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={[styles.menuDivider, { backgroundColor: colors.divider }]} />

        {/* Notifications */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}
          style={styles.menuRow}
        >
          <View style={styles.menuRowLeft}>
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: 'rgba(139, 92, 246, 0.15)' },
              ]}
            >
              <Ionicons name="notifications" size={18} color="#8B5CF6" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={[styles.menuRowTitle, { color: colors.textPrimary }]}>
                Notifications
              </Text>
              <Text style={[styles.menuRowSub, { color: colors.textSecondary }]}>
                Manage alerts and reminders
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={[styles.menuDivider, { backgroundColor: colors.divider }]} />

        {/* Privacy Policy */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('PrivacyPolicy')}
          style={styles.menuRow}
        >
          <View style={styles.menuRowLeft}>
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
              ]}
            >
              <Ionicons name="shield-checkmark" size={18} color="#22C55E" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={[styles.menuRowTitle, { color: colors.textPrimary }]}>
                Privacy Policy
              </Text>
              <Text style={[styles.menuRowSub, { color: colors.textSecondary }]}>
                How we protect & encrypt your data
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={[styles.menuDivider, { backgroundColor: colors.divider }]} />

        {/* Terms & Conditions */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Terms')}
          style={styles.menuRow}
        >
          <View style={styles.menuRowLeft}>
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
              ]}
            >
              <Ionicons name="document-text" size={18} color="#3B82F6" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={[styles.menuRowTitle, { color: colors.textPrimary }]}>
                Terms & Conditions
              </Text>
              <Text style={[styles.menuRowSub, { color: colors.textSecondary }]}>
                Bookkeeping rules & user agreement
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={[styles.menuDivider, { backgroundColor: colors.divider }]} />

        {/* Help & Support */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('HelpSupport')}
          style={styles.menuRow}
        >
          <View style={styles.menuRowLeft}>
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: 'rgba(255, 122, 0, 0.15)' },
              ]}
            >
              <Ionicons name="headset" size={18} color={colors.primary} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={[styles.menuRowTitle, { color: colors.textPrimary }]}>
                Help & Support
              </Text>
              <Text style={[styles.menuRowSub, { color: colors.textSecondary }]}>
                Get help, contact us or give feedback
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={[styles.menuDivider, { backgroundColor: colors.divider }]} />

        {/* Delete Account & Data */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setDeleteAccountModalVisible(true)}
          style={styles.menuRow}
        >
          <View style={styles.menuRowLeft}>
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
              ]}
            >
              <Ionicons name="trash" size={18} color="#EF4444" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={[styles.menuRowTitle, { color: '#EF4444' }]}>
                Delete Account & Data
              </Text>
              <Text style={[styles.menuRowSub, { color: colors.textSecondary }]}>
                Permanently purge all customer records
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#EF4444" />
        </TouchableOpacity>
      </Card>

      {/* Sign Out Button (Orange Outline Pill Button matching Reference) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setLogoutModalVisible(true)}
        style={[styles.signOutBtn, { borderColor: colors.primary }]}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.primary} />
        <Text style={[styles.signOutBtnText, { color: colors.primary }]}>
          Sign Out
        </Text>
      </TouchableOpacity>

      {/* Logout Confirm Modal */}
      <ConfirmModal
        visible={logoutModalVisible}
        title="Sign Out?"
        message="Are you sure you want to sign out of your HisabPro account?"
        confirmLabel="Sign Out"
        isDestructive={false}
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />

      {/* Delete Account Confirm Modal */}
      <ConfirmModal
        visible={deleteAccountModalVisible}
        title="Delete Account & All Data?"
        message="Are you sure? This action is permanent and cannot be undone. All your customer ledgers, personal expenses, and reminder history will be wiped."
        confirmLabel="Delete Everything"
        isDestructive={true}
        loading={deletingAccount}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteAccountModalVisible(false)}
      />

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        visible={avatarPickerVisible}
        selectedAvatarId={profile?.avatar_id}
        onSelect={(avatarId) => updateAvatar(avatarId)}
        onClose={() => setAvatarPickerVisible(false)}
      />

      {/* Month Picker Modal */}
      <MonthPickerModal
        visible={monthPickerVisible}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onSelect={(y, m) => {
          setSelectedYear(y);
          setSelectedMonth(m);
        }}
        onClose={() => setMonthPickerVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 14,
  },
  headerTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  themePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroProfileCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    position: 'relative',
    marginRight: 14,
    backgroundColor: '#1A2026',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0B0F11',
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroDivider: {
    height: 1,
    marginVertical: 14,
  },
  metaChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  metaIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  metaValueActive: {
    fontSize: 11,
    fontWeight: '900',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '31%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCardLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  summaryCardValue: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  menuCard: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 18,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextCol: {
    flex: 1,
  },
  menuRowTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  menuRowSub: {
    fontSize: 11,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    marginLeft: 50,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 20,
    marginTop: 6,
  },
  signOutBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
  userNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  adminRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 122, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FF7A00',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    gap: 4,
  },
  adminRoleBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FF7A00',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adminAccessSection: {
    marginTop: 14,
    marginBottom: 4,
  },
  adminAccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  adminAccessLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  adminCrownBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 122, 0, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminAccessTextCol: {
    flex: 1,
  },
  adminAccessTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  adminAccessSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
});
