import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from '../../components/Input';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { RootStackParamList } from '../../types';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatting';
import {
  generateAndShareCustomerReportPdf,
  generatePlainTextReport,
} from '../../utils/pdfGenerator';

type PeriodMode = '7days' | '30days' | 'custom';

interface CustomerReportScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CustomerReport'>;
  route: RouteProp<RootStackParamList, 'CustomerReport'>;
}

export const CustomerReportScreen: React.FC<CustomerReportScreenProps> = ({
  navigation,
  route,
}) => {
  const { customerId } = route.params;
  const { colors } = useTheme();
  const { getCustomerById, getCustomerTransactions } = useData();

  const customer = getCustomerById(customerId);
  const allTransactions = getCustomerTransactions(customerId);

  const [periodMode, setPeriodMode] = useState<PeriodMode>('30days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState(getTodayDateString());
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute date filter
  const { filteredTx, periodLabel } = useMemo(() => {
    const today = new Date();
    let startDate: Date;
    let label = '';

    if (periodMode === '7days') {
      startDate = new Date();
      startDate.setDate(today.getDate() - 7);
      label = 'Last 7 Days';
    } else if (periodMode === '30days') {
      startDate = new Date();
      startDate.setDate(today.getDate() - 30);
      label = 'Last 30 Days';
    } else {
      label = `Custom (${customStart || 'Beginning'} to ${customEnd || 'Today'})`;
      return {
        filteredTx: allTransactions.filter((tx) => {
          if (customStart && tx.transaction_date < customStart) return false;
          if (customEnd && tx.transaction_date > customEnd) return false;
          return true;
        }),
        periodLabel: label,
      };
    }

    const startIso = startDate.toISOString().split('T')[0];
    return {
      filteredTx: allTransactions.filter((tx) => tx.transaction_date >= startIso),
      periodLabel: label,
    };
  }, [allTransactions, periodMode, customStart, customEnd]);

  // Period sums
  const { periodGave, periodGot } = useMemo(() => {
    let gave = 0;
    let got = 0;
    for (const tx of filteredTx) {
      const amt = Number(tx.amount) || 0;
      if (tx.transaction_type === 'you_gave') gave += amt;
      else got += amt;
    }
    return { periodGave: gave, periodGot: got };
  }, [filteredTx]);

  if (!customer) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textPrimary, padding: 20 }}>
          Customer not found
        </Text>
      </View>
    );
  }

  const handleSharePdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await generateAndShareCustomerReportPdf({
        customer,
        transactions: filteredTx,
        periodLabel,
      });
    } catch (e: any) {
      Alert.alert('PDF Error', e.message || 'Unable to generate PDF report.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareWhatsApp = async () => {
    const text = generatePlainTextReport({
      customer,
      transactions: filteredTx,
      periodLabel,
    });

    const encoded = encodeURIComponent(text);
    const cleanPhone = customer.phone ? customer.phone.replace(/[^0-9]/g, '') : '';
    const whatsappWebUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(whatsappWebUrl, '_blank');
      return;
    }

    const whatsappUrl = customer.phone
      ? `whatsapp://send?phone=${cleanPhone}&text=${encoded}`
      : `whatsapp://send?text=${encoded}`;

    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
    } else {
      await Share.share({
        message: text,
        title: `HisabPro Statement - ${customer.name}`,
      });
    }
  };

  const isLenaHai = customer.status === 'lena_hai';
  const isDenaHai = customer.status === 'dena_hai';
  const balanceColor = isLenaHai
    ? colors.positive
    : isDenaHai
    ? colors.negative
    : colors.settled;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Customer Header Info Card */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.reportSubtitle, { color: colors.textSecondary }]}>
          STATEMENT OF ACCOUNT
        </Text>
        <Text style={[styles.customerName, { color: colors.textPrimary }]}>
          {customer.name}
        </Text>
        {customer.phone ? (
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={13} color={colors.primary} />
            <Text style={[styles.phoneText, { color: colors.textSecondary }]}>
              {customer.phone}
            </Text>
          </View>
        ) : null}

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        <View style={styles.currentBalanceRow}>
          <Text style={[styles.currentBalanceLabel, { color: colors.textSecondary }]}>
            Overall Balance ({isLenaHai ? 'To Receive' : isDenaHai ? 'To Pay' : 'Settled'}):
          </Text>
          <Text style={[styles.currentBalanceValue, { color: balanceColor }]}>
            {formatCurrency(customer.displayAmount)}
          </Text>
        </View>
      </View>

      {/* Period Selection Tabs */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Select Reporting Period
      </Text>

      <View
        style={[
          styles.periodSelector,
          { backgroundColor: colors.cardElevated, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setPeriodMode('7days')}
          style={[
            styles.periodBtn,
            periodMode === '7days' && { backgroundColor: colors.primary },
          ]}
        >
          <Text
            style={[
              styles.periodBtnText,
              {
                color: periodMode === '7days' ? '#0B0F11' : colors.textSecondary,
                fontWeight: periodMode === '7days' ? '800' : '600',
              },
            ]}
          >
            7 Days
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setPeriodMode('30days')}
          style={[
            styles.periodBtn,
            periodMode === '30days' && { backgroundColor: colors.primary },
          ]}
        >
          <Text
            style={[
              styles.periodBtnText,
              {
                color: periodMode === '30days' ? '#0B0F11' : colors.textSecondary,
                fontWeight: periodMode === '30days' ? '800' : '600',
              },
            ]}
          >
            30 Days
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setPeriodMode('custom')}
          style={[
            styles.periodBtn,
            periodMode === 'custom' && { backgroundColor: colors.primary },
          ]}
        >
          <Text
            style={[
              styles.periodBtnText,
              {
                color: periodMode === 'custom' ? '#0B0F11' : colors.textSecondary,
                fontWeight: periodMode === 'custom' ? '800' : '600',
              },
            ]}
          >
            Custom Range
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom Date Range Inputs */}
      {periodMode === 'custom' ? (
        <View
          style={[
            styles.customCard,
            { backgroundColor: colors.cardElevated, borderColor: colors.border },
          ]}
        >
          <View style={styles.customRow}>
            <View style={{ flex: 1 }}>
              <Input
                label="Start Date"
                placeholder="YYYY-MM-DD"
                value={customStart}
                onChangeText={setCustomStart}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Input
                label="End Date"
                placeholder="YYYY-MM-DD"
                value={customEnd}
                onChangeText={setCustomEnd}
              />
            </View>
          </View>
        </View>
      ) : null}

      {/* Period Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            PERIOD GIVEN
          </Text>
          <Text style={[styles.metricValue, { color: colors.negative }]}>
            {formatCurrency(periodGave)}
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            PERIOD RECEIVED
          </Text>
          <Text style={[styles.metricValue, { color: colors.positive }]}>
            {formatCurrency(periodGot)}
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            ENTRIES
          </Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {filteredTx.length}
          </Text>
        </View>
      </View>

      {/* Action Buttons: Solid Orange PDF & Dark WhatsApp Button */}
      <View style={styles.actionsContainer}>
        {/* PDF Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSharePdf}
          disabled={isGeneratingPdf}
          style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="document-text" size={19} color="#0B0F11" />
          <Text style={styles.primaryActionText}>
            {isGeneratingPdf ? 'Generating PDF...' : 'Download / Share PDF'}
          </Text>
        </TouchableOpacity>

        {/* WhatsApp Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleShareWhatsApp}
          style={[
            styles.secondaryActionBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="logo-whatsapp" size={19} color="#25D366" />
          <Text style={[styles.secondaryActionText, { color: colors.textPrimary }]}>
            Share via WhatsApp
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transactions in Period */}
      <View style={styles.ledgerSectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
          Ledger Entries ({filteredTx.length})
        </Text>
      </View>

      {filteredTx.length > 0 ? (
        filteredTx.map((tx) => {
          const isGave = tx.transaction_type === 'you_gave';
          const typeColor = isGave ? '#EF4444' : '#22C55E';
          const typeLabel = isGave ? 'You Gave' : 'You Got';
          const signPrefix = isGave ? '+ ' : '- ';

          return (
            <View
              key={tx.id}
              style={[
                styles.txRowCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.txRowLeft}>
                <View
                  style={[
                    styles.txIconCircle,
                    {
                      backgroundColor: isGave
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(34, 197, 94, 0.15)',
                    },
                  ]}
                >
                  <Ionicons
                    name={isGave ? 'arrow-up' : 'arrow-down'}
                    size={17}
                    color={typeColor}
                  />
                </View>

                <View style={styles.txDetailsCol}>
                  <View style={styles.txTypeRow}>
                    <Text style={[styles.txTypeLabel, { color: typeColor }]}>
                      {typeLabel}
                    </Text>
                    <Text style={[styles.txDateText, { color: colors.textSecondary }]}>
                      • {formatDate(tx.transaction_date)}
                    </Text>
                  </View>
                  {tx.note ? (
                    <Text
                      style={[styles.txNoteText, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {tx.note}
                    </Text>
                  ) : null}
                </View>
              </View>

              <Text style={[styles.txRowAmount, { color: typeColor }]}>
                {signPrefix}
                {formatCurrency(tx.amount, true)}
              </Text>
            </View>
          );
        })
      ) : (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name="receipt-outline"
            size={32}
            color={colors.textSecondary}
            style={{ marginBottom: 8 }}
          />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No transactions found for the selected period.
          </Text>
        </View>
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
  headerCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  reportSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  customerName: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -0.3,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  phoneText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  currentBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentBalanceLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  currentBalanceValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  periodSelector: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 14,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  periodBtnText: {
    fontSize: 13,
  },
  customCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  customRow: {
    flexDirection: 'row',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  actionsContainer: {
    gap: 10,
    marginBottom: 18,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B0F11',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: '700',
  },
  ledgerSectionHeader: {
    marginBottom: 10,
  },
  txRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  txRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  txIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txDetailsCol: {
    flex: 1,
  },
  txTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txTypeLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  txDateText: {
    fontSize: 12,
    marginLeft: 4,
  },
  txNoteText: {
    fontSize: 11,
    marginTop: 2,
  },
  txRowAmount: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  emptyCard: {
    padding: 28,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 13,
  },
});
