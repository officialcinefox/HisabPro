import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { expenseCategoryColors } from '../theme/colors';
import { CategoryExpenseSummary, ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/formatting';

interface ExpenseCircularChartProps {
  data: CategoryExpenseSummary[];
  totalAmount: number;
}

const CATEGORY_ICONS: Record<ExpenseCategory, keyof typeof Ionicons.glyphMap> = {
  Bills: 'receipt-outline',
  Shopping: 'bag-handle-outline',
  Food: 'restaurant-outline',
  Travel: 'airplane-outline',
  Other: 'wallet-outline',
};

export const ExpenseCircularChart: React.FC<ExpenseCircularChartProps> = ({
  data,
  totalAmount,
}) => {
  const { colors } = useTheme();

  const size = 160;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Filter out zero amount categories
  const activeSlices = data.filter((item) => item.amount > 0);

  // Compute strokeDasharray and strokeDashoffset for each slice
  let accumulatedPercent = 0;
  const slicesWithOffset = activeSlices.map((slice) => {
    const strokeDashoffset = circumference - (accumulatedPercent / 100) * circumference;
    const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
    accumulatedPercent += slice.percentage;

    return {
      ...slice,
      color: expenseCategoryColors[slice.category] || colors.primary,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <View style={styles.container}>
      {/* Donut Circle */}
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            {/* Background Track Circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(139, 92, 246, 0.18)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Category Slices */}
            {slicesWithOffset.map((slice) => (
              <Circle
                key={slice.category}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            ))}
          </G>
        </Svg>

        {/* Center Label inside Donut */}
        <View style={styles.centerTextContainer}>
          <Text style={[styles.centerSub, { color: colors.textSecondary }]}>
            TOTAL
          </Text>
          <Text
            style={[
              styles.centerAmount,
              {
                color: colors.textPrimary,
                fontSize: totalAmount > 999999 ? 12 : totalAmount > 99999 ? 14 : 16,
              },
            ]}
            numberOfLines={1}
          >
            {formatCurrency(totalAmount)}
          </Text>
        </View>
      </View>

      {/* Category Legend (Side by Side matching reference) */}
      <View style={styles.legendContainer}>
        {activeSlices.map((item) => {
          const color = expenseCategoryColors[item.category] || colors.primary;
          const icon = CATEGORY_ICONS[item.category] || 'wallet-outline';
          return (
            <View key={item.category} style={styles.legendItem}>
              <View style={styles.legendLeft}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Ionicons
                  name={icon}
                  size={14}
                  color={color}
                  style={styles.categoryIcon}
                />
                <Text
                  style={[styles.legendName, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.category}
                </Text>
              </View>

              <View style={styles.legendRight}>
                <Text style={[styles.legendAmount, { color: colors.textPrimary }]}>
                  {formatCurrency(item.amount)}
                </Text>
                <Text style={[styles.legendPct, { color: colors.textSecondary }]}>
                  ({item.percentage.toFixed(1)}%)
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 10,
    gap: 12,
  },
  chartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  centerSub: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  centerAmount: {
    fontWeight: '900',
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  legendContainer: {
    flex: 1,
    minWidth: 170,
    gap: 6,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryIcon: {
    marginRight: 6,
  },
  legendName: {
    fontSize: 13,
    fontWeight: '700',
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  legendAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  legendPct: {
    fontSize: 11,
  },
});
