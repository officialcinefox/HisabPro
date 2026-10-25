import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { useTheme } from '../../context/ThemeContext';

export const PrivacyPolicyScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header Banner */}
      <Card style={styles.bannerCard}>
        <View style={styles.bannerIconRow}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: 'rgba(255, 122, 0, 0.15)' },
            ]}
          >
            <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>
              Privacy Policy
            </Text>
            <Text style={[styles.bannerDate, { color: colors.textSecondary }]}>
              Last Updated: October 2026 • Version 1.0.0
            </Text>
          </View>
        </View>
        <Text style={[styles.introText, { color: colors.textSecondary }]}>
          Your trust and privacy are fundamental to HisabPro. This Privacy Policy
          explains transparently how we collect, use, protect, and handle your
          financial bookkeeping records and personal data.
        </Text>
      </Card>

      {/* Section 1: Information We Collect */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="folder-open-outline" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            1. Information We Collect
          </Text>
        </View>
        <Card style={styles.card}>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            To provide digital ledger and khata tracking services, HisabPro collects:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletPoint, { color: colors.textPrimary }]}>
              • <Text style={{ fontWeight: '700' }}>Account Details:</Text> Your full
              name, business name, and email address used during registration.
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textPrimary }]}>
              • <Text style={{ fontWeight: '700' }}>Customer Ledger Data:</Text>{' '}
              Customer names, phone numbers, notes, transaction amounts (debits &
              credits), dates, and payment reminders entered by you.
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textPrimary }]}>
              • <Text style={{ fontWeight: '700' }}>Personal Expenses:</Text> Spending
              amounts, categories (Food, Bills, Travel, Shopping, Other), and expense
              dates recorded in your personal tracker.
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textPrimary }]}>
              • <Text style={{ fontWeight: '700' }}>Device & Session Info:</Text>{' '}
              Device platform (iOS/Android/Web), app version, and authentication tokens
              necessary to keep you securely signed in.
            </Text>
          </View>
        </Card>
      </View>

      {/* Section 2: How We Use Your Data */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="cog-outline" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            2. How We Use Your Information
          </Text>
        </View>
        <Card style={styles.card}>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            We strictly use your information to operate and enhance your bookkeeping
            experience:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletPoint, { color: colors.textPrimary }]}>
              • Calculating real-time outstanding balances (To Receive & To Pay).
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textPrimary }]}>
              • Synchronizing your financial records across your authenticated devices.
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textPrimary }]}>
              • Generating printable PDF statements and WhatsApp account summaries.
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textPrimary }]}>
              • Managing scheduled payment reminders and notification alerts.
            </Text>
          </View>
        </Card>
      </View>

      {/* Section 3: Data Security & Row Level Security */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            3. Data Security & Isolation
          </Text>
        </View>
        <Card style={styles.card}>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            All database operations are powered by enterprise PostgreSQL hosted on
            Supabase infrastructure with:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletPoint, { color: colors.textPrimary }]}>
              • <Text style={{ fontWeight: '700' }}>End-to-End Encryption:</Text> All
              data transmitted between your device and servers uses 256-bit TLS/SSL
              encryption.
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textPrimary }]}>
              • <Text style={{ fontWeight: '700' }}>Row Level Security (RLS):</Text> Strict
              cryptographic isolation guarantees that only your verified user ID can
              read, modify, or query your transactions. No other user can access your
              financial data.
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textPrimary }]}>
              • <Text style={{ fontWeight: '700' }}>No Sale of Personal Data:</Text> We
              never sell, rent, monetize, or trade your personal or financial data to
              advertisers or third-party brokers.
            </Text>
          </View>
        </Card>
      </View>

      {/* Section 4: Your Rights & Account Deletion */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="trash-bin-outline" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            4. Your Rights & Data Deletion
          </Text>
        </View>
        <Card style={styles.card}>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            You maintain complete ownership of your bookkeeping records:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletPoint, { color: colors.textPrimary }]}>
              • <Text style={{ fontWeight: '700' }}>Export:</Text> You can generate and
              download PDF statements of customer ledgers at any time.
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textPrimary }]}>
              • <Text style={{ fontWeight: '700' }}>Modification & Correction:</Text>{' '}
              You can edit customer details, notes, or delete erroneous transactions
              directly from the app.
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textPrimary }]}>
              • <Text style={{ fontWeight: '700' }}>Account & Data Deletion:</Text> You
              have the permanent right to delete your entire account and all associated
              records. You can initiate this from Profile Settings or by emailing
              support.
            </Text>
          </View>
        </Card>
      </View>

      {/* Section 5: Contact Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="mail-outline" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            5. Contact Us
          </Text>
        </View>
        <Card style={styles.card}>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            If you have questions, feedback, or concerns regarding your privacy or data
            security, please contact our support team:
          </Text>
          <Text
            style={[
              styles.contactEmail,
              { color: colors.primary, marginTop: 10, fontWeight: '700' },
            ]}
          >
            support@hisabpro.app
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary, marginTop: 4 }]}>
            HisabPro Software Solutions
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  bannerCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
  },
  bannerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  bannerDate: {
    fontSize: 12,
    marginTop: 2,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  card: {
    padding: 16,
    borderRadius: 14,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
  },
  bulletList: {
    marginTop: 10,
    gap: 8,
  },
  bulletPoint: {
    fontSize: 13,
    lineHeight: 19,
  },
  contactEmail: {
    fontSize: 15,
  },
});
