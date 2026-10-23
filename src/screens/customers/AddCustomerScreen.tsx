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
import { RootStackParamList } from '../../types';

interface AddCustomerScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddCustomer'>;
}

export const AddCustomerScreen: React.FC<AddCustomerScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { refreshData } = useData();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Customer name is required.');
      return;
    }

    if (!user) {
      setErrorMessage('You must be signed in to add a customer.');
      return;
    }

    setLoading(true);
    const { data, error } = await dataService.createCustomer(
      user.id,
      name,
      phone,
      notes
    );
    setLoading(false);

    if (error || !data) {
      setErrorMessage(error || 'Failed to save customer.');
    } else {
      await refreshData();
      // Navigate to the newly created customer's details
      navigation.replace('CustomerDetail', { customerId: data.id });
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
            New Customer
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter the customer's contact details to open their ledger account.
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

          <Input
            label="Customer Name *"
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errorMessage) setErrorMessage(null);
            }}
            leftIcon={
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
            }
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="e.g. 9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={
              <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
            }
          />

          <Input
            label="Notes (Optional)"
            placeholder="e.g. Shop nearby, wholesale client"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.notesInput}
            leftIcon={
              <Ionicons
                name="document-text-outline"
                size={18}
                color={colors.textSecondary}
              />
            }
          />

          <Button
            title="Save Customer"
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
  notesInput: {
    height: 70,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  saveBtn: {
    marginTop: 10,
  },
});
