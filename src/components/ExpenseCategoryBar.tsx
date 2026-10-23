import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { expenseCategoryColors } from '../theme/colors';
import { ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/formatting';

interface ExpenseCategoryBarProps {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

export const ExpenseCategoryBar: React.FC<ExpenseCategoryBarProps> = ({
  category,
  amount,
  percentage,
}) => {
  const { colors } = useTheme();
  const color = expenseCategoryColors[category] || colors.primary;

  // Clamped percentage 0 - 100
  const clampedPct = Math.min(Math.max(percentage, 0), 100);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.categoryBadge}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={[styles.categoryName, { color: colors.textPrimary }]}>
            {category}
          </Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={[styles.amount, { color: colors.textPrimary }]}>
            {formatCurrency(amount)}
          </Text>
          <Text style={[styles.percentage, { color: colors.textSecondary }]}>
            ({clampedPct.toFixed(1)}%)
          </Text>
        </View>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.cardElevated }]}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${clampedPct}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
  },
  percentage: {
    fontSize: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});
