import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import { CustomersListScreen } from '../screens/customers/CustomersListScreen';
import { ExpensesScreen } from '../screens/expenses/ExpensesScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const TabNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Each screen renders its own rich branded header
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 82 : 62,
          paddingBottom: Platform.OS === 'ios' ? 24 : 6,
          paddingTop: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrapper}>
              {focused && (
                <View
                  style={[
                    styles.activeTopIndicator,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Customers"
        component={CustomersListScreen}
        options={{
          tabBarLabel: 'Customers',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrapper}>
              {focused && (
                <View
                  style={[
                    styles.activeTopIndicator,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
              <Ionicons
                name={focused ? 'people' : 'people-outline'}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          tabBarLabel: 'Expenses',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrapper}>
              {focused && (
                <View
                  style={[
                    styles.activeTopIndicator,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
              <Ionicons
                name={focused ? 'wallet' : 'wallet-outline'}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrapper}>
              {focused && (
                <View
                  style={[
                    styles.activeTopIndicator,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: '100%',
    width: 60,
    paddingTop: 4,
  },
  activeTopIndicator: {
    position: 'absolute',
    top: 0,
    width: 36,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});
