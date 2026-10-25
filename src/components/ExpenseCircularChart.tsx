import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { expenseCategoryColors } from '../theme/colors';
import { CategoryExpenseSummary } from '../types';
import { formatCurrency } from '../utils/formatting';

interface ExpenseCircularChartProps {
  data: CategoryExpenseSummary[];
  totalAmount: number;
}

export const ExpenseCircularChart: React.FC<ExpenseCircularChartProps> = ({
  data,
  totalAmount,
}) => {
  const { colors } = useTheme();

  const size = 180;
  const strokeWidth = 22;
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
              stroke={colors.cardElevated}
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
                fontSize: totalAmount > 999999 ? 13 : totalAmount > 99999 ? 15 : 17,
              },
            ]}
            numberOfLines={1}
          >
            {formatCurrency(totalAmount)}
          </Text>
        </View>
      </View>

      {/* Category Legend */}
      <View style={styles.legendContainer}>
        {activeSlices.map((item) => {
          const color = expenseCategoryColors[item.category] || colors.primary;
          return (
            <View key={item.category} style={styles.legendItem}>
              <View style={styles.legendLeft}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={[styles.legendName, { color: colors.textPrimary }]}>
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
    alignItems: 'center',
    marginVertical: 12,
  },
  chartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    height: 180,
    marginBottom: 16,
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  centerSub: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  centerAmount: {
    fontWeight: '900',
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  legendContainer: {
    width: '100%',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendName: {
    fontSize: 13,
    fontWeight: '600',
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  legendAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  legendPct: {
    fontSize: 12,
  },
});
