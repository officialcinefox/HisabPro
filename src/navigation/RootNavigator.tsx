import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { useAuth } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';

export const RootNavigator: React.FC = () => {
  const { session, isLoading } = useAuth();
  const { isDark, colors } = useTheme();

  if (isLoading) {
    return <LoadingOverlay message="Starting HisabPro..." />;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        {session ? (
          <DataProvider>
            <AppNavigator />
          </DataProvider>
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>
    </>
  );
};
