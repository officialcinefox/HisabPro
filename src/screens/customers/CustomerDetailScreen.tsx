import React, { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { ConfirmModal } from '../../components/ConfirmModal';
import { ReminderCard } from '../../components/ReminderCard';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { dataService } from '../../services/dataService';
import { Reminder, RootStackParamList, Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatting';

interface CustomerDetailScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CustomerDetail'>;
  route: RouteProp<RootStackParamList, 'CustomerDetail'>;
}

export const CustomerDetailScreen: React.FC<CustomerDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { customerId } = route.params;
  const { colors } = useTheme();
  const {
    getCustomerById,
    getCustomerTransactions,
    getCustomerReminders,
    refreshData,
  } = useData();

  const customer = getCustomerById(customerId);
  const transactions = getCustomerTransactions(customerId);
  const reminders = getCustomerReminders(customerId);

  const [deleteCustomerModal, setDeleteCustomerModal] = useState(false);
  const [deleteTxModal, setDeleteTxModal] = useState(false);
  const [targetTx, setTargetTx] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!customer) {
    return (
      <View style={[styles.notFoundContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.negative} />
        <Text style={[styles.notFoundTitle, { color: colors.textPrimary }]}>
          Customer Not Found
        </Text>
        <Text style={[styles.notFoundSub, { color: colors.textSecondary }]}>
          This customer may have been deleted.
        </Text>
        <Button
          title="Back to Customers"
          onPress={() => navigation.goBack()}
          size="medium"
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  const handleCall = () => {
    if (customer.phone) {
      Linking.openURL(`tel:${customer.phone}`).catch(() => {
        Alert.alert('Error', 'Unable to make phone call from this device.');
      });
    }
  };

  const confirmDeleteCustomer = async () => {
    setIsDeleting(true);
    const { error } = await dataService.deleteCustomer(customer.id);
    setIsDeleting(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      setDeleteCustomerModal(false);
      await refreshData();
      navigation.goBack();
    }
  };

  const confirmDeleteTransaction = async () => {
    if (!targetTx) return;
    setIsDeleting(true);
    const { error } = await dataService.deleteTransaction(targetTx.id);
    setIsDeleting(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      setDeleteTxModal(false);
      setTargetTx(null);
      await refreshData();
    }
  };

  const handleDeleteReminder = async (rem: Reminder) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dataService.deleteReminder(rem.id);
            await refreshData();
          },
        },
      ]
    );
  };

  const handleCompleteReminder = async (rem: Reminder) => {
    await dataService.updateReminderStatus(rem.id, 'completed');
    await refreshData();
  };

  const isLenaHai = customer.status === 'lena_hai';
  const isDenaHai = customer.status === 'dena_hai';
  const balanceColor = isLenaHai
    ? colors.positive
    : isDenaHai
    ? colors.negative
    : colors.settled;

  const initialLetter = (customer.name || 'C').charAt(0).toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Header Card */}
        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Top Info Row */}
          <View style={styles.headerTop}>
            <View style={styles.headerLeftInfo}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{initialLetter}</Text>
              </View>
              <View style={styles.customerNameCol}>
                <Text
                  style={[styles.customerName, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {customer.name}
                </Text>
                {customer.phone ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleCall}
                    style={styles.phoneClickable}
                  >
                    <Ionicons name="call" size={12} color={colors.primary} />
                    <Text style={[styles.customerPhone, { color: colors.primary }]}>
                      {customer.phone}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.noPhoneText, { color: colors.textSecondary }]}>
                    No phone number
                  </Text>
                )}
              </View>
            </View>

            {/* Red Circle Delete Trash Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setDeleteCustomerModal(true)}
              style={styles.deleteCustomerBtn}
            >
              <Ionicons name="trash-outline" size={17} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {customer.notes ? (
            <View
              style={[
                styles.notesContainer,
                { backgroundColor: colors.cardElevated, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Notes:</Text>
              <Text style={[styles.notesText, { color: colors.textPrimary }]}>
                {customer.notes}
              </Text>
            </View>
          ) : null}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Outstanding Balance Row */}
          <View style={styles.balanceRow}>
            <View>
              <Text style={[styles.balanceSub, { color: colors.textSecondary }]}>
                CURRENT OUTSTANDING
              </Text>
              <Text style={[styles.balanceTotal, { color: balanceColor }]}>
                {formatCurrency(customer.displayAmount, true)}
              </Text>
            </View>

            {/* Status Pill Badge */}
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isLenaHai
                    ? 'rgba(34, 197, 94, 0.15)'
                    : isDenaHai
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(156, 163, 175, 0.15)',
                  borderColor: isLenaHai
                    ? 'rgba(34, 197, 94, 0.35)'
                    : isDenaHai
                    ? 'rgba(239, 68, 68, 0.35)'
                    : 'rgba(156, 163, 175, 0.35)',
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isLenaHai
                      ? colors.positive
                      : isDenaHai
                      ? colors.negative
                      : colors.settled,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: isLenaHai
                      ? colors.positive
                      : isDenaHai
                      ? colors.negative
                      : colors.settled,
                  },
                ]}
              >
                {isLenaHai ? 'To Receive' : isDenaHai ? 'To Pay' : 'Settled'}
              </Text>
            </View>
          </View>

          {/* 3-Column Stats Box */}
          <View
            style={[
              styles.breakdownRow,
              { backgroundColor: colors.cardElevated, borderColor: colors.border },
            ]}
          >
            <View style={styles.breakdownCol}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                You Gave
              </Text>
              <Text style={[styles.breakdownValue, { color: colors.negative }]}>
                {formatCurrency(customer.totalGave)}
              </Text>
            </View>

            <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />

            <View style={styles.breakdownCol}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                You Got
              </Text>
              <Text style={[styles.breakdownValue, { color: colors.positive }]}>
                {formatCurrency(customer.totalGot)}
              </Text>
            </View>

            <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />

            <View style={styles.breakdownCol}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                Entries
              </Text>
              <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>
                {transactions.length}
              </Text>
            </View>
          </View>
        </View>

        {/* 2x2 Action Buttons Grid */}
        {/* Row 1: You Gave (+) & You Got (-) */}
        <View style={styles.actionGridRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('AddTransaction', {
                customerId: customer.id,
                initialType: 'you_gave',
              })
            }
            style={[
              styles.actionPillBtn,
              {
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderColor: '#EF4444',
              },
            ]}
          >
            <Ionicons name="arrow-up-circle" size={18} color="#EF4444" />
            <Text style={[styles.actionPillText, { color: '#EF4444' }]}>
              You Gave (+)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('AddTransaction', {
                customerId: customer.id,
                initialType: 'you_got',
              })
            }
            style={[
              styles.actionPillBtn,
              {
                backgroundColor: 'rgba(34, 197, 94, 0.08)',
                borderColor: '#22C55E',
              },
            ]}
          >
            <Ionicons name="arrow-down-circle" size={18} color="#22C55E" />
            <Text style={[styles.actionPillText, { color: '#22C55E' }]}>
              You Got (-)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: Add Reminder & View Statement */}
        <View style={styles.actionGridRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AddReminder', { customerId: customer.id })}
            style={[
              styles.secondaryActionCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="alarm-outline" size={18} color={colors.primary} />
            <Text
              style={[styles.secondaryActionText, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              Add Reminder
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CustomerReport', { customerId: customer.id })}
            style={[
              styles.secondaryActionCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="document-text-outline" size={18} color={colors.primary} />
            <Text
              style={[styles.secondaryActionText, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              View Statement / Report
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reminders Section */}
        {reminders.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Saved Reminders ({reminders.length})
              </Text>
            </View>
            {reminders.map((rem) => (
              <ReminderCard
                key={rem.id}
                reminder={rem}
                onDelete={handleDeleteReminder}
                onMarkComplete={handleCompleteReminder}
              />
            ))}
          </View>
        ) : null}

        {/* Transaction Ledger Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Transaction Ledger
            </Text>
            <Text style={[styles.txCountBadge, { color: colors.textSecondary }]}>
              {transactions.length} total
            </Text>
          </View>

          {transactions.length > 0 ? (
            transactions.map((tx) => {
              const isGave = tx.transaction_type === 'you_gave';
              const typeColor = isGave ? '#EF4444' : '#22C55E';
              const typeLabel = isGave ? 'You Gave' : 'You Got';
              const signPrefix = isGave ? '+ ' : '- ';

              return (
                <View
                  key={tx.id}
                  style={[
                    styles.txCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.txLeftCol}>
                    <View
                      style={[
                        styles.txIconCircle,
                        {
                          backgroundColor: isGave
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(34, 197, 94, 0.15)',
                        },
                      ]}
                    >
                      <Ionicons
                        name={isGave ? 'arrow-up' : 'arrow-down'}
                        size={18}
                        color={typeColor}
                      />
                    </View>

                    <View style={styles.txDetailsCol}>
                      <View style={styles.txTypeRow}>
                        <Text style={[styles.txTypeLabel, { color: typeColor }]}>
                          {typeLabel}
                        </Text>
                        <Text style={[styles.txDateText, { color: colors.textSecondary }]}>
                          • {formatDate(tx.transaction_date)}
                        </Text>
                      </View>

                      {tx.note ? (
                        <Text
                          style={[styles.txNoteText, { color: colors.textSecondary }]}
                          numberOfLines={2}
                        >
                          {tx.note}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.txRightCol}>
                    <Text style={[styles.txAmountText, { color: typeColor }]}>
                      {signPrefix}
                      {formatCurrency(tx.amount, true)}
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setTargetTx(tx);
                        setDeleteTxModal(true);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.txDeleteBtn}
                    >
                      <Ionicons name="trash-outline" size={15} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View
              style={[
                styles.emptyLedgerCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="receipt-outline"
                size={34}
                color={colors.textSecondary}
                style={{ marginBottom: 8 }}
              />
              <Text style={[styles.emptyLedgerText, { color: colors.textSecondary }]}>
                No transactions recorded for this customer yet.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Delete Customer Modal */}
      <ConfirmModal
        visible={deleteCustomerModal}
        title="Delete Customer?"
        message={`Are you sure you want to permanently delete "${customer.name}"?\n\n⚠️ Deleting this customer also permanently deletes all their recorded transactions and reminders. This cannot be undone.`}
        confirmLabel="Delete Permanently"
        isDestructive
        loading={isDeleting}
        onConfirm={confirmDeleteCustomer}
        onCancel={() => setDeleteCustomerModal(false)}
      />

      {/* Delete Transaction Modal */}
      <ConfirmModal
        visible={deleteTxModal}
        title="Delete Transaction?"
        message={`Are you sure you want to delete this ${
          targetTx?.transaction_type === 'you_gave' ? 'You Gave' : 'You Got'
        } transaction of ${formatCurrency(targetTx?.amount || 0)}?\n\nThe customer balance will be recalculated immediately.`}
        confirmLabel="Delete Entry"
        isDestructive
        loading={isDeleting}
        onConfirm={confirmDeleteTransaction}
        onCancel={() => {
          setDeleteTxModal(false);
          setTargetTx(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
  },
  notFoundSub: {
    fontSize: 14,
    marginTop: 4,
  },
  headerCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#242220',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FF7A00',
  },
  customerNameCol: {
    flex: 1,
  },
  customerName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  phoneClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  customerPhone: {
    fontSize: 13,
    fontWeight: '700',
  },
  noPhoneText: {
    fontSize: 12,
    marginTop: 3,
  },
  deleteCustomerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesContainer: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  notesText: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  balanceSub: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  balanceTotal: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  breakdownRow: {
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  breakdownCol: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownDivider: {
    width: 1,
    height: '100%',
  },
  breakdownLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },
  actionGridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  actionPillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  actionPillText: {
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  txCountBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 4,
  },
  txLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  txIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txDetailsCol: {
    flex: 1,
  },
  txTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txTypeLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  txDateText: {
    fontSize: 12,
    marginLeft: 4,
  },
  txNoteText: {
    fontSize: 11,
    marginTop: 2,
  },
  txRightCol: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  txAmountText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  txDeleteBtn: {
    padding: 4,
  },
  emptyLedgerCard: {
    alignItems: 'center',
    paddingVertical: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyLedgerText: {
    fontSize: 13,
  },
});
