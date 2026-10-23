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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { dataService } from '../../services/dataService';
import { expenseCategoryColors } from '../../theme/colors';
import { ExpenseCategory, RootStackParamList } from '../../types';
import { getTodayDateString } from '../../utils/formatting';

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Other',
];

interface AddExpenseScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddExpense'>;
}

export const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { refreshData } = useData();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [date, setDate] = useState(getTodayDateString());
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setErrorMessage(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid expense amount.');
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
    const { error } = await dataService.createExpense(
      user.id,
      parsedAmount,
      category,
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
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            New Personal Expense
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Record your daily spending to keep your budget on track.
          </Text>

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

          {/* Amount */}
          <Input
            label="Expense Amount (₹) *"
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

          {/* Category Selector Chips */}
          <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
            Category *
          </Text>
          <View style={styles.categoryChips}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              const catColor = expenseCategoryColors[cat] || colors.primary;

              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.7}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? catColor : colors.cardElevated,
                      borderColor: isSelected ? catColor : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Date */}
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

          {/* Note */}
          <Input
            label="Expense Note (Optional)"
            placeholder="e.g. Lunch with client, Petrol"
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
            title="Save Expense"
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
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 18,
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
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
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
