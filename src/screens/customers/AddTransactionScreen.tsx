import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { dataService } from '../../services/dataService';
import { RootStackParamList, TransactionType } from '../../types';
import { getTodayDateString } from '../../utils/formatting';

interface AddTransactionScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddTransaction'>;
  route: RouteProp<RootStackParamList, 'AddTransaction'>;
}

export const AddTransactionScreen: React.FC<AddTransactionScreenProps> = ({
  navigation,
  route,
}) => {
  const { customerId, initialType = 'you_gave' } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const { getCustomerById, refreshData } = useData();

  const customer = getCustomerById(customerId);

  const [txType, setTxType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isGave = txType === 'you_gave';

  const handleSave = async () => {
    setErrorMessage(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid amount greater than ₹0.');
      return;
    }

    if (!date.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      setErrorMessage('Please provide a valid date in YYYY-MM-DD format.');
      return;
    }

    if (!user) {
      setErrorMessage('You must be signed in to record a transaction.');
      return;
    }

    setLoading(true);
    const { error } = await dataService.createTransaction(
      user.id,
      customerId,
      txType,
      parsedAmount,
      date.trim(),
      note
    );
    setLoading(false);

    if (error) {
      setErrorMessage(error);
    } else {
      await refreshData();
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <Text style={[styles.customerHeader, { color: colors.textSecondary }]}>
            RECORD FOR CUSTOMER
          </Text>
          <Text style={[styles.customerName, { color: colors.textPrimary }]}>
            {customer?.name || 'Customer'}
          </Text>

          {/* Type Selector Toggle */}
          <View
            style={[
              styles.typeSelector,
              { backgroundColor: colors.cardElevated, borderColor: colors.border },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTxType('you_gave')}
              style={[
                styles.typeOption,
                isGave && {
                  backgroundColor: colors.negative,
                },
              ]}
            >
              <Ionicons
                name="arrow-up-circle"
                size={18}
                color={isGave ? '#FFFFFF' : colors.negative}
              />
              <Text
                style={[
                  styles.typeOptionText,
                  { color: isGave ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                You Gave
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTxType('you_got')}
              style={[
                styles.typeOption,
                !isGave && {
                  backgroundColor: colors.positive,
                },
              ]}
            >
              <Ionicons
                name="arrow-down-circle"
                size={18}
                color={!isGave ? '#FFFFFF' : colors.positive}
              />
              <Text
                style={[
                  styles.typeOptionText,
                  { color: !isGave ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                You Got
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.impactNotice}>
            <Text
              style={[
                styles.impactNoticeText,
                { color: isGave ? colors.negative : colors.positive },
              ]}
            >
              {isGave
                ? '🔴 This will INCREASE what the customer owes you (To Receive)'
                : '🟢 This will REDUCE the customer balance'}
            </Text>
          </View>

          {errorMessage ? (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: colors.negativeLight, borderColor: colors.negative },
              ]}
            >
              <Ionicons name="alert-circle" size={18} color={colors.negative} />
              <Text style={[styles.errorText, { color: colors.negative }]}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Amount Input */}
          <Input
            label="Transaction Amount (₹) *"
            placeholder="0"
            value={amount}
            onChangeText={(text) => {
              setAmount(text.replace(/[^0-9.]/g, ''));
              if (errorMessage) setErrorMessage(null);
            }}
            keyboardType="decimal-pad"
            style={styles.amountInput}
            leftIcon={
              <Text style={[styles.rupeeSymbol, { color: colors.primary }]}>₹</Text>
            }
          />

          {/* Date Input */}
          <Input
            label="Date (YYYY-MM-DD)"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
            leftIcon={
              <Ionicons
                name="calendar-outline"
                size={18}
                color={colors.textSecondary}
              />
            }
          />

          {/* Note Input */}
          <Input
            label="Note / Item description (Optional)"
            placeholder="e.g. 5 bags of cement, bill #104"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={2}
            style={styles.noteInput}
            leftIcon={
              <Ionicons
                name="document-text-outline"
                size={18}
                color={colors.textSecondary}
              />
            }
          />

          <Button
            title={`Save ${isGave ? 'You Gave' : 'You Got'}`}
            onPress={handleSave}
            loading={loading}
            size="large"
            style={[
              styles.saveBtn,
              {
                backgroundColor: isGave ? colors.primary : colors.positive,
              },
            ]}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    padding: 20,
    borderRadius: 18,
  },
  customerHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  customerName: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  impactNotice: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  impactNoticeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
  amountInput: {
    fontSize: 20,
    fontWeight: '800',
  },
  rupeeSymbol: {
    fontSize: 20,
    fontWeight: '800',
  },
  noteInput: {
    height: 60,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  saveBtn: {
    marginTop: 10,
  },
});
