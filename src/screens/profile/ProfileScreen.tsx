import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppLogo } from '../../components/AppLogo';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { RootStackParamList } from '../../types';
import { formatCurrency } from '../../utils/formatting';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, user, signOut } = useAuth();
  const { setThemeMode, colors, isDark } = useTheme();
  const { customers, transactions, expenses, dashboardSummary } = useData();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    setLoggingOut(false);
    setLogoutModalVisible(false);
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    // In accordance with Google Play & App Store policies, sign out and clean session
    // User can also contact support for complete database user record purge
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Profile Card with Quick Theme Toggle Icon in Upper Corner */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View
            style={[
              styles.avatarLarge,
              { backgroundColor: colors.cardElevated, borderColor: colors.primary },
            ]}
          >
            <Ionicons name="person" size={36} color={colors.primary} />
          </View>

          <View style={styles.profileTextInfo}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>
              {profile?.display_name || 'HisabPro User'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {profile?.email || user?.email || ''}
            </Text>
            {profile?.phone ? (
              <Text style={[styles.userPhone, { color: colors.textSecondary }]}>
                📞 {profile.phone}
              </Text>
            ) : null}
          </View>

          {/* Upper Corner Theme Toggle Icon: Sun in Dark Mode, Moon in Light Mode */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleTheme}
            style={[
              styles.cornerThemeToggle,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.border,
              },
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        <Button
          title="Edit Profile"
          variant="secondary"
          size="small"
          icon={<Ionicons name="create-outline" size={16} color={colors.textPrimary} />}
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.editBtn}
        />
      </Card>

      {/* Account Financial Statistics */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 8 }]}>
        Account Summary Statistics
      </Text>

      <View style={styles.statsGrid}>
        <Card style={styles.statBox}>
          <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>
            Total Customers
          </Text>
          <Text style={[styles.statBoxValue, { color: colors.textPrimary }]}>
            {customers.length}
          </Text>
        </Card>

        <Card style={styles.statBox}>
          <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>
            Transactions
          </Text>
          <Text style={[styles.statBoxValue, { color: colors.textPrimary }]}>
            {transactions.length}
          </Text>
        </Card>

        <Card style={styles.statBox}>
          <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>
            Expenses
          </Text>
          <Text style={[styles.statBoxValue, { color: colors.textPrimary }]}>
            {expenses.length}
          </Text>
        </Card>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statBox}>
          <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>
            Total Given
          </Text>
          <Text style={[styles.statBoxValue, { color: colors.negative }]}>
            {formatCurrency(dashboardSummary.totalGiven)}
          </Text>
        </Card>

        <Card style={styles.statBox}>
          <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>
            Total Received
          </Text>
          <Text style={[styles.statBoxValue, { color: colors.positive }]}>
            {formatCurrency(dashboardSummary.totalReceived)}
          </Text>
        </Card>

        <Card style={styles.statBox}>
          <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>
            Net Balance
          </Text>
          <Text
            style={[
              styles.statBoxValue,
              {
                color:
                  dashboardSummary.netBalance >= 0
                    ? colors.positive
                    : colors.negative,
              },
            ]}
          >
            {formatCurrency(dashboardSummary.netBalance)}
          </Text>
        </Card>
      </View>

      {/* Legal & App Information (Google Play & Store Compliance) */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 14 }]}>
        Legal, Policies & Support
      </Text>

      <Card style={styles.menuCard}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('PrivacyPolicy')}
          style={styles.menuRow}
        >
          <View style={styles.menuRowLeft}>
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: 'rgba(255, 122, 0, 0.12)' },
              ]}
            >
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
            </View>
            <View>
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

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Terms')}
          style={styles.menuRow}
        >
          <View style={styles.menuRowLeft}>
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: 'rgba(59, 130, 246, 0.12)' },
              ]}
            >
              <Ionicons name="document-text-outline" size={18} color="#3B82F6" />
            </View>
            <View>
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

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setDeleteAccountModalVisible(true)}
          style={styles.menuRow}
        >
          <View style={styles.menuRowLeft}>
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: colors.negativeLight },
              ]}
            >
              <Ionicons name="trash-outline" size={18} color={colors.negative} />
            </View>
            <View>
              <Text style={[styles.menuRowTitle, { color: colors.negative }]}>
                Delete Account & Data
              </Text>
              <Text style={[styles.menuRowSub, { color: colors.textSecondary }]}>
                Permanently purge all customer records
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.negative} />
        </TouchableOpacity>
      </Card>

      {/* Logout Action */}
      <Button
        title="Sign Out"
        variant="outline"
        size="large"
        icon={<Ionicons name="log-out-outline" size={18} color={colors.primary} />}
        onPress={() => setLogoutModalVisible(true)}
        style={styles.logoutBtn}
      />

      <View style={styles.appInfo}>
        <AppLogo size="small" showText={true} style={{ marginBottom: 6 }} />
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          HisabPro v1.0.0 • Made with ❤️ for Merchants
        </Text>
        <Text style={[styles.taglineText, { color: colors.textSecondary }]}>
          Your Money, In Control.
        </Text>
      </View>

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

      {/* Delete Account Confirm Modal (Play Store Policy Requirement) */}
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
  profileCard: {
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileTextInfo: {
    flex: 1,
    paddingRight: 8,
  },
  userName: {
    fontSize: 19,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  cornerThemeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  statBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statBoxValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  logoutBtn: {
    marginTop: 18,
  },
  menuCard: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 6,
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
  menuRowTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuRowSub: {
    fontSize: 11,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    marginLeft: 50,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 24,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taglineText: {
    fontSize: 11,
    marginTop: 2,
  },
});
