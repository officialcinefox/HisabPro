import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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
import { RootStackParamList } from '../../types';
import { getTodayDateString } from '../../utils/formatting';

interface AddReminderScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddReminder'>;
  route: RouteProp<RootStackParamList, 'AddReminder'>;
}

export const AddReminderScreen: React.FC<AddReminderScreenProps> = ({
  navigation,
  route,
}) => {
  const { customerId } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const { getCustomerById, refreshData } = useData();

  const customer = getCustomerById(customerId);

  const [amount, setAmount] = useState(
    customer?.status === 'lena_hai' ? String(customer.displayAmount) : ''
  );
  const [date, setDate] = useState(getTodayDateString());
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setErrorMessage(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid reminder amount.');
      return;
    }

    if (!date.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      setErrorMessage('Please enter a valid date in YYYY-MM-DD format.');
      return;
    }

    if (!user) {
      setErrorMessage('You must be signed in.');
      return;
    }

    setLoading(true);
    const { error } = await dataService.createReminder(
      user.id,
      customerId,
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
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            SET REMINDER FOR
          </Text>
          <Text style={[styles.customerName, { color: colors.textPrimary }]}>
            {customer?.name || 'Customer'}
          </Text>

          {/* Honest In-App Reminder Notice */}
          <View
            style={[
              styles.noticeCard,
              {
                backgroundColor: 'rgba(255, 122, 0, 0.1)',
                borderColor: colors.primary,
              },
            ]}
          >
            <Ionicons name="information-circle" size={18} color={colors.primary} />
            <Text style={[styles.noticeText, { color: colors.textPrimary }]}>
              This will save an in-app reminder record for you to track upcoming
              collection dates. (No automatic SMS or WhatsApp will be sent to the
              customer).
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

          <Input
            label="Reminder / Target Amount (₹) *"
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

          <Input
            label="Due Date (YYYY-MM-DD) *"
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

          <Input
            label="Reminder Note (Optional)"
            placeholder="e.g. Promised to pay after festival"
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
            title="Save Reminder"
            onPress={handleSave}
            loading={loading}
            size="large"
            style={styles.saveBtn}
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
  headerSub: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  customerName: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 14,
  },
  noticeCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 18,
    gap: 8,
  },
  noticeText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
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
    fontSize: 18,
    fontWeight: '800',
  },
  rupeeSymbol: {
    fontSize: 18,
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
