import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  style,
  disabled,
  ...props
}) => {
  const { colors } = useTheme();

  let backgroundColor = colors.primary;
  let textColor = '#0B0F11'; // Dark text on orange-filled buttons for optimal contrast
  let borderColor = 'transparent';
  let borderWidth = 0;

  if (variant === 'secondary') {
    backgroundColor = colors.cardElevated;
    textColor = colors.textPrimary;
  } else if (variant === 'outline') {
    backgroundColor = 'transparent';
    textColor = colors.primary;
    borderColor = colors.primary;
    borderWidth = 1.5;
  } else if (variant === 'danger') {
    backgroundColor = colors.negative;
    textColor = '#FFFFFF';
  } else if (variant === 'ghost') {
    backgroundColor = 'transparent';
    textColor = colors.textSecondary;
  }

  // Size styles
  let paddingVertical = 14;
  let paddingHorizontal = 20;
  let fontSize = 15;

  if (size === 'small') {
    paddingVertical = 8;
    paddingHorizontal = 14;
    fontSize = 13;
  } else if (size === 'large') {
    paddingVertical = 16;
    paddingHorizontal = 24;
    fontSize = 16;
  }

  const containerStyle: ViewStyle = {
    backgroundColor: disabled ? (colors.border) : backgroundColor,
    borderColor,
    borderWidth,
    paddingVertical,
    paddingHorizontal,
    opacity: disabled || loading ? 0.65 : 1,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[styles.button, containerStyle, style]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#0B0F11' : colors.primary}
        />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text
            style={[
              styles.text,
              {
                color: disabled ? colors.textSecondary : textColor,
                fontSize,
                marginLeft: icon ? 8 : 0,
              },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
