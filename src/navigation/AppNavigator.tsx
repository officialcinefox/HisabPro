import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { AddCustomerScreen } from '../screens/customers/AddCustomerScreen';
import { AddReminderScreen } from '../screens/customers/AddReminderScreen';
import { AddTransactionScreen } from '../screens/customers/AddTransactionScreen';
import { CustomerDetailScreen } from '../screens/customers/CustomerDetailScreen';
import { CustomerReportScreen } from '../screens/customers/CustomerReportScreen';
import { AddExpenseScreen } from '../screens/expenses/AddExpenseScreen';
import { PrivacyPolicyScreen } from '../screens/legal/PrivacyPolicyScreen';
import { TermsScreen } from '../screens/legal/TermsScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { RootStackParamList } from '../types';
import { TabNavigator } from './TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18,
          color: colors.textPrimary,
        },
        headerTintColor: colors.primary,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
        options={{
          headerTitle: 'Customer Ledger',
        }}
      />

      <Stack.Screen
        name="AddCustomer"
        component={AddCustomerScreen}
        options={{
          headerTitle: 'Add Customer',
        }}
      />

      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{
          headerTitle: 'Record Transaction',
        }}
      />

      <Stack.Screen
        name="AddReminder"
        component={AddReminderScreen}
        options={{
          headerTitle: 'Set In-App Reminder',
        }}
      />

      <Stack.Screen
        name="CustomerReport"
        component={CustomerReportScreen}
        options={{
          headerTitle: 'Account Statement',
        }}
      />

      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{
          headerTitle: 'Record Expense',
        }}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerTitle: 'Edit Profile',
        }}
      />

      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          headerTitle: 'Privacy Policy',
        }}
      />

      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{
          headerTitle: 'Terms & Conditions',
        }}
      />
    </Stack.Navigator>
  );
};
