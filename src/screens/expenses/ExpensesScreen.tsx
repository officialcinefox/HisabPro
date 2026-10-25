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
import { FloatingActionButton } from '../../components/FloatingActionButton';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { expenseCategoryColors } from '../../theme/colors';
import { Expense, ExpenseCategory, RootStackParamList } from '../../types';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatting';
import { dataService } from '../../services/dataService';

const ALL_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Other',
];

export const ExpensesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { expenses, isLoading, refreshData } = useData();

  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [targetExpense, setTargetExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const todayStr = getTodayDateString();
  const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM

  // Current Month calculations
  const { monthTotal, categoryBreakdown } = useMemo(() => {
    let total = 0;
    const catSums: Record<ExpenseCategory, number> = {
      Food: 0,
      Travel: 0,
      Shopping: 0,
      Bills: 0,
      Other: 0,
    };

    for (const exp of expenses) {
      if (exp.expense_date.startsWith(currentMonthPrefix)) {
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
  }, [expenses, currentMonthPrefix]);

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
      <FlatList
        data={expenses}
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
            {/* Monthly Total Card */}
            <Card style={styles.monthCard}>
              <View style={styles.monthHeader}>
                <View>
                  <Text style={[styles.monthLabel, { color: colors.textSecondary }]}>
                    THIS MONTH'S EXPENSES
                  </Text>
                  <Text style={[styles.monthAmount, { color: colors.textPrimary }]}>
                    {formatCurrency(monthTotal)}
                  </Text>
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

              {/* Category Breakdown Bars */}
              {categoryBreakdown.length > 0 ? (
                <View style={styles.breakdownContainer}>
                  <Text
                    style={[styles.breakdownHeader, { color: colors.textSecondary }]}
                  >
                    Category Breakdown
                  </Text>
                  {categoryBreakdown.map((item) => (
                    <ExpenseCategoryBar
                      key={item.category}
                      category={item.category}
                      amount={item.amount}
                      percentage={item.percentage}
                    />
                  ))}
                </View>
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

            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                All Expenses
              </Text>
              <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
                {expenses.length} records
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const catColor = expenseCategoryColors[item.category] || colors.primary;
          return (
            <Card style={styles.expenseRowCard}>
              <View style={styles.rowLeft}>
                <View style={[styles.categoryIconCircle, { backgroundColor: catColor }]}>
                  <Ionicons name="wallet-outline" size={16} color="#FFFFFF" />
                </View>

                <View style={styles.expenseDetails}>
                  <Text
                    style={[styles.expenseCategory, { color: colors.textPrimary }]}
                  >
                    {item.category}
                  </Text>
                  <Text
                    style={[styles.expenseDate, { color: colors.textSecondary }]}
                  >
                    {formatDate(item.expense_date)}
                  </Text>
                  {item.note ? (
                    <Text
                      style={[styles.expenseNote, { color: colors.textSecondary }]}
                    >
                      {item.note}
                    </Text>
                  ) : null}
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
                  style={styles.deleteExpenseBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="trash-outline"
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
            title="No Expenses Recorded"
            description="Tap '+ Add Expense' below to track personal and shop expenses."
          />
        }
      />

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  monthCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  monthAmount: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  monthIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownContainer: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  breakdownHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  noExpenseMonthText: {
    fontSize: 12,
    marginTop: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionCount: {
    fontSize: 12,
  },
  expenseRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    marginVertical: 4,
    borderRadius: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  categoryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 15,
    fontWeight: '700',
  },
  expenseDate: {
    fontSize: 12,
    marginTop: 2,
  },
  expenseNote: {
    fontSize: 12,
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  deleteExpenseBtn: {
    marginTop: 6,
    padding: 4,
  },
});
