import React from 'react';
import { Image, ImageStyle, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  style?: ViewStyle;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'medium',
  showText = true,
  style,
}) => {
  const { colors } = useTheme();

  const iconSizes = {
    small: 32,
    medium: 40,
    large: 54,
  };

  const currentIconSize = iconSizes[size];

  const imageStyle: ImageStyle = {
    width: currentIconSize,
    height: currentIconSize,
    borderRadius: currentIconSize * 0.24,
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.imageContainer,
          {
            width: currentIconSize,
            height: currentIconSize,
            borderRadius: currentIconSize * 0.24,
            borderColor: colors.border,
            backgroundColor: '#0B0F11',
          },
        ]}
      >
        <Image
          source={require('../../assets/icon.png')}
          style={imageStyle}
          resizeMode="cover"
        />
      </View>

      {showText && (
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.hisabText,
                size === 'small' && styles.textSmall,
                size === 'large' && styles.textLarge,
                { color: colors.textPrimary },
              ]}
            >
              Hisab
            </Text>
            <Text
              style={[
                styles.proText,
                size === 'small' && styles.textSmall,
                size === 'large' && styles.textLarge,
                { color: colors.primary },
              ]}
            >
              Pro
            </Text>
          </View>
          {size !== 'small' && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Smart Ledger & Khata
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  imageContainer: {
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  textContainer: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hisabText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  proText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  textSmall: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 26,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: -1,
  },
});
