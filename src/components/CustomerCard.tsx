import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { CustomerWithBalance } from '../types';
import { formatCurrency, formatTimeAgo } from '../utils/formatting';
import { BalanceBadge } from './BalanceBadge';

interface CustomerCardProps {
  customer: CustomerWithBalance;
  onPress: () => void;
  onOptionsPress?: () => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onPress,
  onOptionsPress,
}) => {
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
      activeOpacity={0.78}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderLeftColor: colors.primary,
        },
      ]}
    >
      <View style={styles.mainRow}>
        {/* Left: Customer Initial Avatar in Warm Dark Circle */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {customer.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Center: Name, Phone, and Last Transaction Info */}
        <View style={styles.infoCol}>
          <Text
            style={[styles.customerName, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {customer.name}
          </Text>

          {customer.phone ? (
            <View style={styles.subRow}>
              <Ionicons name="call-outline" size={12} color={colors.textSecondary} />
              <Text style={[styles.subText, { color: colors.textSecondary }]}>
                {customer.phone}
              </Text>
            </View>
          ) : null}

          <View style={styles.subRow}>
            <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.subText, { color: colors.textSecondary }]}>
              Last transaction: {formatTimeAgo(customer.lastTransactionDate)}
            </Text>
          </View>
        </View>

        {/* Right: Amount, Status Badge, and Three Dots Menu */}
        <View style={styles.rightCol}>
          <View style={styles.rightTopRow}>
            <Text style={[styles.balanceAmount, { color: balanceColor }]}>
              {formatCurrency(customer.displayAmount)}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onOptionsPress || onPress}
              style={styles.moreBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

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
          <Ionicons name="alarm-outline" size={12} color={colors.primary} />
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
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderLeftWidth: 3.5,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#242220',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF7A00',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  subText: {
    fontSize: 12,
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
    marginLeft: 8,
  },
  rightTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  moreBtn: {
    padding: 2,
  },
  reminderIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
    gap: 5,
  },
  reminderText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
