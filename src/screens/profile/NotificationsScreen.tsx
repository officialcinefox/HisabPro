import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { formatDate } from '../../utils/formatting';

export const NotificationsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { reminders } = useData();

  const [paymentReminders, setPaymentReminders] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

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
              { backgroundColor: 'rgba(139, 92, 246, 0.15)' },
            ]}
          >
            <Ionicons name="notifications" size={26} color="#8B5CF6" />
          </View>
          <View style={styles.bannerTextCol}>
            <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>
              Notifications & Alerts
            </Text>
            <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
              Manage in-app reminder alerts and ledger notifications
            </Text>
          </View>
        </View>
      </Card>

      {/* Preferences Section */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Alert Preferences
      </Text>

      <Card style={styles.menuCard}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <View
              style={[
                styles.toggleIconBox,
                { backgroundColor: 'rgba(255, 122, 0, 0.15)' },
              ]}
            >
              <Ionicons name="alarm-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.toggleTextCol}>
              <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>
                Customer Payment Reminders
              </Text>
              <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                Get alerted on scheduled reminder dates
              </Text>
            </View>
          </View>
          <Switch
            value={paymentReminders}
            onValueChange={setPaymentReminders}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <View
              style={[
                styles.toggleIconBox,
                { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
              ]}
            >
              <Ionicons name="calendar-outline" size={18} color="#3B82F6" />
            </View>
            <View style={styles.toggleTextCol}>
              <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>
                Daily Evening Summary
              </Text>
              <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                Receive a daily recap of today's credits and debits
              </Text>
            </View>
          </View>
          <Switch
            value={dailySummary}
            onValueChange={setDailySummary}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <View
              style={[
                styles.toggleIconBox,
                { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
              ]}
            >
              <Ionicons name="volume-high-outline" size={18} color="#22C55E" />
            </View>
            <View style={styles.toggleTextCol}>
              <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>
                Notification Sounds
              </Text>
              <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                Play cash register sound on saving transactions
              </Text>
            </View>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </Card>

      {/* Active Scheduled Reminders */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Scheduled Payment Reminders
        </Text>
        <Text style={[styles.sectionBadge, { color: colors.textSecondary }]}>
          {reminders.filter((r) => r.status === 'pending').length} active
        </Text>
      </View>

      {reminders.length > 0 ? (
        reminders.map((rem) => (
          <Card key={rem.id} style={styles.reminderCard}>
            <View style={styles.reminderLeft}>
              <View
                style={[
                  styles.reminderIconCircle,
                  {
                    backgroundColor:
                      rem.status === 'pending'
                        ? 'rgba(255, 122, 0, 0.15)'
                        : 'rgba(34, 197, 94, 0.15)',
                  },
                ]}
              >
                <Ionicons
                  name={rem.status === 'pending' ? 'alarm' : 'checkmark-done'}
                  size={18}
                  color={rem.status === 'pending' ? colors.primary : '#22C55E'}
                />
              </View>

              <View style={styles.reminderTextCol}>
                <Text style={[styles.reminderNote, { color: colors.textPrimary }]}>
                  {rem.note || 'Payment collection reminder'}
                </Text>
                <Text style={[styles.reminderDate, { color: colors.textSecondary }]}>
                  Scheduled for: {formatDate(rem.reminder_date)}
                </Text>
              </View>
            </View>

            <View style={styles.reminderRight}>
              <Text style={[styles.reminderAmt, { color: colors.primary }]}>
                ₹{rem.amount}
              </Text>
              <Text
                style={[
                  styles.reminderStatusPill,
                  {
                    color: rem.status === 'pending' ? colors.primary : '#22C55E',
                    backgroundColor:
                      rem.status === 'pending'
                        ? 'rgba(255, 122, 0, 0.12)'
                        : 'rgba(34, 197, 94, 0.12)',
                  },
                ]}
              >
                {rem.status === 'pending' ? 'Pending' : 'Completed'}
              </Text>
            </View>
          </Card>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Ionicons
            name="notifications-off-outline"
            size={36}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No Active Reminders
          </Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            You can set customer payment collection reminders from any customer's
            ledger page.
          </Text>
        </Card>
      )}
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
    width: 50,
    height: 50,
    borderRadius: 25,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 18,
  },
  sectionBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  menuCard: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  toggleIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toggleTextCol: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  toggleSub: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 50,
  },
  reminderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginVertical: 4,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  reminderIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderTextCol: {
    flex: 1,
  },
  reminderNote: {
    fontSize: 14,
    fontWeight: '700',
  },
  reminderDate: {
    fontSize: 12,
    marginTop: 2,
  },
  reminderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  reminderAmt: {
    fontSize: 16,
    fontWeight: '900',
  },
  reminderStatusPill: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 16,
    marginTop: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
