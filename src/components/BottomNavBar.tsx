import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { MainTabParamList } from '../types';

export type BottomNavTab = keyof MainTabParamList;

interface BottomNavBarProps {
  activeTab?: BottomNavTab;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab = 'Customers' }) => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const handleTabPress = (tabName: BottomNavTab) => {
    navigation.navigate('Main', { screen: tabName });
  };

  const tabs: {
    key: BottomNavTab;
    label: string;
    activeIcon: keyof typeof Ionicons.glyphMap;
    inactiveIcon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      key: 'Home',
      label: 'Home',
      activeIcon: 'home',
      inactiveIcon: 'home-outline',
    },
    {
      key: 'Customers',
      label: 'Customers',
      activeIcon: 'people',
      inactiveIcon: 'people-outline',
    },
    {
      key: 'Expenses',
      label: 'Expenses',
      activeIcon: 'wallet',
      inactiveIcon: 'wallet-outline',
    },
    {
      key: 'Profile',
      label: 'Profile',
      activeIcon: 'person',
      inactiveIcon: 'person-outline',
    },
  ];

  return (
    <View
      style={[
        styles.barContainer,
        {
          backgroundColor: colors.tabBarBackground || colors.card,
          borderTopColor: colors.tabBarBorder || colors.border,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const color = isActive ? colors.primary : colors.textSecondary;

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.7}
            onPress={() => handleTabPress(tab.key)}
            style={styles.tabButton}
          >
            <View style={styles.tabIconWrapper}>
              {isActive && (
                <View
                  style={[
                    styles.activeTopIndicator,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
              <Ionicons
                name={isActive ? tab.activeIcon : tab.inactiveIcon}
                size={22}
                color={color}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
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
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    width: 48,
    position: 'relative',
  },
  activeTopIndicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 1,
    marginBottom: Platform.OS === 'ios' ? 0 : 2,
  },
});
