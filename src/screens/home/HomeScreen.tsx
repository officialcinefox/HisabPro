import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
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
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { StatCard } from '../../components/StatCard';
import { TransactionRow } from '../../components/TransactionRow';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { RootStackParamList } from '../../types';
import { formatCurrency, getTodayDateString } from '../../utils/formatting';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuth();
  const { colors } = useTheme();
  const {
    customers,
    transactions,
    dashboardSummary,
    isLoading,
    refreshData,
    getCustomerById,
  } = useData();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const todayStr = getTodayDateString();
  const todayTransactions = transactions.filter((t) => t.transaction_date === todayStr);

  if (isLoading && !refreshing) {
    return <LoadingOverlay message="Loading your financial dashboard..." />;
  }

  const isNetPositive = dashboardSummary.netBalance >= 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Branded Header with App Logo */}
      <View style={styles.headerRow}>
        <AppLogo size="medium" />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Main', { screen: 'Profile' } as any)}
          style={[
            styles.avatarCircle,
            { backgroundColor: colors.cardElevated, borderColor: colors.border },
          ]}
        >
          <Ionicons name="person" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Personalized Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>
          Welcome back,{' '}
          <Text style={[styles.userName, { color: colors.textPrimary }]}>
            {profile?.display_name || 'Merchant'} 👋
          </Text>
        </Text>
      </View>

      {/* Hero Net Balance Banner */}
      <Card
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.heroTop}>
          <View>
            <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>
              NET OUTSTANDING BALANCE
            </Text>
            <Text
              style={[
                styles.heroAmount,
                { color: isNetPositive ? colors.positive : colors.negative },
              ]}
            >
              {formatCurrency(dashboardSummary.netBalance)}
            </Text>
          </View>

          <View
            style={[
              styles.heroBadge,
              {
                backgroundColor: isNetPositive
                  ? colors.positiveLight
                  : colors.negativeLight,
              },
            ]}
          >
            <Ionicons
              name={isNetPositive ? 'trending-up' : 'trending-down'}
              size={16}
              color={isNetPositive ? colors.positive : colors.negative}
            />
            <Text
              style={[
                styles.heroBadgeText,
                { color: isNetPositive ? colors.positive : colors.negative },
              ]}
            >
              {isNetPositive ? 'Net Receivable' : 'Net Payable'}
            </Text>
          </View>
        </View>

        <View style={[styles.heroDivider, { backgroundColor: colors.divider }]} />

        {/* Current Outstanding Split (To Receive vs To Pay) */}
        <View style={styles.splitRow}>
          <View style={styles.splitCol}>
            <View style={styles.splitLabelRow}>
              <View style={[styles.indicatorDot, { backgroundColor: colors.positive }]} />
              <Text style={[styles.splitLabel, { color: colors.textSecondary }]}>
                To Receive
              </Text>
            </View>
            <Text style={[styles.splitValue, { color: colors.positive }]}>
              {formatCurrency(dashboardSummary.lenaHai)}
            </Text>
          </View>

          <View style={[styles.splitVerticalDivider, { backgroundColor: colors.divider }]} />

          <View style={styles.splitCol}>
            <View style={styles.splitLabelRow}>
              <View style={[styles.indicatorDot, { backgroundColor: colors.negative }]} />
              <Text style={[styles.splitLabel, { color: colors.textSecondary }]}>
                To Pay
              </Text>
            </View>
            <Text style={[styles.splitValue, { color: colors.negative }]}>
              {formatCurrency(dashboardSummary.denaHai)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActionsRow}>
        <Button
          title="Add Customer"
          onPress={() => navigation.navigate('AddCustomer')}
          size="medium"
          icon={<Ionicons name="person-add" size={18} color="#0B0F11" />}
          style={styles.actionBtn}
        />
        <Button
          title="Add Expense"
          variant="secondary"
          onPress={() => navigation.navigate('AddExpense')}
          size="medium"
          icon={<Ionicons name="receipt-outline" size={18} color={colors.textPrimary} />}
          style={styles.actionBtn}
        />
      </View>

      {/* Lifetime Transaction Totals & Monthly Expenses */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Overview & Activity
      </Text>

      <View style={styles.statGrid}>
        <StatCard
          title="Total Given"
          subtitle="Total Debit Given"
          amount={dashboardSummary.totalGiven}
          type="negative"
          style={styles.statGridItem}
        />
        <StatCard
          title="Total Received"
          subtitle="Total Credit Received"
          amount={dashboardSummary.totalReceived}
          type="positive"
          style={styles.statGridItem}
        />
      </View>

      <View style={styles.statGrid}>
        <StatCard
          title="Today's Activity"
          subtitle={`${dashboardSummary.todayCount} transactions`}
          amount={dashboardSummary.todayAmount}
          type="primary"
          style={styles.statGridItem}
        />
        <StatCard
          title="Month Expenses"
          subtitle="Personal spend"
          amount={dashboardSummary.monthExpenses}
          type="neutral"
          style={styles.statGridItem}
        />
      </View>

      {/* Today's Transactions List */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Today's Transactions
        </Text>
        <Text style={[styles.badgeCount, { color: colors.textSecondary }]}>
          {todayTransactions.length} entries
        </Text>
      </View>

      {todayTransactions.length > 0 ? (
        todayTransactions.map((tx) => {
          const customer = getCustomerById(tx.customer_id);
          return (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              customerName={customer?.name || 'Customer'}
              onPressCustomer={() =>
                navigation.navigate('CustomerDetail', { customerId: tx.customer_id })
              }
            />
          );
        })
      ) : (
        <Card style={styles.todayEmptyCard}>
          <Ionicons
            name="calendar-outline"
            size={28}
            color={colors.textSecondary}
            style={{ marginBottom: 6 }}
          />
          <Text style={[styles.todayEmptyText, { color: colors.textSecondary }]}>
            No transactions recorded today yet.
          </Text>
        </Card>
      )}

      {/* Quick Customer Access if any exist */}
      {customers.length > 0 ? (
        <>
          <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Recent Customers
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('Main', { screen: 'Customers' } as any)
              }
            >
              <Text style={[styles.viewAllLink, { color: colors.primary }]}>
                View All ({customers.length}) →
              </Text>
            </TouchableOpacity>
          </View>

          {customers.slice(0, 3).map((customer) => (
            <TouchableOpacity
              key={customer.id}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('CustomerDetail', { customerId: customer.id })
              }
              style={[
                styles.miniCustomerCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.miniLeft}>
                <View
                  style={[
                    styles.miniAvatar,
                    { backgroundColor: colors.cardElevated },
                  ]}
                >
                  <Text style={[styles.miniAvatarText, { color: colors.primary }]}>
                    {customer.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.miniName, { color: colors.textPrimary }]}>
                    {customer.name}
                  </Text>
                  <Text style={[styles.miniSub, { color: colors.textSecondary }]}>
                    {customer.phone || 'No phone'}
                  </Text>
                </View>
              </View>

              <View style={styles.miniRight}>
                <Text
                  style={[
                    styles.miniAmount,
                    {
                      color:
                        customer.status === 'lena_hai'
                          ? colors.positive
                          : customer.status === 'dena_hai'
                          ? colors.negative
                          : colors.settled,
                    },
                  ]}
                >
                  {formatCurrency(customer.displayAmount)}
                </Text>
                <Text style={[styles.miniStatus, { color: colors.textSecondary }]}>
                  {customer.status === 'lena_hai'
                    ? 'To Receive'
                    : customer.status === 'dena_hai'
                    ? 'To Pay'
                    : 'Settled'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </>
      ) : (
        <EmptyState
          iconName="people-outline"
          title="No Customers Yet"
          description="Use the 'Add Customer' button above to start tracking udhar balances and reminders."
        />
      )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  greetingContainer: {
    marginBottom: 14,
    marginTop: -2,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  heroCard: {
    padding: 18,
    marginBottom: 16,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroDivider: {
    height: 1,
    marginVertical: 14,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  splitCol: {
    flex: 1,
  },
  splitVerticalDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  splitLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  splitLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  splitValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  badgeCount: {
    fontSize: 12,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statGridItem: {
    flex: 1,
  },
  todayEmptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    borderStyle: 'dashed',
  },
  todayEmptyText: {
    fontSize: 13,
  },
  miniCustomerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 4,
  },
  miniLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  miniAvatarText: {
    fontSize: 15,
    fontWeight: '800',
  },
  miniName: {
    fontSize: 14,
    fontWeight: '700',
  },
  miniSub: {
    fontSize: 11,
  },
  miniRight: {
    alignItems: 'flex-end',
  },
  miniAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  miniStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
});
