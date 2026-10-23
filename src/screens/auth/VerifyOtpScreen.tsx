import React, { useEffect, useState } from 'react';
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
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AuthStackParamList } from '../../types';

interface VerifyOtpScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'VerifyOtp'>;
  route: RouteProp<AuthStackParamList, 'VerifyOtp'>;
}

export const VerifyOtpScreen: React.FC<VerifyOtpScreenProps> = ({
  navigation,
  route,
}) => {
  const { email } = route.params;
  const { colors } = useTheme();
  const { verifyPasswordResetOtp, sendPasswordResetCode } = useAuth();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const handleVerify = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanCode = code.trim();
    if (cleanCode.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    const { error } = await verifyPasswordResetOtp(email, cleanCode);
    setLoading(false);

    if (error) {
      setErrorMessage(error);
    } else {
      // Verified! Proceed to Reset Password screen
      navigation.navigate('ResetPassword', { email });
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setResending(true);

    const { error } = await sendPasswordResetCode(email);
    setResending(false);

    if (error) {
      setErrorMessage(error);
    } else {
      setSuccessMessage('A new verification code has been sent to your email.');
      setCooldown(60);
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
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: 'rgba(255, 122, 0, 0.15)' },
            ]}
          >
            <Ionicons name="shield-checkmark-outline" size={32} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Verify Code
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter the 6-digit code sent to:
          </Text>
          <Text style={[styles.emailBadge, { color: colors.primary }]}>
            {email}
          </Text>

          {errorMessage ? (
            <View
              style={[
                styles.banner,
                { backgroundColor: colors.negativeLight, borderColor: colors.negative },
              ]}
            >
              <Ionicons name="alert-circle" size={18} color={colors.negative} />
              <Text style={[styles.bannerText, { color: colors.negative }]}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {successMessage ? (
            <View
              style={[
                styles.banner,
                { backgroundColor: colors.positiveLight, borderColor: colors.positive },
              ]}
            >
              <Ionicons name="checkmark-circle" size={18} color={colors.positive} />
              <Text style={[styles.bannerText, { color: colors.positive }]}>
                {successMessage}
              </Text>
            </View>
          ) : null}

          <Input
            label="6-Digit Verification Code"
            placeholder="e.g. 123456"
            value={code}
            onChangeText={(text) => {
              setCode(text.replace(/[^0-9]/g, '').slice(0, 6));
              if (errorMessage) setErrorMessage(null);
            }}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.otpInput}
            leftIcon={
              <Ionicons name="keypad-outline" size={18} color={colors.textSecondary} />
            }
          />

          <Button
            title="Verify Code"
            onPress={handleVerify}
            loading={loading}
            size="large"
            style={styles.submitBtn}
          />

          <View style={styles.resendRow}>
            {cooldown > 0 ? (
              <Text style={[styles.cooldownText, { color: colors.textSecondary }]}>
                Resend code in {cooldown}s
              </Text>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleResend}
                disabled={resending}
              >
                <Text style={[styles.resendLink, { color: colors.primary }]}>
                  {resending ? 'Sending...' : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
  backButton: {
    marginBottom: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    elevation: 3,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  },
  emailBadge: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 2,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  bannerText: {
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
  otpInput: {
    fontSize: 20,
    letterSpacing: 6,
    textAlign: 'center',
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 16,
  },
  resendRow: {
    alignItems: 'center',
    padding: 8,
  },
  cooldownText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
