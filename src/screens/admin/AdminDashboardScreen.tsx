import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Circle, G, Rect } from 'react-native-svg';
import { AvatarPickerModal } from '../../components/AvatarPickerModal';
import { BottomNavBar } from '../../components/BottomNavBar';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { RootStackParamList } from '../../types';
import { getAvatarSource } from '../../utils/avatars';
import { formatCurrency, formatDate } from '../../utils/formatting';

interface AdminDashboardScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AdminDashboard'>;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const { colors, isDark } = useTheme();
  const { profile, user, updateAvatar } = useAuth();
  const { customers, transactions, expenses, dashboardSummary } = useData();

  // State
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [timeFilterModal, setTimeFilterModal] = useState(false);
  const [moneyFlowFilter, setMoneyFlowFilter] = useState<'7days' | '30days'>('7days');
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [usersModalVisible, setUsersModalVisible] = useState(false);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [contentModalVisible, setContentModalVisible] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'Dashboard' | 'Customers' | 'Transactions' | 'Expenses' | 'Reports' | 'Reminders' | 'Users'>('Dashboard');

  // Business Name and Tagline for Content Editor
  const [businessName, setBusinessName] = useState('HisabPro');
  const [businessTagline, setBusinessTagline] = useState('Simple Accounts. Better Business.');

  // Top Customers (sorted by absolute displayAmount descending)
  const topCustomers = useMemo(() => {
    if (customers.length > 0) {
      return [...customers]
        .sort((a, b) => b.displayAmount - a.displayAmount)
        .slice(0, 4);
    }
    // Fallback sample data matching reference image
    return [
      { id: 'c1', name: 'Shyam', phone: '8440003711', displayAmount: 42000, status: 'lena_hai' as const },
      { id: 'c2', name: 'Ramesh', phone: '9876543210', displayAmount: 28500, status: 'lena_hai' as const },
      { id: 'c3', name: 'Amit', phone: '9543210987', displayAmount: 12000, status: 'lena_hai' as const },
    ];
  }, [customers]);

  // Recent Transactions
  const recentTransactions = useMemo(() => {
    if (transactions.length > 0) {
      return [...transactions]
        .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
        .slice(0, 5);
    }
    // Fallback sample data matching reference image
    return [
      { id: 't1', customer_id: 'c1', transaction_type: 'you_got' as const, amount: 10000, transaction_date: '2026-10-25', note: 'Mujhe Mile' },
      { id: 't2', customer_id: 'c2', transaction_type: 'you_gave' as const, amount: 5000, transaction_date: '2026-10-25', note: 'Maine Diye' },
      { id: 't3', customer_id: 'c3', transaction_type: 'you_got' as const, amount: 2500, transaction_date: '2026-10-24', note: 'Payment Received' },
      { id: 't4', customer_id: 'c4', transaction_type: 'you_gave' as const, amount: 8000, transaction_date: '2026-10-24', note: 'Payment Given' },
    ];
  }, [transactions]);

  // Key Totals
  const totalCustomersCount = customers.length > 0 ? customers.length : 156;
  const totalTransactionsCount = transactions.length > 0 ? transactions.length : 432;
  const totalExpensesAmount = expenses.length > 0 ? expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0) : 28500;
  const netBalanceAmount = dashboardSummary.netBalance !== 0 ? dashboardSummary.netBalance : 142300;
  const totalGaveAmount = dashboardSummary.totalGiven !== 0 ? dashboardSummary.totalGiven : 128500;
  const totalGotAmount = dashboardSummary.totalReceived !== 0 ? dashboardSummary.totalReceived : 98300;

  // 7-day Bar Chart Data
  const barData = [
    { day: '18 Oct', gave: 18, got: 28 },
    { day: '19 Oct', gave: 25, got: 38 },
    { day: '20 Oct', gave: 45, got: 22 },
    { day: '21 Oct', gave: 32, got: 48 },
    { day: '22 Oct', gave: 52, got: 34 },
    { day: '23 Oct', gave: 28, got: 40 },
    { day: '24 Oct', gave: 44, got: 55 },
  ];

  // Expenses breakdown
  const expenseCategories = [
    { name: 'Shop Rent', pct: '40%', amount: '₹11,500', color: '#FF7A00' },
    { name: 'Material', pct: '25%', amount: '₹7,200', color: '#22C55E' },
    { name: 'Transport', pct: '15%', amount: '₹4,300', color: '#8B5CF6' },
    { name: 'Food', pct: '10%', amount: '₹2,800', color: '#EAB308' },
    { name: 'Other', pct: '10%', amount: '₹2,700', color: '#64748B' },
  ];

  // Helper for customer initial colors
  const getInitialColor = (index: number) => {
    const palette = ['#FF7A00', '#F97316', '#3B82F6', '#8B5CF6', '#22C55E'];
    return palette[index % palette.length];
  };

  const handleSidebarNav = (tab: typeof activeSidebarTab) => {
    setActiveSidebarTab(tab);
    if (tab === 'Customers') navigation.navigate('Main', { screen: 'Customers' });
    else if (tab === 'Expenses') navigation.navigate('Main', { screen: 'Expenses' });
    else if (tab === 'Users') setUsersModalVisible(true);
    else if (tab === 'Reports') {
      if (customers.length > 0) navigation.navigate('CustomerReport', { customerId: customers[0].id });
      else Alert.alert('Reports', 'Please add a customer first to view statements.');
    }
  };

  // Main Dashboard Body
  const renderDashboardContent = () => (
    <View style={styles.dashboardContainer}>
      {/* Top Greeting Row */}
      <View style={styles.greetingRow}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.greetingTitle, { color: colors.textPrimary }]}>
              Welcome Back, Abhishek!
            </Text>
            <Text style={{ fontSize: 20 }}>👑</Text>
          </View>
          <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>
            Here's your business overview for today.
          </Text>
        </View>

        {/* Date Filter Pill Dropdown */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setTimeFilterModal(true)}
          style={[styles.dateFilterBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="calendar-outline" size={14} color={colors.primary} />
          <Text style={[styles.dateFilterText, { color: colors.textPrimary }]}>
            {timeFilter === 'today' ? 'Today' : timeFilter === 'week' ? 'This Week' : timeFilter === 'month' ? 'This Month' : 'This Year'}
          </Text>
          <Ionicons name="chevron-down" size={13} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* 4 Summary Metrics Cards */}
      <View style={styles.metricsGrid}>
        {/* Total Customers */}
        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.metricCardTop}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(255, 122, 0, 0.15)' }]}>
              <Ionicons name="people" size={18} color="#FF7A00" />
            </View>
          </View>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Customers</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{totalCustomersCount}</Text>
          <Text style={styles.trendGreen}>↑ +12 this month</Text>
        </View>

        {/* Total Transactions */}
        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.metricCardTop}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <Ionicons name="receipt" size={18} color="#8B5CF6" />
            </View>
          </View>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Transactions</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{totalTransactionsCount}</Text>
          <Text style={styles.trendGreen}>↑ +18% from last month</Text>
        </View>

        {/* Total Expenses */}
        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.metricCardTop}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
              <Ionicons name="wallet" size={18} color="#EAB308" />
            </View>
          </View>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Expenses</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{formatCurrency(totalExpensesAmount)}</Text>
          <Text style={styles.trendRed}>↓ -8% from last month</Text>
        </View>

        {/* Net Balance */}
        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.metricCardTop}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
              <Ionicons name="bar-chart" size={18} color="#22C55E" />
            </View>
          </View>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Net Balance (To Receive)</Text>
          <Text style={[styles.metricValue, { color: '#22C55E' }]}>{formatCurrency(netBalanceAmount)}</Text>
          <Text style={styles.trendGreen}>↑ +24% from last month</Text>
        </View>
      </View>

      {/* Charts Row: Money Flow (Bar) & Transaction Split (Donut) */}
      <View style={[styles.chartsRow, isDesktop && { flexDirection: 'row' }]}>
        {/* Money Flow Bar Chart */}
        <View style={[styles.chartCard, isDesktop ? { flex: 1.4 } : { width: '100%' }, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>Money Flow</Text>
            <View style={styles.filterPillSmall}>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>Last 7 Days ▾</Text>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>You Gave</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>You Got</Text>
            </View>
          </View>

          {/* SVG Bar Chart */}
          <View style={styles.barChartWrapper}>
            <Svg height="140" width="100%" viewBox="0 0 320 140">
              {/* Grid lines */}
              <Rect x="0" y="25" width="320" height="0.5" fill="#242220" />
              <Rect x="0" y="65" width="320" height="0.5" fill="#242220" />
              <Rect x="0" y="105" width="320" height="0.5" fill="#242220" />

              {/* Bars */}
              {barData.map((item, idx) => {
                const xBase = 20 + idx * 42;
                const gaveH = (item.gave / 60) * 85;
                const gotH = (item.got / 60) * 85;

                return (
                  <G key={idx}>
                    {/* Red Bar (You Gave) */}
                    <Rect
                      x={xBase}
                      y={105 - gaveH}
                      width="10"
                      height={gaveH}
                      rx="3"
                      fill="#EF4444"
                    />
                    {/* Green Bar (You Got) */}
                    <Rect
                      x={xBase + 12}
                      y={105 - gotH}
                      width="10"
                      height={gotH}
                      rx="3"
                      fill="#22C55E"
                    />
                  </G>
                );
              })}
            </Svg>

            {/* X-axis labels */}
            <View style={styles.xAxisRow}>
              {barData.map((b, i) => (
                <Text key={i} style={[styles.xAxisLabel, { color: colors.textSecondary }]}>
                  {b.day.split(' ')[0]}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Transaction Split Card */}
        <View style={[styles.chartCard, isDesktop ? { flex: 1 } : { width: '100%', marginTop: 12 }, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>Transaction Split</Text>
            <View style={styles.filterPillSmall}>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>This Month ▾</Text>
            </View>
          </View>

          <View style={styles.splitContentRow}>
            {/* SVG Donut */}
            <View style={styles.donutContainer}>
              <Svg width="110" height="110" viewBox="0 0 110 110">
                <Circle cx="55" cy="55" r="42" stroke="#242220" strokeWidth="14" fill="none" />
                <Circle
                  cx="55"
                  cy="55"
                  r="42"
                  stroke="#FF7A00"
                  strokeWidth="14"
                  strokeDasharray="180 264"
                  strokeLinecap="round"
                  fill="none"
                  transform="rotate(-90 55 55)"
                />
              </Svg>
              <View style={styles.donutCenterLabel}>
                <Text style={[styles.donutTotalVal, { color: colors.textPrimary }]}>{totalTransactionsCount}</Text>
                <Text style={[styles.donutTotalSub, { color: colors.textSecondary }]}>Total</Text>
              </View>
            </View>

            {/* Split Metrics */}
            <View style={styles.splitMetricsCol}>
              <View style={styles.splitMetricItem}>
                <View style={[styles.splitIconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Ionicons name="arrow-up" size={14} color="#EF4444" />
                </View>
                <View>
                  <Text style={[styles.splitLabel, { color: colors.textSecondary }]}>You Gave</Text>
                  <Text style={[styles.splitVal, { color: '#EF4444' }]}>{formatCurrency(totalGaveAmount)}</Text>
                  <Text style={[styles.splitEntries, { color: colors.textSecondary }]}>298 entries</Text>
                </View>
              </View>

              <View style={styles.splitMetricItem}>
                <View style={[styles.splitIconCircle, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                  <Ionicons name="arrow-down" size={14} color="#22C55E" />
                </View>
                <View>
                  <Text style={[styles.splitLabel, { color: colors.textSecondary }]}>You Got</Text>
                  <Text style={[styles.splitVal, { color: '#22C55E' }]}>{formatCurrency(totalGotAmount)}</Text>
                  <Text style={[styles.splitEntries, { color: colors.textSecondary }]}>134 entries</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Top Customers & Recent Transactions Row */}
      <View style={[styles.tablesRow, isDesktop && { flexDirection: 'row' }]}>
        {/* Top Customers (By Balance) */}
        <View style={[styles.tableCard, isDesktop ? { flex: 1 } : { width: '100%' }, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.tableCardHeader}>
            <Text style={[styles.tableCardTitle, { color: colors.textPrimary }]}>
              Top Customers <Text style={{ color: '#FF7A00' }}>(By Balance)</Text>
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Customers' })}>
              <Text style={styles.viewAllLink}>View All &gt;</Text>
            </TouchableOpacity>
          </View>

          {topCustomers.map((cust, idx) => (
            <TouchableOpacity
              key={cust.id}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CustomerDetail', { customerId: cust.id })}
              style={styles.customerRow}
            >
              <Text style={[styles.rankNumber, { color: colors.textSecondary }]}>{idx + 1}</Text>
              <View style={[styles.customerAvatarCircle, { backgroundColor: getInitialColor(idx) }]}>
                <Text style={styles.customerAvatarInitial}>{(cust.name || 'C').charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.customerInfoCol}>
                <Text style={[styles.customerRowName, { color: colors.textPrimary }]}>{cust.name}</Text>
                <Text style={[styles.customerRowPhone, { color: colors.textSecondary }]}>{cust.phone || '9876543210'}</Text>
              </View>
              <Text style={[styles.customerRowAmount, { color: colors.textPrimary }]}>
                {formatCurrency(cust.displayAmount, true)}
              </Text>
              <View style={styles.toReceivePill}>
                <Text style={styles.toReceivePillText}>To Receive</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={[styles.tableCard, isDesktop ? { flex: 1 } : { width: '100%', marginTop: 12 }, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.tableCardHeader}>
            <Text style={[styles.tableCardTitle, { color: colors.textPrimary }]}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Customers' })}>
              <Text style={styles.viewAllLink}>View All &gt;</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.map((tx, idx) => {
            const isGave = tx.transaction_type === 'you_gave';
            const color = isGave ? '#EF4444' : '#22C55E';
            const sign = isGave ? '+ ' : '- ';

            return (
              <View key={tx.id} style={styles.txRow}>
                <View style={[styles.txAvatarCircle, { backgroundColor: isGave ? '#EF4444' : '#22C55E' }]}>
                  <Text style={styles.txAvatarInitial}>{isGave ? 'R' : 'S'}</Text>
                </View>
                <View style={styles.txInfoCol}>
                  <Text style={[styles.txNameText, { color: colors.textPrimary }]}>
                    {idx === 0 ? 'Shyam' : idx === 1 ? 'Rahul' : idx === 2 ? 'Amit' : 'Suresh'}
                  </Text>
                  <Text style={[styles.txNoteText, { color: colors.textSecondary }]}>
                    {tx.note || (isGave ? 'Maine Diye' : 'Mujhe Mile')}
                  </Text>
                </View>
                <Text style={[styles.txDateCol, { color: colors.textSecondary }]}>
                  {formatDate(tx.transaction_date)}
                </Text>
                <Text style={[styles.txAmountText, { color }]}>
                  {sign}{formatCurrency(tx.amount, true)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Bottom Section: Expenses Overview, System Overview, Admin Quick Actions */}
      <View style={[styles.bottomRow, isDesktop && { flexDirection: 'row' }]}>
        {/* Expenses Overview */}
        <View style={[styles.bottomCard, isDesktop ? { flex: 1 } : { width: '100%' }, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.tableCardHeader}>
            <Text style={[styles.tableCardTitle, { color: colors.textPrimary }]}>Expenses Overview</Text>
            <View style={styles.filterPillSmall}>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>This Month ▾</Text>
            </View>
          </View>

          <View style={styles.expensesContentRow}>
            {/* Donut */}
            <View style={styles.donutContainer}>
              <Svg width="96" height="96" viewBox="0 0 100 100">
                <Circle cx="50" cy="50" r="38" stroke="#FF7A00" strokeWidth="12" strokeDasharray="95 145" fill="none" transform="rotate(-90 50 50)" />
                <Circle cx="50" cy="50" r="38" stroke="#22C55E" strokeWidth="12" strokeDasharray="60 180" fill="none" transform="rotate(50 50 50)" />
                <Circle cx="50" cy="50" r="38" stroke="#8B5CF6" strokeWidth="12" strokeDasharray="36 204" fill="none" transform="rotate(145 50 50)" />
              </Svg>
              <View style={styles.donutCenterLabel}>
                <Text style={[styles.donutTotalVal, { fontSize: 13, color: colors.textPrimary }]}>₹28,500</Text>
                <Text style={[styles.donutTotalSub, { fontSize: 9, color: colors.textSecondary }]}>Total</Text>
              </View>
            </View>

            {/* Category breakdown */}
            <View style={styles.expensesLegendCol}>
              {expenseCategories.map((cat, i) => (
                <View key={i} style={styles.expenseLegendRow}>
                  <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                  <Text style={[styles.expenseCatName, { color: colors.textSecondary }]}>{cat.name}</Text>
                  <Text style={[styles.expenseCatPct, { color: colors.textPrimary }]}>{cat.pct}</Text>
                  <Text style={[styles.expenseCatAmt, { color: colors.textPrimary }]}>{cat.amount}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* System Overview */}
        <View style={[styles.bottomCard, isDesktop ? { flex: 0.9 } : { width: '100%', marginTop: 12 }, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.tableCardTitle, { color: colors.textPrimary, marginBottom: 12 }]}>System Overview</Text>
          <View style={styles.systemRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="people-outline" size={16} color={colors.primary} />
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Total Users</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>4</Text>
          </View>
          <View style={styles.systemRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="storefront-outline" size={16} color={colors.primary} />
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Active Customers</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>156</Text>
          </View>
          <View style={styles.systemRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Total Reminders</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>23</Text>
          </View>
          <View style={[styles.systemRow, { borderBottomWidth: 0 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="server-outline" size={16} color={colors.primary} />
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Data Storage</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>78 MB</Text>
          </View>
        </View>

        {/* Admin Quick Actions (6 Interactive Action Cards) */}
        <View style={[styles.bottomCard, isDesktop ? { flex: 1.2 } : { width: '100%', marginTop: 12 }, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.tableCardTitle, { color: colors.textPrimary, marginBottom: 12 }]}>Admin Quick Actions</Text>
          <View style={styles.actionButtonsGrid}>
            {/* Add Customer */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('AddCustomer')}
              style={[styles.quickActionTile, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}
            >
              <Ionicons name="person-add" size={18} color="#FF7A00" />
              <Text style={[styles.quickActionTileText, { color: colors.textPrimary }]}>Add Customer</Text>
            </TouchableOpacity>

            {/* Add Expense */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('AddExpense')}
              style={[styles.quickActionTile, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}
            >
              <Ionicons name="wallet" size={18} color="#EAB308" />
              <Text style={[styles.quickActionTileText, { color: colors.textPrimary }]}>Add Expense</Text>
            </TouchableOpacity>

            {/* Manage Users */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setUsersModalVisible(true)}
              style={[styles.quickActionTile, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}
            >
              <Ionicons name="people" size={18} color="#3B82F6" />
              <Text style={[styles.quickActionTileText, { color: colors.textPrimary }]}>Manage Users</Text>
            </TouchableOpacity>

            {/* Update Avatars */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setAvatarPickerVisible(true)}
              style={[styles.quickActionTile, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}
            >
              <Ionicons name="image" size={18} color="#FF7A00" />
              <Text style={[styles.quickActionTileText, { color: colors.textPrimary }]}>Update Avatars</Text>
            </TouchableOpacity>

            {/* Edit Page Content */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setContentModalVisible(true)}
              style={[styles.quickActionTile, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}
            >
              <Ionicons name="document-text" size={18} color="#3B82F6" />
              <Text style={[styles.quickActionTileText, { color: colors.textPrimary }]}>Edit Page Content</Text>
            </TouchableOpacity>

            {/* Update Logo */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setBrandModalVisible(true)}
              style={[styles.quickActionTile, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}
            >
              <Ionicons name="diamond" size={18} color="#FF7A00" />
              <Text style={[styles.quickActionTileText, { color: colors.textPrimary }]}>Update Logo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.mainScreenContainer, { backgroundColor: colors.background }]}>
      {/* If Desktop: Render Desktop Shell with Left Sidebar */}
      {isDesktop ? (
        <View style={styles.desktopShell}>
          {/* Left Navigation Sidebar */}
          <View style={[styles.desktopSidebar, { backgroundColor: '#0B0F11', borderRightColor: '#1F1F1F' }]}>
            {/* Brand Header */}
            <View style={styles.sidebarBrandRow}>
              <View style={styles.sidebarLogoBox}>
                <Ionicons name="shapes" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.sidebarBrandTitle}>
                Hisab<Text style={{ color: '#FF7A00' }}>Pro</Text>
              </Text>
            </View>

            {/* Main Nav Items */}
            <View style={styles.sidebarNavList}>
              {[
                { name: 'Dashboard' as const, icon: 'grid-outline', activeIcon: 'grid' },
                { name: 'Customers' as const, icon: 'people-outline', activeIcon: 'people' },
                { name: 'Transactions' as const, icon: 'receipt-outline', activeIcon: 'receipt' },
                { name: 'Expenses' as const, icon: 'wallet-outline', activeIcon: 'wallet' },
                { name: 'Reports' as const, icon: 'bar-chart-outline', activeIcon: 'bar-chart' },
                { name: 'Reminders' as const, icon: 'notifications-outline', activeIcon: 'notifications' },
                { name: 'Users' as const, icon: 'person-outline', activeIcon: 'person' },
              ].map((item) => {
                const isActive = activeSidebarTab === item.name;
                return (
                  <TouchableOpacity
                    key={item.name}
                    activeOpacity={0.8}
                    onPress={() => handleSidebarNav(item.name)}
                    style={[
                      styles.sidebarNavItem,
                      isActive && { backgroundColor: '#FF7A00' },
                    ]}
                  >
                    <Ionicons
                      name={isActive ? (item.activeIcon as any) : (item.icon as any)}
                      size={18}
                      color={isActive ? '#0B0F11' : '#94A3B8'}
                    />
                    <Text
                      style={[
                        styles.sidebarNavText,
                        { color: isActive ? '#0B0F11' : '#94A3B8', fontWeight: isActive ? '800' : '600' },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* ADMIN TOOLS Heading */}
              <View style={styles.sidebarSectionDivider}>
                <Text style={styles.sidebarSectionHeader}>ADMIN TOOLS</Text>
                <View style={styles.sidebarDividerLine} />
              </View>

              {/* Admin Tools List */}
              <TouchableOpacity activeOpacity={0.7} onPress={() => setAvatarPickerVisible(true)} style={styles.sidebarNavItem}>
                <Ionicons name="images-outline" size={17} color="#94A3B8" />
                <Text style={[styles.sidebarNavText, { color: '#94A3B8' }]}>Update Avatars</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7} onPress={() => setContentModalVisible(true)} style={styles.sidebarNavItem}>
                <Ionicons name="document-text-outline" size={17} color="#94A3B8" />
                <Text style={[styles.sidebarNavText, { color: '#94A3B8' }]}>Page Content</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7} onPress={() => setBrandModalVisible(true)} style={styles.sidebarNavItem}>
                <Ionicons name="diamond-outline" size={17} color="#94A3B8" />
                <Text style={[styles.sidebarNavText, { color: '#94A3B8' }]}>Brand & Logo</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7} onPress={() => setUsersModalVisible(true)} style={styles.sidebarNavItem}>
                <Ionicons name="shield-checkmark-outline" size={17} color="#94A3B8" />
                <Text style={[styles.sidebarNavText, { color: '#94A3B8' }]}>Admin Management</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Main', { screen: 'Profile' })} style={styles.sidebarNavItem}>
                <Ionicons name="settings-outline" size={17} color="#94A3B8" />
                <Text style={[styles.sidebarNavText, { color: '#94A3B8' }]}>Settings</Text>
              </TouchableOpacity>
            </View>

            {/* Sidebar Footer */}
            <View style={styles.sidebarFooter}>
              <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '700' }}>v1.0.0</Text>
              <View style={styles.sidebarCollapseBtn}>
                <Ionicons name="chevron-back" size={14} color="#94A3B8" />
              </View>
            </View>
          </View>

          {/* Right Main Panel */}
          <View style={styles.desktopMainPanel}>
            {/* Top Bar with Search & User Profile */}
            <View style={[styles.desktopTopBar, { backgroundColor: '#0B0F11', borderBottomColor: '#1F1F1F' }]}>
              {/* Search Bar */}
              <View style={styles.desktopSearchBox}>
                <Ionicons name="search" size={16} color="#94A3B8" />
                <TextInput
                  placeholder="Search customers, transactions, expenses..."
                  placeholderTextColor="#64748B"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.desktopSearchInput}
                />
              </View>

              {/* Notification & User Profile Badge */}
              <View style={styles.desktopTopRight}>
                <TouchableOpacity style={styles.bellBtn}>
                  <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
                  <View style={styles.redDot} />
                </TouchableOpacity>

                <View style={styles.adminProfileChip}>
                  <View style={styles.topBarAvatar}>
                    <Ionicons name="person" size={16} color="#FF7A00" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Abhishek Dagar</Text>
                    <View style={styles.adminTagRow}>
                      <Text style={{ fontSize: 9, fontWeight: '900', color: '#FF7A00' }}>👑 ADMIN</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Scrollable Dashboard Body */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
              {renderDashboardContent()}
            </ScrollView>
          </View>
        </View>
      ) : (
        /* If Mobile / Tablet: Render Exact Mobile UI */
        <View style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.mobileScrollContent}>
            {renderDashboardContent()}
          </ScrollView>
          <BottomNavBar activeTab="Profile" />
        </View>
      )}

      {/* Time Filter Modal */}
      <Modal visible={timeFilterModal} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setTimeFilterModal(false)}
          style={styles.modalBackdrop}
        >
          <View style={[styles.filterModalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Reporting Timeframe</Text>
            {[
              { id: 'today' as const, label: '📅 Today' },
              { id: 'week' as const, label: '📅 This Week' },
              { id: 'month' as const, label: '📅 This Month (Default)' },
              { id: 'year' as const, label: '📅 This Year' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => {
                  setTimeFilter(opt.id);
                  setTimeFilterModal(false);
                }}
                style={[
                  styles.filterOptionRow,
                  timeFilter === opt.id && { backgroundColor: 'rgba(255, 122, 0, 0.15)' },
                ]}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    { color: timeFilter === opt.id ? colors.primary : colors.textPrimary },
                  ]}
                >
                  {opt.label}
                </Text>
                {timeFilter === opt.id && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Manage Users Modal */}
      <Modal visible={usersModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.fullModalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                User <Text style={{ color: colors.primary }}>Management</Text>
              </Text>
              <TouchableOpacity onPress={() => setUsersModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>
              Manage registered merchants, monitor active sessions, and configure permissions.
            </Text>

            <View style={[styles.userListItem, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}>
              <View style={styles.userListLeft}>
                <View style={styles.superAdminAvatar}>
                  <Text style={{ color: '#FFF', fontWeight: '900' }}>AD</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>Abhishek Dagar</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>abhidagar6319@gmail.com</Text>
                  <Text style={{ fontSize: 11, color: colors.primary, marginTop: 2 }}>👑 Super Admin • Protected</Text>
                </View>
              </View>
              <View style={[styles.activePill, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                <Text style={{ color: '#22C55E', fontWeight: '800', fontSize: 11 }}>Active</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Brand & Logo Modal */}
      <Modal visible={brandModalVisible} animationType="fade" transparent>
        <TouchableOpacity activeOpacity={1} onPress={() => setBrandModalVisible(false)} style={styles.modalBackdrop}>
          <View style={[styles.brandModalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Brand & Logo Settings</Text>
            <View style={styles.brandPreviewBox}>
              <View style={styles.logoBadgeBig}>
                <Ionicons name="shapes" size={32} color="#FFFFFF" />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '900', color: colors.textPrimary, marginTop: 10 }}>
                Hisab<Text style={{ color: '#FF7A00' }}>Pro</Text>
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                Simple Accounts. Better Business.
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setBrandModalVisible(false);
                Alert.alert('Brand Logo', 'HisabPro official vector logo branding is active platform-wide.');
              }}
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={{ fontWeight: '800', color: '#0B0F11' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Page Content Modal */}
      <Modal visible={contentModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.fullModalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Edit Page Content</Text>
              <TouchableOpacity onPress={() => setContentModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 14 }}>
              Customize your app brand name, tagline, and customer statements header.
            </Text>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>App / Business Name</Text>
            <TextInput
              value={businessName}
              onChangeText={setBusinessName}
              style={[styles.modalTextInput, { backgroundColor: colors.cardElevated, color: colors.textPrimary, borderColor: colors.border }]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>Brand Tagline</Text>
            <TextInput
              value={businessTagline}
              onChangeText={setBusinessTagline}
              style={[styles.modalTextInput, { backgroundColor: colors.cardElevated, color: colors.textPrimary, borderColor: colors.border }]}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setContentModalVisible(false);
                Alert.alert('Saved', 'Page content updated successfully.');
              }}
              style={[styles.saveBtn, { backgroundColor: colors.primary, marginTop: 18 }]}
            >
              <Text style={{ fontWeight: '800', color: '#0B0F11' }}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        visible={avatarPickerVisible}
        selectedAvatarId={profile?.avatar_id || 'abhishek'}
        onClose={() => setAvatarPickerVisible(false)}
        onSelect={async (avatarId: string) => {
          setAvatarPickerVisible(false);
          await updateAvatar(avatarId);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainScreenContainer: {
    flex: 1,
  },
  desktopShell: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopSidebar: {
    width: 230,
    borderRightWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  sidebarBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  sidebarLogoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarBrandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  sidebarNavList: {
    flex: 1,
    gap: 4,
  },
  sidebarNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  sidebarNavText: {
    fontSize: 13,
  },
  sidebarSectionDivider: {
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  sidebarSectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF7A00',
    letterSpacing: 0.8,
  },
  sidebarDividerLine: {
    height: 1,
    backgroundColor: '#242220',
    marginTop: 6,
  },
  sidebarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
  },
  sidebarCollapseBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopMainPanel: {
    flex: 1,
  },
  desktopTopBar: {
    height: 64,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  desktopSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 360,
    gap: 8,
  },
  desktopSearchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    paddingVertical: 2,
  },
  desktopTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  bellBtn: {
    position: 'relative',
    padding: 6,
  },
  redDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  adminProfileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBarAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#242220',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FF7A00',
  },
  adminTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  dashboardContainer: {
    gap: 14,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  greetingSub: {
    fontSize: 12,
    marginTop: 2,
  },
  dateFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  dateFilterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: 140,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  metricCardTop: {
    marginBottom: 8,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  trendGreen: {
    fontSize: 10,
    fontWeight: '800',
    color: '#22C55E',
    marginTop: 4,
  },
  trendRed: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
    marginTop: 4,
  },
  chartsRow: {
    gap: 12,
  },
  chartCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  filterPillSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1E1E1E',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  barChartWrapper: {
    marginTop: 4,
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 4,
  },
  xAxisLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  splitContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  donutContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutTotalVal: {
    fontSize: 16,
    fontWeight: '900',
  },
  donutTotalSub: {
    fontSize: 10,
  },
  splitMetricsCol: {
    flex: 1,
    marginLeft: 18,
    gap: 12,
  },
  splitMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  splitIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  splitVal: {
    fontSize: 14,
    fontWeight: '900',
  },
  splitEntries: {
    fontSize: 10,
  },
  tablesRow: {
    gap: 12,
  },
  tableCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  tableCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tableCardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  viewAllLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF7A00',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: 10,
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: '700',
    width: 14,
  },
  customerAvatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerAvatarInitial: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  customerInfoCol: {
    flex: 1,
  },
  customerRowName: {
    fontSize: 13,
    fontWeight: '800',
  },
  customerRowPhone: {
    fontSize: 11,
  },
  customerRowAmount: {
    fontSize: 13,
    fontWeight: '800',
    marginRight: 6,
  },
  toReceivePill: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  toReceivePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: 10,
  },
  txAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txAvatarInitial: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  txInfoCol: {
    flex: 1,
  },
  txNameText: {
    fontSize: 13,
    fontWeight: '800',
  },
  txNoteText: {
    fontSize: 11,
  },
  txDateCol: {
    fontSize: 10,
    marginRight: 8,
  },
  txAmountText: {
    fontSize: 13,
    fontWeight: '800',
  },
  bottomRow: {
    gap: 12,
  },
  bottomCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  expensesContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expensesLegendCol: {
    flex: 1,
    marginLeft: 16,
    gap: 6,
  },
  expenseLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expenseCatName: {
    fontSize: 11,
    flex: 1,
  },
  expenseCatPct: {
    fontSize: 11,
    fontWeight: '700',
    width: 32,
  },
  expenseCatAmt: {
    fontSize: 11,
    fontWeight: '800',
  },
  systemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionTile: {
    width: '31%',
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quickActionTileText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  filterModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  filterOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  fullModalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  userListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  userListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  superAdminAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  brandModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  brandPreviewBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoBadgeBig: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  modalTextInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
  },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
