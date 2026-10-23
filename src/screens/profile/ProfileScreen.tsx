import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
  const { themeMode, setThemeMode, colors, isDark } = useTheme();
  const { customers, transactions, expenses, dashboardSummary } = useData();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    setLoggingOut(false);
    setLogoutModalVisible(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Profile Card */}
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

      {/* Appearance Section with Sun & Moon Icons */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Appearance
      </Text>
      <Card style={styles.appearanceCard}>
        <Text style={[styles.appearanceSub, { color: colors.textSecondary }]}>
          Choose your visual preference. Switches immediately and persists on this
          device.
        </Text>

        <View style={styles.themeOptionsRow}>
          {/* Light Mode Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setThemeMode('light')}
            style={[
              styles.themeOptionBox,
              {
                backgroundColor: !isDark ? 'rgba(255, 122, 0, 0.12)' : colors.cardElevated,
                borderColor: !isDark ? colors.primary : colors.border,
                borderWidth: !isDark ? 2 : 1,
              },
            ]}
          >
            <Ionicons
              name="sunny"
              size={28}
              color={!isDark ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.themeOptionLabel,
                {
                  color: !isDark ? colors.primary : colors.textPrimary,
                  fontWeight: !isDark ? '800' : '600',
                },
              ]}
            >
              ☀️ Light Mode
            </Text>
            {!isDark ? (
              <View
                style={[
                  styles.activeCheckBadge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Ionicons name="checkmark" size={12} color="#0B0F11" />
              </View>
            ) : null}
          </TouchableOpacity>

          {/* Dark Mode Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setThemeMode('dark')}
            style={[
              styles.themeOptionBox,
              {
                backgroundColor: isDark ? 'rgba(255, 122, 0, 0.12)' : colors.cardElevated,
                borderColor: isDark ? colors.primary : colors.border,
                borderWidth: isDark ? 2 : 1,
              },
            ]}
          >
            <Ionicons
              name="moon"
              size={28}
              color={isDark ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.themeOptionLabel,
                {
                  color: isDark ? colors.primary : colors.textPrimary,
                  fontWeight: isDark ? '800' : '600',
                },
              ]}
            >
              🌙 Dark Mode
            </Text>
            {isDark ? (
              <View
                style={[
                  styles.activeCheckBadge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Ionicons name="checkmark" size={12} color="#0B0F11" />
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </Card>

      {/* Account Financial Statistics */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 12 }]}>
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
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          HisabPro v1.0.0
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
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileTextInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
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
  editBtn: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  appearanceCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },
  appearanceSub: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  themeOptionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOptionBox: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    gap: 8,
  },
  themeOptionLabel: {
    fontSize: 13,
  },
  activeCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
