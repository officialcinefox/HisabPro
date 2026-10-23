import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AuthStackParamList } from '../../types';

interface ResetPasswordScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;
  route: RouteProp<AuthStackParamList, 'ResetPassword'>;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const { resetPassword, signOut } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async () => {
    setErrorMessage(null);

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(password);
    setLoading(false);

    if (error) {
      setErrorMessage(error);
    } else {
      setIsSuccess(true);
      await signOut(); // Ensure user signs in with the new password
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
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {isSuccess ? (
            <View style={styles.successContainer}>
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: colors.positiveLight },
                ]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={42}
                  color={colors.positive}
                />
              </View>

              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Password Reset Successfully!
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Your password has been updated. You can now sign in with your new
                credentials.
              </Text>

              <Button
                title="Sign In with New Password"
                onPress={() => navigation.navigate('SignIn')}
                size="large"
                style={styles.submitBtn}
              />
            </View>
          ) : (
            <>
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: 'rgba(255, 122, 0, 0.15)' },
                ]}
              >
                <Ionicons name="lock-open-outline" size={32} color={colors.primary} />
              </View>

              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Set New Password
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Enter your new password below.
              </Text>

              {errorMessage ? (
                <View
                  style={[
                    styles.errorBanner,
                    {
                      backgroundColor: colors.negativeLight,
                      borderColor: colors.negative,
                    },
                  ]}
                >
                  <Ionicons name="alert-circle" size={18} color={colors.negative} />
                  <Text style={[styles.errorBannerText, { color: colors.negative }]}>
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              <Input
                label="New Password (min 6 characters)"
                placeholder="Enter new password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                isPassword
                leftIcon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={colors.textSecondary}
                  />
                }
              />

              <Input
                label="Confirm New Password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                isPassword
                leftIcon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={colors.textSecondary}
                  />
                }
              />

              <Button
                title="Update Password"
                onPress={handleReset}
                loading={loading}
                size="large"
                style={styles.submitBtn}
              />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    elevation: 3,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 20,
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
  errorBannerText: {
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 8,
    width: '100%',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
