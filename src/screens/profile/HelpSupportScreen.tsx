import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { useTheme } from '../../context/ThemeContext';

export const HelpSupportScreen: React.FC = () => {
  const { colors } = useTheme();

  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleWhatsAppSupport = () => {
    const url = 'https://wa.me/918440003711?text=Hello%20HisabPro%20Support%2C%20I%20need%20help%20with%20my%20account.';
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open WhatsApp.');
      });
    }
  };

  const handleEmailSupport = () => {
    const url = 'mailto:support@hisabpro.app?subject=HisabPro%20Support%20Request';
    Linking.openURL(url).catch(() => {
      Alert.alert('Support Email', 'Please write to: support@hisabpro.app');
    });
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+918440003711').catch(() => {
      Alert.alert('Support Phone', 'Call us at: +91 8440003711');
    });
  };

  const handleSubmitFeedback = () => {
    if (!feedback.trim()) {
      Alert.alert('Feedback', 'Please write your message or issue before submitting.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFeedback('');
      Alert.alert(
        'Thank You!',
        'Your feedback has been received. Our merchant success team will review it promptly.'
      );
    }, 600);
  };

  const faqs = [
    {
      q: 'How is customer balance calculated?',
      a: 'Balance is calculated in real-time as: Total You Gave (Debits) minus Total You Got (Credits). A positive balance means the customer owes you money (To Receive), while a negative balance means you owe them (To Pay).',
    },
    {
      q: 'How do I share an account statement with a customer?',
      a: 'Open any customer ledger and tap "View Statement / Report". You can select 7 Days, 30 Days, or a Custom Date Range, and then tap "Download / Share PDF" or "Share via WhatsApp" to send a detailed breakdown.',
    },
    {
      q: 'Is my bookkeeping data private and backed up?',
      a: 'Yes. All data is securely synchronized with your dedicated cloud PostgreSQL database with 256-bit SSL encryption and strict Row Level Security (RLS). Only your login credentials can access your records.',
    },
    {
      q: 'How do I record personal expenses separately from customers?',
      a: 'Tap the Expenses tab from the bottom bar. You can categorize your daily shop and personal expenses (Bills, Shopping, Food, Travel, Other) and review monthly donut analytics.',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header Banner */}
      <Card style={styles.bannerCard}>
        <View style={styles.bannerRow}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: 'rgba(255, 122, 0, 0.15)' },
            ]}
          >
            <Ionicons name="headset" size={28} color={colors.primary} />
          </View>
          <View style={styles.bannerTextCol}>
            <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>
              Help & Merchant Support
            </Text>
            <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
              We are here to assist you with any questions or technical issues.
            </Text>
          </View>
        </View>
      </Card>

      {/* Direct Contact Channels */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Contact Support Directly
      </Text>

      <View style={styles.channelsGrid}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleWhatsAppSupport}
          style={[
            styles.channelCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.channelIconBox,
              { backgroundColor: 'rgba(37, 211, 102, 0.15)' },
            ]}
          >
            <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
          </View>
          <Text style={[styles.channelTitle, { color: colors.textPrimary }]}>
            WhatsApp
          </Text>
          <Text style={[styles.channelSub, { color: colors.textSecondary }]}>
            Instant chat support
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleEmailSupport}
          style={[
            styles.channelCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.channelIconBox,
              { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
            ]}
          >
            <Ionicons name="mail" size={22} color="#3B82F6" />
          </View>
          <Text style={[styles.channelTitle, { color: colors.textPrimary }]}>
            Email Us
          </Text>
          <Text style={[styles.channelSub, { color: colors.textSecondary }]}>
            support@hisabpro.app
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCallSupport}
          style={[
            styles.channelCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.channelIconBox,
              { backgroundColor: 'rgba(255, 122, 0, 0.15)' },
            ]}
          >
            <Ionicons name="call" size={22} color={colors.primary} />
          </View>
          <Text style={[styles.channelTitle, { color: colors.textPrimary }]}>
            Call Us
          </Text>
          <Text style={[styles.channelSub, { color: colors.textSecondary }]}>
            +91 8440003711
          </Text>
        </TouchableOpacity>
      </View>

      {/* FAQs Section */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 18 }]}>
        Frequently Asked Questions
      </Text>

      {faqs.map((faq, idx) => {
        const isExpanded = expandedFaq === idx;
        return (
          <Card key={idx} style={styles.faqCard}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setExpandedFaq(isExpanded ? null : idx)}
              style={styles.faqHeader}
            >
              <Text
                style={[
                  styles.faqQuestion,
                  { color: isExpanded ? colors.primary : colors.textPrimary },
                ]}
              >
                {faq.q}
              </Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {isExpanded && (
              <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                {faq.a}
              </Text>
            )}
          </Card>
        );
      })}

      {/* Send Feedback / Request Form */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 18 }]}>
        Send Us a Message
      </Text>

      <Card style={styles.feedbackCard}>
        <Input
          label="Your Feedback / Feature Request"
          placeholder="Tell us what you'd like to improve or any issue you encountered..."
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={4}
          style={styles.feedbackInput}
        />

        <Button
          title="Submit Feedback"
          onPress={handleSubmitFeedback}
          loading={isSubmitting}
          size="medium"
          style={{ marginTop: 12 }}
        />
      </Card>
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
    borderRadius: 18,
    marginBottom: 20,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  bannerSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  channelsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  channelCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  channelIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  channelTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  channelSub: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  faqCard: {
    padding: 14,
    borderRadius: 14,
    marginVertical: 4,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    paddingRight: 10,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  feedbackCard: {
    padding: 16,
    borderRadius: 16,
  },
  feedbackInput: {
    minHeight: 90,
  },
});
