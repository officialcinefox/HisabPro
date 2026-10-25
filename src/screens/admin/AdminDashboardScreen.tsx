import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomNavBar } from '../../components/BottomNavBar';
import { Card } from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AdminStats, AdminUserProfile, adminService } from '../../services/adminService';
import { RootStackParamList } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatting';

interface AdminDashboardScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AdminDashboard'>;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { profile, user } = useAuth();

  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 1,
    totalCustomers: 0,
    totalTransactions: 0,
    totalVolume: 0,
    activeToday: 1,
  });
  const [users, setUsers] = useState<AdminUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'admins' | 'active' | 'blocked'>('all');

  const loadAdminData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getAllUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (e) {
      console.warn('Failed to load admin data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAdminData();
  };

  const handleToggleUserStatus = async (targetUser: AdminUserProfile) => {
    if (targetUser.email === 'abhidagar6319@gmail.com') {
      Alert.alert('Protected', 'Primary Super Admin account status cannot be altered.');
      return;
    }

    const newStatus = targetUser.status === 'blocked' ? 'active' : 'blocked';
    Alert.alert(
      newStatus === 'blocked' ? 'Block User?' : 'Activate User?',
      `Are you sure you want to mark ${targetUser.display_name || targetUser.email} as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: newStatus === 'blocked' ? 'Block' : 'Activate',
          style: newStatus === 'blocked' ? 'destructive' : 'default',
          onPress: async () => {
            const { error } = await adminService.updateUserStatus(targetUser.id, newStatus);
            if (error) {
              Alert.alert('Error', error);
            } else {
              setUsers((prev) =>
                prev.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus } : u))
              );
            }
          },
        },
      ]
    );
  };

  const filteredUsers = useMemo(() => {
    let list = users;

    if (filterMode === 'admins') {
      list = list.filter((u) => u.role === 'admin' || u.role === 'super_admin');
    } else if (filterMode === 'active') {
      list = list.filter((u) => u.status !== 'blocked');
    } else if (filterMode === 'blocked') {
      list = list.filter((u) => u.status === 'blocked');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.display_name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [users, filterMode, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Top Admin Badge Banner */}
        <View
          style={[
            styles.adminBadgeBanner,
            {
              backgroundColor: isDark ? '#1C1510' : '#FFF9F3',
              borderColor: isDark ? '#FF7A00' : '#FFD3AD',
            },
          ]}
        >
          <View style={styles.bannerLeft}>
            <View style={styles.crownBox}>
              <Text style={{ fontSize: 22 }}>👑</Text>
            </View>
            <View style={styles.bannerTextCol}>
              <View style={styles.superAdminPill}>
                <Text style={styles.superAdminPillText}>Super Admin Portal</Text>
              </View>
              <Text style={[styles.bannerAdminName, { color: colors.textPrimary }]}>
                {profile?.display_name || 'Abhishek Dagar'}
              </Text>
              <Text style={[styles.bannerAdminEmail, { color: colors.textSecondary }]}>
                abhidagar6319@gmail.com
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={loadAdminData}
            style={[styles.refreshIconBtn, { backgroundColor: 'rgba(255, 122, 0, 0.15)' }]}
          >
            <Ionicons name="refresh" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* System Health Status */}
        <View
          style={[
            styles.systemHealthBar,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.healthDot} />
          <Text style={[styles.healthText, { color: colors.textPrimary }]}>
            Supabase Cloud Database: <Text style={{ color: '#22C55E', fontWeight: '800' }}>Operational</Text>
          </Text>
        </View>

        {/* 4 Metric Overview Grid */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 14 }]}>
          Platform <Text style={{ color: colors.primary }}>Metrics</Text>
        </Text>

        <View style={styles.metricsGrid}>
          {/* Total Registered Users */}
          <View
            style={[
              styles.metricCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="people" size={18} color="#3B82F6" />
            </View>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Merchants</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
              {loading ? '-' : stats.totalUsers}
            </Text>
          </View>

          {/* Total Customers */}
          <View
            style={[
              styles.metricCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(255, 122, 0, 0.15)' }]}>
              <Ionicons name="storefront" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Customers Tracked</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
              {loading ? '-' : stats.totalCustomers}
            </Text>
          </View>

          {/* Total Transactions */}
          <View
            style={[
              styles.metricCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
              <Ionicons name="receipt" size={18} color="#22C55E" />
            </View>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Entries</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
              {loading ? '-' : stats.totalTransactions}
            </Text>
          </View>

          {/* Total Volume */}
          <View
            style={[
              styles.metricCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
              <Ionicons name="cash" size={18} color="#A855F7" />
            </View>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Platform Volume</Text>
            <Text style={[styles.metricValue, { color: '#22C55E' }]}>
              {loading ? '-' : formatCurrency(stats.totalVolume)}
            </Text>
          </View>
        </View>

        {/* User Management Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            User <Text style={{ color: colors.primary }}>Management</Text> ({filteredUsers.length})
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            placeholder="Search by name, email or phone..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          {(['all', 'admins', 'active', 'blocked'] as const).map((mode) => {
            const isActive = filterMode === mode;
            const labels = {
              all: 'All',
              admins: '👑 Admins',
              active: '● Active',
              blocked: '✕ Blocked',
            };
            return (
              <TouchableOpacity
                key={mode}
                activeOpacity={0.8}
                onPress={() => setFilterMode(mode)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isActive ? colors.primary : colors.card,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isActive ? '#0B0F11' : colors.textSecondary,
                      fontWeight: isActive ? '800' : '600',
                    },
                  ]}
                >
                  {labels[mode]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Users List */}
        {loading ? (
          <View style={{ padding: 30, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 10, color: colors.textSecondary }}>Loading users...</Text>
          </View>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((u) => {
            const isSuperAdmin = u.email === 'abhidagar6319@gmail.com';
            const isBlocked = u.status === 'blocked';
            const initial = (u.display_name || u.email || 'U').charAt(0).toUpperCase();

            return (
              <View
                key={u.id}
                style={[
                  styles.userCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.userCardTop}>
                  <View style={styles.userCardLeft}>
                    <View
                      style={[
                        styles.userAvatarCircle,
                        { backgroundColor: isSuperAdmin ? '#FF7A00' : '#242220' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.userAvatarInitial,
                          { color: isSuperAdmin ? '#FFFFFF' : '#FF7A00' },
                        ]}
                      >
                        {initial}
                      </Text>
                    </View>

                    <View style={styles.userInfoCol}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text
                          style={[styles.userNameText, { color: colors.textPrimary }]}
                          numberOfLines={1}
                        >
                          {u.display_name || 'Merchant'}
                        </Text>
                        {isSuperAdmin && (
                          <View style={styles.superBadge}>
                            <Text style={styles.superBadgeText}>👑 Super Admin</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.userEmailText, { color: colors.textSecondary }]}>
                        {u.email}
                      </Text>
                      {u.phone ? (
                        <Text style={[styles.userPhoneText, { color: colors.primary }]}>
                          📞 {u.phone}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isBlocked
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(34, 197, 94, 0.15)',
                        borderColor: isBlocked
                          ? 'rgba(239, 68, 68, 0.3)'
                          : 'rgba(34, 197, 94, 0.3)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: isBlocked ? '#EF4444' : '#22C55E' },
                      ]}
                    >
                      {isBlocked ? 'Blocked' : 'Active'}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={[styles.userDivider, { backgroundColor: colors.border }]} />

                {/* Bottom Row: Joined date and Actions */}
                <View style={styles.userCardBottom}>
                  <Text style={[styles.joinedText, { color: colors.textSecondary }]}>
                    Joined: {u.created_at ? formatDate(u.created_at) : 'Recent'}
                  </Text>

                  {!isSuperAdmin && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleToggleUserStatus(u)}
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: isBlocked
                            ? 'rgba(34, 197, 94, 0.12)'
                            : 'rgba(239, 68, 68, 0.12)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.actionBtnText,
                          { color: isBlocked ? '#22C55E' : '#EF4444' },
                        ]}
                      >
                        {isBlocked ? 'Unblock User' : 'Block User'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="search-outline" size={32} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: 8 }]}>
              No users match your search query.
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <BottomNavBar activeTab="Profile" />
    </View>
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
  adminBadgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  crownBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 122, 0, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextCol: {
    flex: 1,
  },
  superAdminPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF7A00',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    marginBottom: 4,
  },
  superAdminPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0B0F11',
    textTransform: 'uppercase',
  },
  bannerAdminName: {
    fontSize: 18,
    fontWeight: '900',
  },
  bannerAdminEmail: {
    fontSize: 12,
    marginTop: 1,
  },
  refreshIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemHealthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginBottom: 14,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  healthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 4,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 11,
  },
  userCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  userCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  userAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarInitial: {
    fontSize: 18,
    fontWeight: '800',
  },
  userInfoCol: {
    flex: 1,
  },
  userNameText: {
    fontSize: 15,
    fontWeight: '800',
  },
  superBadge: {
    backgroundColor: 'rgba(255, 122, 0, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF7A00',
  },
  superBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF7A00',
  },
  userEmailText: {
    fontSize: 12,
    marginTop: 1,
  },
  userPhoneText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  userDivider: {
    height: 1,
    marginVertical: 10,
  },
  userCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinedText: {
    fontSize: 11,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 13,
  },
});
