import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Transaction } from '../types';
import { formatCurrency, formatDate, getTransactionTypeInfo } from '../utils/formatting';

interface TransactionRowProps {
  transaction: Transaction;
  customerName?: string;
  onPressCustomer?: () => void;
  onDelete?: (transaction: Transaction) => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  customerName,
  onPressCustomer,
  onDelete,
}) => {
  const { colors } = useTheme();
  const isGave = transaction.transaction_type === 'you_gave';
  const typeInfo = getTransactionTypeInfo(transaction.transaction_type);

  const amountColor = isGave ? colors.negative : colors.positive;
  const iconName = isGave ? 'arrow-up-circle' : 'arrow-down-circle';

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.leftContainer}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: isGave ? colors.negativeLight : colors.positiveLight,
            },
          ]}
        >
          <Ionicons name={iconName} size={22} color={amountColor} />
        </View>

        <View style={styles.textDetails}>
          {customerName ? (
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={!onPressCustomer}
              onPress={onPressCustomer}
            >
              <Text
                style={[
                  styles.customerName,
                  { color: colors.textPrimary },
                ]}
                numberOfLines={1}
              >
                {customerName}
              </Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.typeBadgeRow}>
            <Text style={[styles.typeLabel, { color: amountColor }]}>
              {typeInfo.label}
            </Text>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              • {formatDate(transaction.transaction_date)}
            </Text>
          </View>

          {transaction.note ? (
            <Text
              style={[styles.noteText, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {transaction.note}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.rightContainer}>
        <Text style={[styles.amountText, { color: amountColor }]}>
          {typeInfo.sign} {formatCurrency(transaction.amount, true)}
        </Text>

        {onDelete ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onDelete(transaction)}
            style={styles.deleteButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 4,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    marginLeft: 4,
  },
  noteText: {
    fontSize: 11,
    marginTop: 2,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  deleteButton: {
    marginTop: 4,
    padding: 2,
  },
});
