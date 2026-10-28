import React, { useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components/Card';
import { ConfirmModal } from '../../components/ConfirmModal';
import { EmptyState } from '../../components/EmptyState';
import { ExpenseCategoryBar } from '../../components/ExpenseCategoryBar';
import { ExpenseCircularChart } from '../../components/ExpenseCircularChart';
import { FloatingActionButton } from '../../components/FloatingActionButton';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { MonthPickerModal } from '../../components/MonthPickerModal';
import { SearchBar } from '../../components/SearchBar';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { expenseCategoryColors } from '../../theme/colors';
import { Expense, ExpenseCategory, RootStackParamList } from '../../types';
import { generateAndDownloadExpensesPdf } from '../../utils/expensePdfGenerator';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatting';
import { dataService } from '../../services/dataService';

const ALL_CATEGORIES: ExpenseCategory[] = [
  'Bills',
  'Shopping',
  'Food',
  'Travel',
  'Other',
];

const CATEGORY_ICONS: Record<ExpenseCategory, keyof typeof Ionicons.glyphMap> = {
  Bills: 'receipt-outline',
  Shopping: 'bag-handle-outline',
  Food: 'restaurant-outline',
  Travel: 'airplane-outline',
  Other: 'wallet-outline',
};

export const ExpensesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { expenses, isLoading, refreshData } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [targetExpense, setTargetExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [chartView, setChartView] = useState<'circle' | 'bars'>('circle');

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const selectedMonthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

  // Month label format e.g. "Oct 2026"
  const currentMonthLabel = useMemo(() => {
    try {
      const d = new Date(selectedYear, selectedMonth, 1);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return 'This Month';
    }
  }, [selectedYear, selectedMonth]);

  // Filtered expenses based on search query AND selected month
  const filteredExpenses = useMemo(() => {
    let list = expenses.filter((e) => e.expense_date.startsWith(selectedMonthPrefix));
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (e) =>
        e.category.toLowerCase().includes(q) ||
        (e.note && e.note.toLowerCase().includes(q))
    );
  }, [expenses, selectedMonthPrefix, searchQuery]);

  // Selected Month calculations
  const { monthTotal, categoryBreakdown } = useMemo(() => {
    let total = 0;
    const catSums: Record<ExpenseCategory, number> = {
      Bills: 0,
      Shopping: 0,
      Food: 0,
      Travel: 0,
      Other: 0,
    };

    for (const exp of expenses) {
      if (exp.expense_date.startsWith(selectedMonthPrefix)) {
        const amt = Number(exp.amount) || 0;
        total += amt;
        if (catSums[exp.category] !== undefined) {
          catSums[exp.category] += amt;
        } else {
          catSums.Other += amt;
        }
      }
    }

    const breakdown = ALL_CATEGORIES.map((cat) => {
      const amt = catSums[cat];
      const pct = total > 0 ? (amt / total) * 100 : 0;
      return { category: cat, amount: amt, percentage: pct };
    }).filter((item) => item.amount > 0);

    return { monthTotal: total, categoryBreakdown: breakdown };
  }, [expenses, selectedMonthPrefix]);

  // Previous month total to calculate accurate trend in PDF
  const previousMonthPrefix = useMemo(() => {
    let pm = selectedMonth - 1;
    let py = selectedYear;
    if (pm < 0) {
      pm = 11;
      py -= 1;
    }
    return `${py}-${String(pm + 1).padStart(2, '0')}`;
  }, [selectedMonth, selectedYear]);

  const previousMonthTotal = useMemo(() => {
    return expenses
      .filter((e) => e.expense_date.startsWith(previousMonthPrefix))
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses, previousMonthPrefix]);

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleDownloadExpensesPdf = async () => {
    setIsExportingPdf(true);
    try {
      await generateAndDownloadExpensesPdf({
        expenses: filteredExpenses,
        periodLabel: currentMonthLabel,
        totalExpenses: monthTotal,
        categoryBreakdown,
        previousMonthTotal,
      });
    } catch (e) {
      console.warn('PDF export error:', e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const confirmDelete = async () => {
    if (!targetExpense) return;
    setIsDeleting(true);
    const { error } = await dataService.deleteExpense(targetExpense.id);
    setIsDeleting(false);

    if (!error) {
      setDeleteModalVisible(false);
      setTargetExpense(null);
      await refreshData();
    }
  };

  if (isLoading && !refreshing) {
    return <LoadingOverlay message="Loading personal expenses..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Hero Header matching Reference Image */}
      <View style={styles.heroHeader}>
        <View style={styles.heroTextCol}>
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
            Personal <Text style={{ color: colors.primary }}>Expenses</Text>
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Track your spending and manage your budget
          </Text>
        </View>

        <View style={styles.heroActionsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleDownloadExpensesPdf}
            disabled={isExportingPdf}
            style={[
              styles.downloadPdfBtn,
              { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons name="document-text" size={13} color="#0B0F11" />
            <Text style={styles.downloadPdfText}>
              {isExportingPdf ? 'Exporting...' : 'PDF'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setMonthPickerVisible(true)}
            style={[
              styles.monthSelectPill,
              { backgroundColor: colors.cardElevated, borderColor: colors.border },
            ]}
          >
            <Ionicons name="calendar" size={13} color={colors.primary} />
            <Text style={[styles.monthSelectText, { color: colors.textPrimary }]}>
              {currentMonthLabel}
            </Text>
            <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <>
            {/* Card 1: THIS MONTH'S EXPENSES */}
            <Card style={styles.monthCard}>
              <View style={styles.monthTopRow}>
                <View>
                  <Text style={[styles.monthLabel, { color: colors.textSecondary }]}>
                    THIS MONTH'S EXPENSES
                  </Text>
                  <Text style={[styles.monthAmount, { color: colors.textPrimary }]}>
                    {formatCurrency(monthTotal)}
                  </Text>

                  <View style={styles.trendRow}>
                    <View style={styles.trendBadge}>
                      <Ionicons name="arrow-up" size={12} color="#22C55E" />
                      <Text style={styles.trendText}>12%</Text>
                    </View>
                    <Text style={[styles.trendSub, { color: colors.textSecondary }]}>
                      vs last month
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.monthIconWrapper,
                    { backgroundColor: 'rgba(255, 122, 0, 0.15)' },
                  ]}
                >
                  <Ionicons name="pie-chart" size={24} color={colors.primary} />
                </View>
              </View>
            </Card>

            {/* Card 2: Category Breakdown Card */}
            <Card style={styles.breakdownCard}>
              <View style={styles.breakdownHeaderRow}>
                <Text style={[styles.breakdownTitle, { color: colors.textPrimary }]}>
                  Category Breakdown
                </Text>

                <View
                  style={[
                    styles.viewToggleGroup,
                    {
                      backgroundColor: colors.cardElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setChartView('circle')}
                    style={[
                      styles.viewToggleBtn,
                      chartView === 'circle' && {
                        backgroundColor: colors.primary,
                      },
                    ]}
                  >
                    <Ionicons
                      name="pie-chart"
                      size={13}
                      color={chartView === 'circle' ? '#0B0F11' : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.toggleBtnText,
                        {
                          color:
                            chartView === 'circle'
                              ? '#0B0F11'
                              : colors.textSecondary,
                          fontWeight: chartView === 'circle' ? '700' : '500',
                        },
                      ]}
                    >
                      Pie Chart
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setChartView('bars')}
                    style={[
                      styles.viewToggleBtn,
                      chartView === 'bars' && {
                        backgroundColor: colors.primary,
                      },
                    ]}
                  >
                    <Ionicons
                      name="bar-chart"
                      size={13}
                      color={chartView === 'bars' ? '#0B0F11' : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.toggleBtnText,
                        {
                          color:
                            chartView === 'bars'
                              ? '#0B0F11'
                              : colors.textSecondary,
                          fontWeight: chartView === 'bars' ? '700' : '500',
                        },
                      ]}
                    >
                      Bar Chart
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {categoryBreakdown.length > 0 ? (
                chartView === 'circle' ? (
                  <ExpenseCircularChart
                    data={categoryBreakdown}
                    totalAmount={monthTotal}
                  />
                ) : (
                  categoryBreakdown.map((item) => (
                    <ExpenseCategoryBar
                      key={item.category}
                      category={item.category}
                      amount={item.amount}
                      percentage={item.percentage}
                    />
                  ))
                )
              ) : (
                <Text
                  style={[
                    styles.noExpenseMonthText,
                    { color: colors.textSecondary },
                  ]}
                >
                  No expenses recorded in the current month yet.
                </Text>
              )}
            </Card>

            {/* Section Header: All Expenses */}
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  All <Text style={{ color: colors.primary }}>Expenses</Text>
                </Text>
                <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
                  ({filteredExpenses.length})
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDownloadExpensesPdf}
                disabled={isExportingPdf}
                style={[
                  styles.downloadReportBtn,
                  { backgroundColor: colors.cardElevated, borderColor: colors.primary },
                ]}
              >
                <Ionicons name="download-outline" size={13} color={colors.primary} />
                <Text style={[styles.downloadReportBtnText, { color: colors.primary }]}>
                  {isExportingPdf ? 'Exporting...' : 'Report PDF'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search & Filter Row */}
            <View style={styles.searchRow}>
              <View style={{ flex: 1 }}>
                <SearchBar
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search expenses by category or note..."
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.filterBtn,
                  {
                    backgroundColor: colors.cardElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="filter" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const catColor = expenseCategoryColors[item.category] || colors.primary;
          const catIcon = CATEGORY_ICONS[item.category] || 'wallet-outline';

          return (
            <Card style={styles.expenseRowCard}>
              <View style={styles.rowLeft}>
                <View style={[styles.categoryIconCircle, { backgroundColor: catColor }]}>
                  <Ionicons name={catIcon} size={18} color="#FFFFFF" />
                </View>

                <View style={styles.expenseDetails}>
                  <Text
                    style={[styles.expenseCategory, { color: colors.textPrimary }]}
                  >
                    {item.category}
                  </Text>
                  {item.note ? (
                    <Text
                      style={[styles.expenseNote, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {item.note}
                    </Text>
                  ) : null}
                  <View style={styles.dateRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[styles.expenseDate, { color: colors.textSecondary }]}
                    >
                      {formatDate(item.expense_date)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.rowRight}>
                <Text style={[styles.expenseAmount, { color: colors.negative }]}>
                  - {formatCurrency(item.amount, true)}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setTargetExpense(item);
                    setDeleteModalVisible(true);
                  }}
                  style={styles.moreExpenseBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={16}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            iconName="receipt-outline"
            title={searchQuery ? 'No Matching Expenses' : 'No Expenses Recorded'}
            description={
              searchQuery
                ? 'Try a different keyword or category.'
                : 'Tap "+ Add Expense" below to track personal and shop expenses.'
            }
          />
        }
      />

      {/* Bottom Floating Action Button */}
      <FloatingActionButton
        label="Add Expense"
        iconName="add"
        onPress={() => navigation.navigate('AddExpense')}
      />

      {/* Delete Expense Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        title="Delete Expense?"
        message={`Are you sure you want to delete this ${targetExpense?.category} expense of ${formatCurrency(targetExpense?.amount || 0)}?`}
        confirmLabel="Delete"
        isDestructive
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setTargetExpense(null);
        }}
      />

      {/* Month & Year Picker Modal */}
      <MonthPickerModal
        visible={monthPickerVisible}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onSelect={(year, month) => {
          setSelectedYear(year);
          setSelectedMonth(month);
        }}
        onClose={() => setMonthPickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  downloadPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  downloadPdfText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0B0F11',
  },
  downloadReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  downloadReportBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  monthSelectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  monthSelectText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  monthCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
  },
  monthTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  monthAmount: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#22C55E',
  },
  trendSub: {
    fontSize: 11,
  },
  monthIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownCard: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
  },
  breakdownHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    gap: 2,
  },
  viewToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  toggleBtnText: {
    fontSize: 12,
  },
  noExpenseMonthText: {
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  expenseRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    marginVertical: 4,
    borderRadius: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  expenseNote: {
    fontSize: 12,
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  expenseDate: {
    fontSize: 11,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  moreExpenseBtn: {
    padding: 4,
  },
});
