import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
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

  const isWeb = Platform.OS === 'web';

  return (
    <View
      style={[
        styles.outerWrapper,
        {
          backgroundColor: isWeb ? (isDark ? '#050709' : '#E2E8F0') : colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            borderColor: isWeb ? colors.border : 'transparent',
          },
        ]}
      >
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 580 : undefined,
    borderLeftWidth: Platform.OS === 'web' ? 1 : 0,
    borderRightWidth: Platform.OS === 'web' ? 1 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'web' ? 0.3 : 0,
    shadowRadius: 16,
    elevation: Platform.OS === 'web' ? 8 : 0,
    overflow: 'hidden',
    position: 'relative',
  },
});
