import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatting';

interface StatCardProps {
  title: string;
  subtitle?: string;
  amount: number;
  type?: 'positive' | 'negative' | 'primary' | 'neutral';
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  subtitle,
  amount,
  type = 'neutral',
  style,
}) => {
  const { colors, isDark } = useTheme();

  let amountColor = colors.textPrimary;
  let accentBarColor = colors.border;

  if (type === 'positive') {
    amountColor = colors.positive;
    accentBarColor = colors.positive;
  } else if (type === 'negative') {
    amountColor = colors.negative;
    accentBarColor = colors.negative;
  } else if (type === 'primary') {
    amountColor = colors.primary;
    accentBarColor = colors.primary;
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <View style={[styles.accentIndicator, { backgroundColor: accentBarColor }]} />
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      <Text style={[styles.amount, { color: amountColor }]} numberOfLines={1}>
        {formatCurrency(amount)}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  accentIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  amount: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 3,
  },
});
