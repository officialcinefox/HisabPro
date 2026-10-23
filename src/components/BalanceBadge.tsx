import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CustomerStatus } from '../types';
import { getStatusBadgeInfo } from '../utils/formatting';

interface BalanceBadgeProps {
  status: CustomerStatus;
  size?: 'small' | 'medium';
}

export const BalanceBadge: React.FC<BalanceBadgeProps> = ({ status, size = 'small' }) => {
  const { colors } = useTheme();
  const info = getStatusBadgeInfo(status);

  let textColor = colors.settled;
  let bg = colors.settledLight;

  if (info.type === 'positive') {
    textColor = colors.positive;
    bg = colors.positiveLight;
  } else if (info.type === 'negative') {
    textColor = colors.negative;
    bg = colors.negativeLight;
  }

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 8 : 12,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: textColor,
            width: isSmall ? 5 : 7,
            height: isSmall ? 5 : 7,
          },
        ]}
      />
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: isSmall ? 11 : 13,
          },
        ]}
      >
        {info.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: 4,
    marginRight: 5,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
