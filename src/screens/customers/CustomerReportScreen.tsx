import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
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
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
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
    const whatsappUrl = customer.phone
      ? `whatsapp://send?phone=${customer.phone.replace(/[^0-9]/g, '')}&text=${encoded}`
      : `whatsapp://send?text=${encoded}`;

    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
    } else {
      // Fallback to standard native Share sheet
      await Share.share({
        message: text,
        title: `HisabPro Statement - ${customer.name}`,
      });
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Customer Header Info */}
      <Card style={styles.headerCard}>
        <Text style={[styles.reportTitle, { color: colors.textSecondary }]}>
          STATEMENT OF ACCOUNT
        </Text>
        <Text style={[styles.customerName, { color: colors.textPrimary }]}>
          {customer.name}
        </Text>
        {customer.phone ? (
          <Text style={[styles.phoneText, { color: colors.textSecondary }]}>
            📞 {customer.phone}
          </Text>
        ) : null}

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        <View style={styles.currentBalanceRow}>
          <Text style={[styles.currentBalanceLabel, { color: colors.textSecondary }]}>
            Overall Balance ({customer.status === 'lena_hai' ? 'Lena Hai' : customer.status === 'dena_hai' ? 'Dena Hai' : 'Settled'}):
          </Text>
          <Text
            style={[
              styles.currentBalanceValue,
              {
                color:
                  customer.status === 'lena_hai'
                    ? colors.positive
                    : customer.status === 'dena_hai'
                    ? colors.negative
                    : colors.settled,
              },
            ]}
          >
            {formatCurrency(customer.displayAmount)}
          </Text>
        </View>
      </Card>

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
                fontWeight: periodMode === '7days' ? '700' : '500',
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
                fontWeight: periodMode === '30days' ? '700' : '500',
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
                fontWeight: periodMode === 'custom' ? '700' : '500',
              },
            ]}
          >
            Custom Range
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom Date Range Inputs */}
      {periodMode === 'custom' ? (
        <Card style={styles.customCard}>
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
        </Card>
      ) : null}

      {/* Period Metrics */}
      <View style={styles.metricsGrid}>
        <Card style={styles.metricCard}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Period Diye
          </Text>
          <Text style={[styles.metricValue, { color: colors.negative }]}>
            {formatCurrency(periodGave)}
          </Text>
        </Card>

        <Card style={styles.metricCard}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Period Mile
          </Text>
          <Text style={[styles.metricValue, { color: colors.positive }]}>
            {formatCurrency(periodGot)}
          </Text>
        </Card>

        <Card style={styles.metricCard}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Entries
          </Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {filteredTx.length}
          </Text>
        </Card>
      </View>

      {/* Sharing & Download Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="Download / Share PDF"
          onPress={handleSharePdf}
          loading={isGeneratingPdf}
          size="medium"
          icon={<Ionicons name="document-text" size={18} color="#0B0F11" />}
          style={styles.primaryAction}
        />

        <Button
          title="Share via WhatsApp"
          variant="secondary"
          onPress={handleShareWhatsApp}
          size="medium"
          icon={<Ionicons name="logo-whatsapp" size={18} color="#25D366" />}
          style={styles.secondaryAction}
        />
      </View>

      {/* Transactions in Period */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 16 }]}>
        Ledger Entries ({filteredTx.length})
      </Text>

      {filteredTx.length > 0 ? (
        filteredTx.map((tx) => {
          const isGave = tx.transaction_type === 'you_gave';
          return (
            <Card key={tx.id} style={styles.txRowCard}>
              <View style={styles.txRowLeft}>
                <Text
                  style={[
                    styles.txRowType,
                    { color: isGave ? colors.negative : colors.positive },
                  ]}
                >
                  {isGave ? 'Maine Diye' : 'Mujhe Mile'}
                </Text>
                <Text style={[styles.txRowDate, { color: colors.textSecondary }]}>
                  {formatDate(tx.transaction_date)}
                </Text>
                {tx.note ? (
                  <Text style={[styles.txRowNote, { color: colors.textSecondary }]}>
                    {tx.note}
                  </Text>
                ) : null}
              </View>

              <Text
                style={[
                  styles.txRowAmount,
                  { color: isGave ? colors.negative : colors.positive },
                ]}
              >
                {isGave ? '+ ' : '- '}
                {formatCurrency(tx.amount, true)}
              </Text>
            </Card>
          );
        })
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No transactions found for the selected period.
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
  headerCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },
  reportTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  customerName: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  phoneText: {
    fontSize: 13,
    marginTop: 3,
  },
  divider: {
    height: 1,
    marginVertical: 12,
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
    fontSize: 18,
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  periodSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 12,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodBtnText: {
    fontSize: 13,
  },
  customCard: {
    padding: 12,
    marginBottom: 12,
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
    padding: 12,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  actionsContainer: {
    gap: 10,
    marginBottom: 12,
  },
  primaryAction: {
    width: '100%',
  },
  secondaryAction: {
    width: '100%',
  },
  txRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 12,
  },
  txRowLeft: {
    flex: 1,
  },
  txRowType: {
    fontSize: 13,
    fontWeight: '700',
  },
  txRowDate: {
    fontSize: 11,
    marginTop: 2,
  },
  txRowNote: {
    fontSize: 12,
    marginTop: 2,
  },
  txRowAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
});
