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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { RootStackParamList } from '../../types';

interface EditProfileScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const { profile, user, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setErrorMessage(null);

    if (!displayName.trim()) {
      setErrorMessage('Display name cannot be empty.');
      return;
    }

    setLoading(true);
    const { error } = await updateProfile(displayName, phone);
    setLoading(false);

    if (error) {
      setErrorMessage(error);
    } else {
      navigation.goBack();
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
        <Card style={styles.card}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Edit Profile
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Update your display name and contact phone number.
          </Text>

          {errorMessage ? (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: colors.negativeLight, borderColor: colors.negative },
              ]}
            >
              <Ionicons name="alert-circle" size={18} color={colors.negative} />
              <Text style={[styles.errorText, { color: colors.negative }]}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <Input
            label="Display Name *"
            placeholder="e.g. Ramesh Kumar"
            value={displayName}
            onChangeText={(text) => {
              setDisplayName(text);
              if (errorMessage) setErrorMessage(null);
            }}
            leftIcon={
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
            }
          />

          <Input
            label="Phone Number"
            placeholder="e.g. 9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={
              <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
            }
          />

          <Input
            label="Registered Email (Read-Only)"
            value={profile?.email || user?.email || ''}
            editable={false}
            leftIcon={
              <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
            }
          />

          <Text style={[styles.emailNotice, { color: colors.textSecondary }]}>
            ℹ️ Email address is linked to your authentication account and cannot be
            changed directly from here.
          </Text>

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
            size="large"
            style={styles.saveBtn}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    padding: 20,
    borderRadius: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
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
  errorText: {
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
  emailNotice: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: -8,
    marginBottom: 20,
  },
  saveBtn: {
    marginTop: 4,
  },
});
