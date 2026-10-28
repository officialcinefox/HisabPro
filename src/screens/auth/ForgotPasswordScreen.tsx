import React, { useState } from 'react';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AuthStackParamList } from '../../types';

interface ForgotPasswordScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const { sendPasswordResetCode } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendCode = async () => {
    setErrorMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    const { error } = await sendPasswordResetCode(email);
    setLoading(false);

    if (error) {
      setErrorMessage(error);
    } else {
      navigation.navigate('VerifyOtp', { email: email.trim().toLowerCase() });
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
            <Ionicons name="key-outline" size={32} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Forgot <Text style={{ color: colors.primary }}>Password</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your registered email address. We'll send you a 6-digit verification
            code to reset your password.
          </Text>

          {errorMessage ? (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: colors.negativeLight, borderColor: colors.negative },
              ]}
            >
              <Ionicons name="alert-circle" size={18} color={colors.negative} />
              <Text style={[styles.errorBannerText, { color: colors.negative }]}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <Input
            label="Registered Email"
            placeholder="name@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errorMessage) setErrorMessage(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={
              <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
            }
          />

          <Button
            title="Send 6-Digit Code"
            onPress={handleSendCode}
            loading={loading}
            size="large"
            style={styles.submitBtn}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SignIn')}
            style={styles.backToSignIn}
          >
            <Text style={[styles.backToSignInText, { color: colors.primary }]}>
              ← Back to Sign In
            </Text>
          </TouchableOpacity>
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
    marginBottom: 16,
  },
  backToSignIn: {
    alignItems: 'center',
    padding: 6,
  },
  backToSignInText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
