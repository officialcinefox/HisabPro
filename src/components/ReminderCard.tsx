import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Reminder } from '../types';
import { formatCurrency, formatDate, getTodayDateString } from '../utils/formatting';

interface ReminderCardProps {
  reminder: Reminder;
  onDelete?: (reminder: Reminder) => void;
  onMarkComplete?: (reminder: Reminder) => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onDelete,
  onMarkComplete,
}) => {
  const { colors } = useTheme();
  const today = getTodayDateString();
  const isPastDue = reminder.reminder_date < today && reminder.status === 'pending';
  const isCompleted = reminder.status === 'completed';

  const badgeColor = isCompleted
    ? colors.settled
    : isPastDue
    ? colors.negative
    : colors.primary;

  const badgeBg = isCompleted
    ? colors.settledLight
    : isPastDue
    ? colors.negativeLight
    : 'rgba(255, 122, 0, 0.15)';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isPastDue ? colors.negative : colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.amountContainer}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
            Target Amount
          </Text>
          <Text style={[styles.amount, { color: colors.textPrimary }]}>
            {formatCurrency(reminder.amount)}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.statusText, { color: badgeColor }]}>
            {isCompleted ? 'Completed' : isPastDue ? 'Past Due' : 'Upcoming'}
          </Text>
        </View>
      </View>

      <View style={styles.dateRow}>
        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          Due Date: {formatDate(reminder.reminder_date)}
        </Text>
      </View>

      {reminder.note ? (
        <Text style={[styles.note, { color: colors.textPrimary }]}>
          {reminder.note}
        </Text>
      ) : null}

      <View style={styles.actionRow}>
        <Text style={[styles.inAppNotice, { color: colors.textSecondary }]}>
          📌 In-App Record
        </Text>

        <View style={styles.actionButtons}>
          {onMarkComplete && !isCompleted ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onMarkComplete(reminder)}
              style={[styles.smallBtn, { backgroundColor: colors.positiveLight }]}
            >
              <Ionicons name="checkmark-circle" size={16} color={colors.positive} />
              <Text style={[styles.btnText, { color: colors.positive }]}>Done</Text>
            </TouchableOpacity>
          ) : null}

          {onDelete ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onDelete(reminder)}
              style={[styles.smallBtn, { backgroundColor: colors.negativeLight }]}
            >
              <Ionicons name="trash-outline" size={16} color={colors.negative} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginVertical: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  note: {
    fontSize: 13,
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  inAppNotice: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
