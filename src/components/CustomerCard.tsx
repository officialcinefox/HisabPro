import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { CustomerWithBalance } from '../types';
import { formatCurrency } from '../utils/formatting';
import { BalanceBadge } from './BalanceBadge';

interface CustomerCardProps {
  customer: CustomerWithBalance;
  onPress: () => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onPress }) => {
  const { colors } = useTheme();

  const isLenaHai = customer.status === 'lena_hai';
  const isDenaHai = customer.status === 'dena_hai';
  const balanceColor = isLenaHai
    ? colors.positive
    : isDenaHai
    ? colors.negative
    : colors.settled;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.avatarAndInfo}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {customer.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.customerInfo}>
            <Text
              style={[styles.customerName, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {customer.name}
            </Text>
            {customer.phone ? (
              <View style={styles.phoneRow}>
                <Ionicons name="call-outline" size={12} color={colors.textSecondary} />
                <Text style={[styles.phoneText, { color: colors.textSecondary }]}>
                  {customer.phone}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={[styles.balanceAmount, { color: balanceColor }]}>
            {formatCurrency(customer.displayAmount)}
          </Text>
          <BalanceBadge status={customer.status} size="small" />
        </View>
      </View>

      {customer.pendingRemindersCount > 0 ? (
        <View
          style={[
            styles.reminderIndicator,
            { backgroundColor: 'rgba(255, 122, 0, 0.12)' },
          ]}
        >
          <Ionicons name="alarm-outline" size={13} color={colors.primary} />
          <Text style={[styles.reminderText, { color: colors.primary }]}>
            {customer.pendingRemindersCount}{' '}
            {customer.pendingRemindersCount === 1 ? 'reminder' : 'reminders'} pending
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginVertical: 5,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarAndInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    fontSize: 12,
  },
  balanceContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  reminderIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 5,
  },
  reminderText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
