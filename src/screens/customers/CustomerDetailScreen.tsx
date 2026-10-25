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
import { BalanceBadge } from '../../components/BalanceBadge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ConfirmModal } from '../../components/ConfirmModal';
import { ReminderCard } from '../../components/ReminderCard';
import { TransactionRow } from '../../components/TransactionRow';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { dataService } from '../../services/dataService';
import { Reminder, RootStackParamList, Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatting';

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Customer Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.customerNameBox}>
              <Text style={[styles.customerName, { color: colors.textPrimary }]}>
                {customer.name}
              </Text>
              {customer.phone ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleCall}
                  style={styles.phoneClickable}
                >
                  <Ionicons name="call" size={13} color={colors.primary} />
                  <Text style={[styles.customerPhone, { color: colors.primary }]}>
                    {customer.phone}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.noPhoneText, { color: colors.textSecondary }]}>
                  No phone number provided
                </Text>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setDeleteCustomerModal(true)}
              style={[
                styles.deleteCustomerBtn,
                { backgroundColor: colors.negativeLight },
              ]}
            >
              <Ionicons name="trash-outline" size={18} color={colors.negative} />
            </TouchableOpacity>
          </View>

          {customer.notes ? (
            <View style={styles.notesContainer}>
              <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
                Notes:
              </Text>
              <Text style={[styles.notesText, { color: colors.textPrimary }]}>
                {customer.notes}
              </Text>
            </View>
          ) : null}

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Balance Overview */}
          <View style={styles.balanceRow}>
            <View>
              <Text style={[styles.balanceSub, { color: colors.textSecondary }]}>
                CURRENT OUTSTANDING
              </Text>
              <Text style={[styles.balanceTotal, { color: balanceColor }]}>
                {formatCurrency(customer.displayAmount, true)}
              </Text>
            </View>
            <BalanceBadge status={customer.status} size="medium" />
          </View>

          {/* Summary Breakdown */}
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
        </Card>

        {/* Quick Action Buttons */}
        <View style={styles.quickBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('AddTransaction', {
                customerId: customer.id,
                initialType: 'you_gave',
              })
            }
            style={[styles.quickBtn, { backgroundColor: colors.negativeLight }]}
          >
            <Ionicons name="arrow-up-circle" size={18} color={colors.negative} />
            <Text style={[styles.quickBtnText, { color: colors.negative }]}>
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
            style={[styles.quickBtn, { backgroundColor: colors.positiveLight }]}
          >
            <Ionicons name="arrow-down-circle" size={18} color={colors.positive} />
            <Text style={[styles.quickBtnText, { color: colors.positive }]}>
              You Got (-)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.secondaryActions}>
          <Button
            title="Add Reminder"
            variant="secondary"
            size="small"
            icon={<Ionicons name="alarm-outline" size={16} color={colors.textPrimary} />}
            onPress={() =>
              navigation.navigate('AddReminder', { customerId: customer.id })
            }
            style={{ flex: 1 }}
          />

          <Button
            title="View Statement / Report"
            variant="secondary"
            size="small"
            icon={<Ionicons name="document-text-outline" size={16} color={colors.primary} />}
            onPress={() =>
              navigation.navigate('CustomerReport', { customerId: customer.id })
            }
            style={{ flex: 1.3 }}
          />
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
            transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                onDelete={(t) => {
                  setTargetTx(t);
                  setDeleteTxModal(true);
                }}
              />
            ))
          ) : (
            <Card style={styles.emptyLedgerCard}>
              <Ionicons
                name="receipt-outline"
                size={32}
                color={colors.textSecondary}
                style={{ marginBottom: 8 }}
              />
              <Text style={[styles.emptyLedgerText, { color: colors.textSecondary }]}>
                No transactions recorded for this customer yet.
              </Text>
            </Card>
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
          targetTx?.transaction_type === 'you_gave' ? 'Maine Diye' : 'Mujhe Mile'
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
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerNameBox: {
    flex: 1,
  },
  customerName: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  phoneClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
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
    letterSpacing: 0.5,
  },
  balanceTotal: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
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
  quickBar: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  quickBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
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
  },
  emptyLedgerCard: {
    alignItems: 'center',
    paddingVertical: 28,
    borderStyle: 'dashed',
  },
  emptyLedgerText: {
    fontSize: 13,
  },
});
