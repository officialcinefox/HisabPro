import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Customer, Transaction } from '../types';
import { calculateCustomerBalance } from './calculations';
import { formatCurrency, formatDate } from './formatting';

interface GenerateReportOptions {
  customer: Customer;
  transactions: Transaction[];
  startDateStr?: string;
  endDateStr?: string;
  periodLabel: string;
}

/**
 * Converts a numeric amount to Indian currency words
 * e.g. 42000 -> Rupees Forty Two Thousand Only
 */
export function numberToWordsIndian(amount: number): string {
  const rounded = Math.round(Math.abs(amount));
  if (rounded === 0) return 'Rupees Zero Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return ones[n];
    const t = Math.floor(n / 10);
    const r = n % 10;
    return tens[t] + (r > 0 ? ' ' + ones[r] : '');
  }

  function convertThreeDigits(n: number): string {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (h > 0) res += ones[h] + ' Hundred';
    if (rest > 0) {
      if (res) res += ' and ';
      res += convertTwoDigits(rest);
    }
    return res;
  }

  const crores = Math.floor(rounded / 10000000);
  let rem = rounded % 10000000;
  const lakhs = Math.floor(rem / 100000);
  rem %= 100000;
  const thousands = Math.floor(rem / 1000);
  rem %= 1000;
  const hundreds = rem;

  const parts: string[] = [];
  if (crores > 0) parts.push(convertThreeDigits(crores) + ' Crore');
  if (lakhs > 0) parts.push(convertThreeDigits(lakhs) + ' Lakh');
  if (thousands > 0) parts.push(convertThreeDigits(thousands) + ' Thousand');
  if (hundreds > 0) parts.push(convertThreeDigits(hundreds));

  return 'Rupees ' + parts.join(' ') + ' Only';
}

/**
 * High-fidelity SVG QR code for verification on PDF
 */
const QR_CODE_SVG = `
<svg width="78" height="78" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="8" fill="#F8FAFC"/>
  <!-- Corner 1 -->
  <rect x="10" y="10" width="26" height="26" rx="4" fill="#0B0F11"/>
  <rect x="14" y="14" width="18" height="18" rx="2" fill="#FFFFFF"/>
  <rect x="18" y="18" width="10" height="10" rx="1" fill="#FF7A00"/>
  <!-- Corner 2 -->
  <rect x="64" y="10" width="26" height="26" rx="4" fill="#0B0F11"/>
  <rect x="68" y="14" width="18" height="18" rx="2" fill="#FFFFFF"/>
  <rect x="72" y="18" width="10" height="10" rx="1" fill="#FF7A00"/>
  <!-- Corner 3 -->
  <rect x="10" y="64" width="26" height="26" rx="4" fill="#0B0F11"/>
  <rect x="14" y="68" width="18" height="18" rx="2" fill="#FFFFFF"/>
  <rect x="18" y="72" width="10" height="10" rx="1" fill="#FF7A00"/>
  <!-- Matrix Dots -->
  <rect x="42" y="12" width="6" height="6" fill="#0B0F11"/>
  <rect x="52" y="12" width="6" height="6" fill="#0B0F11"/>
  <rect x="42" y="24" width="6" height="6" fill="#0B0F11"/>
  <rect x="12" y="42" width="6" height="6" fill="#0B0F11"/>
  <rect x="24" y="42" width="6" height="6" fill="#0B0F11"/>
  <rect x="36" y="36" width="8" height="8" rx="2" fill="#FF7A00"/>
  <rect x="48" y="36" width="8" height="8" rx="2" fill="#0B0F11"/>
  <rect x="60" y="42" width="6" height="6" fill="#0B0F11"/>
  <rect x="72" y="42" width="6" height="6" fill="#0B0F11"/>
  <rect x="82" y="42" width="6" height="6" fill="#0B0F11"/>
  <rect x="36" y="48" width="8" height="8" rx="2" fill="#0B0F11"/>
  <rect x="48" y="48" width="8" height="8" rx="2" fill="#FF7A00"/>
  <rect x="60" y="54" width="6" height="6" fill="#0B0F11"/>
  <rect x="42" y="66" width="6" height="6" fill="#0B0F11"/>
  <rect x="52" y="66" width="6" height="6" fill="#0B0F11"/>
  <rect x="64" y="66" width="6" height="6" fill="#0B0F11"/>
  <rect x="76" y="66" width="6" height="6" fill="#0B0F11"/>
  <rect x="84" y="76" width="6" height="6" fill="#0B0F11"/>
  <rect x="42" y="82" width="6" height="6" fill="#0B0F11"/>
  <rect x="54" y="82" width="6" height="6" fill="#0B0F11"/>
  <rect x="68" y="82" width="6" height="6" fill="#0B0F11"/>
</svg>
`;

/**
 * Generate a PDF Statement matching the reference layout in Image 3
 */
export const generateAndShareCustomerReportPdf = async (
  options: GenerateReportOptions
): Promise<void> => {
  const { customer, transactions, periodLabel } = options;
  const currentOverallBalance = calculateCustomerBalance(transactions);

  // Sort chronological for ledger table
  const sortedTx = [...transactions].sort((a, b) =>
    a.transaction_date.localeCompare(b.transaction_date)
  );

  let periodGiven = 0;
  let periodGot = 0;
  let runningBal = 0;

  const rowsWithBalance = sortedTx.map((tx, idx) => {
    const amt = Number(tx.amount) || 0;
    const isGave = tx.transaction_type === 'you_gave';
    if (isGave) {
      periodGiven += amt;
      runningBal += amt;
    } else {
      periodGot += amt;
      runningBal -= amt;
    }

    const typeColor = isGave ? '#DC2626' : '#16A34A';
    const typeBg = isGave ? '#FEE2E2' : '#DCFCE7';
    const typeLabel = isGave ? '↑ Given' : '↓ Received';
    const formattedAmt = (isGave ? '+ ' : '- ') + formatCurrency(amt, true);
    const balanceStr =
      runningBal > 0
        ? `${formatCurrency(runningBal, true)} Dr`
        : runningBal < 0
        ? `${formatCurrency(Math.abs(runningBal), true)} Cr`
        : '₹0.00';

    return `
      <tr style="border-bottom: 1px solid #E2E8F0; background-color: ${
        idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
      };">
        <td style="padding: 11px 12px; font-size: 12px; font-weight: 600; color: #64748B;">${idx + 1}</td>
        <td style="padding: 11px 12px; font-size: 13px; color: #1E293B; font-weight: 500;">${formatDate(
          tx.transaction_date
        )}</td>
        <td style="padding: 11px 12px; font-size: 13px; color: #334155;">${tx.note || 'Ledger entry'}</td>
        <td style="padding: 11px 12px; text-align: center;">
          <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; background-color: ${typeBg}; color: ${typeColor}; font-size: 11px; font-weight: 700; letter-spacing: 0.3px;">
            ${typeLabel}
          </span>
        </td>
        <td style="padding: 11px 12px; font-size: 13px; font-weight: 800; text-align: right; color: ${typeColor};">
          ${formattedAmt}
        </td>
        <td style="padding: 11px 12px; font-size: 13px; font-weight: 700; text-align: right; color: #0F172A;">
          ${balanceStr}
        </td>
      </tr>
    `;
  });

  const isLenaHai = currentOverallBalance.status === 'lena_hai';
  const isDenaHai = currentOverallBalance.status === 'dena_hai';
  const statusColor = isLenaHai ? '#16A34A' : isDenaHai ? '#DC2626' : '#64748B';
  const bannerBg = '#FFF7ED';
  const bannerBorder = '#FED7AA';
  const bannerAccent = '#EA580C';

  const balanceHeading = isLenaHai
    ? 'Amount to be received from ' + customer.name
    : isDenaHai
    ? 'Amount to be paid to ' + customer.name
    : 'Account is completely settled';

  const balanceWords = numberToWordsIndian(currentOverallBalance.displayAmount);
  const initialLetter = (customer.name || 'C').charAt(0).toUpperCase();
  const currentDateStr = formatDate(new Date().toISOString());

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>HisabPro Statement - ${customer.name}</title>
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0F172A;
            margin: 0;
            padding: 32px 36px;
            background-color: #FFFFFF;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 20px;
            border-bottom: 2px solid #F1F5F9;
            margin-bottom: 20px;
          }
          .brand-logo {
            font-size: 26px;
            font-weight: 900;
            color: #0B0F11;
            letter-spacing: -0.5px;
          }
          .brand-orange {
            color: #FF7A00;
          }
          .brand-tagline {
            font-size: 11px;
            font-weight: 700;
            color: #64748B;
            letter-spacing: 0.8px;
            margin-top: 4px;
            text-transform: uppercase;
          }
          .header-right {
            text-align: right;
          }
          .statement-title {
            font-size: 22px;
            font-weight: 800;
            color: #0F172A;
          }
          .statement-sub {
            font-size: 12px;
            color: #64748B;
            margin-top: 2px;
          }
          .customer-details-card {
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 14px;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 18px;
          }
          .customer-left {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .avatar-circle {
            width: 44px;
            height: 44px;
            border-radius: 22px;
            background-color: #242220;
            color: #FF7A00;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 800;
          }
          .customer-name {
            font-size: 18px;
            font-weight: 800;
            color: #0F172A;
          }
          .customer-phone {
            font-size: 13px;
            color: #64748B;
            margin-top: 2px;
            font-weight: 600;
          }
          .meta-right {
            text-align: right;
            font-size: 12px;
            color: #475569;
            line-height: 1.6;
          }
          .meta-row {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 6px;
          }
          .summary-grid {
            display: flex;
            gap: 12px;
            margin-bottom: 18px;
          }
          .summary-card {
            flex: 1;
            padding: 14px 16px;
            border-radius: 12px;
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
          }
          .summary-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #64748B;
          }
          .summary-val {
            font-size: 20px;
            font-weight: 900;
            margin-top: 4px;
          }
          .outstanding-banner {
            background-color: ${bannerBg};
            border: 1.5px solid ${bannerBorder};
            border-radius: 14px;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }
          .outstanding-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .wallet-icon-box {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background-color: rgba(255, 122, 0, 0.18);
            color: #EA580C;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
          }
          .outstanding-title {
            font-size: 15px;
            font-weight: 800;
            color: #9A3412;
          }
          .outstanding-desc {
            font-size: 12px;
            color: #C2410C;
            margin-top: 2px;
          }
          .outstanding-amount {
            font-size: 26px;
            font-weight: 900;
            color: ${bannerAccent};
          }
          .table-title {
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #475569;
            margin-bottom: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #E2E8F0;
            margin-bottom: 22px;
          }
          th {
            background-color: #0B0F11;
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 12px;
            text-align: left;
          }
          th.right {
            text-align: right;
          }
          th.center {
            text-align: center;
          }
          .amount-words-card {
            background-color: #FFF7ED;
            border: 1px solid #FED7AA;
            border-radius: 12px;
            padding: 14px 18px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .words-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #9A3412;
          }
          .words-value {
            font-size: 13px;
            font-weight: 700;
            color: #C2410C;
            margin-top: 2px;
            font-style: italic;
          }
          .words-amount {
            font-size: 22px;
            font-weight: 900;
            color: #EA580C;
          }
          .footer-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 1px dashed #CBD5E1;
            margin-top: 16px;
          }
          .notes-box {
            flex: 1;
            font-size: 11px;
            color: #64748B;
            line-height: 1.7;
            padding-right: 20px;
          }
          .notes-title {
            font-weight: 700;
            color: #334155;
            margin-bottom: 2px;
            text-transform: uppercase;
          }
          .qr-box {
            text-align: center;
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 8px;
          }
          .qr-label {
            font-size: 9px;
            font-weight: 700;
            color: #64748B;
            margin-top: 4px;
            text-transform: uppercase;
          }
          .bottom-bar {
            background-color: #0B0F11;
            color: #FFFFFF;
            padding: 12px 18px;
            border-radius: 8px;
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
          }
          .bottom-left {
            font-weight: 700;
            letter-spacing: 0.3px;
          }
          .bottom-right {
            color: #94A3B8;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <div>
            <div class="brand-logo">HISAB<span class="brand-orange">PRO</span></div>
            <div class="brand-tagline">Simple Accounts. Better Business.</div>
          </div>
          <div class="header-right">
            <div class="statement-title">Account Statement</div>
            <div class="statement-sub">Your transactions at a glance</div>
          </div>
        </div>

        <!-- Customer & Statement Period Card -->
        <div class="customer-details-card">
          <div class="customer-left">
            <div class="avatar-circle">${initialLetter}</div>
            <div>
              <div class="customer-name">${customer.name}</div>
              <div class="customer-phone">${
                customer.phone ? '📞 ' + customer.phone : 'No phone registered'
              }</div>
            </div>
          </div>
          <div class="meta-right">
            <div class="meta-row"><strong>Period:</strong> ${periodLabel}</div>
            <div class="meta-row"><strong>Generated:</strong> ${currentDateStr}</div>
            <div class="meta-row"><strong>Status:</strong> ${
              isLenaHai ? 'To Receive' : isDenaHai ? 'To Pay' : 'Settled'
            }</div>
          </div>
        </div>

        <!-- 3 Summary Metric Cards -->
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">Total Given</div>
            <div class="summary-val" style="color: #DC2626;">${formatCurrency(periodGiven, true)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Received</div>
            <div class="summary-val" style="color: #16A34A;">${formatCurrency(periodGot, true)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Entries</div>
            <div class="summary-val" style="color: #0F172A;">${transactions.length}</div>
          </div>
        </div>

        <!-- Outstanding Balance Banner -->
        <div class="outstanding-banner">
          <div class="outstanding-left">
            <div class="wallet-icon-box">₹</div>
            <div>
              <div class="outstanding-title">Outstanding Balance</div>
              <div class="outstanding-desc">${balanceHeading}</div>
            </div>
          </div>
          <div class="outstanding-amount">
            ${formatCurrency(currentOverallBalance.displayAmount, true)}
          </div>
        </div>

        <!-- Transaction Details Table -->
        <div class="table-title">Transaction Details (${transactions.length})</div>
        <table>
          <thead>
            <tr>
              <th style="width: 6%;">#</th>
              <th style="width: 17%;">Date</th>
              <th style="width: 31%;">Description</th>
              <th class="center" style="width: 16%;">Type</th>
              <th class="right" style="width: 15%;">Amount</th>
              <th class="right" style="width: 15%;">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${
              rowsWithBalance.length > 0
                ? rowsWithBalance.join('')
                : '<tr><td colspan="6" style="text-align: center; padding: 26px; color: #64748B;">No transactions recorded in this period.</td></tr>'
            }
          </tbody>
        </table>

        <!-- Amount to be Received / Paid Words Box -->
        <div class="amount-words-card">
          <div>
            <div class="words-label">${
              isLenaHai
                ? 'Amount to be Received'
                : isDenaHai
                ? 'Amount to be Paid'
                : 'Settled Amount'
            }</div>
            <div class="words-value">(${balanceWords})</div>
          </div>
          <div class="words-amount">
            ${formatCurrency(currentOverallBalance.displayAmount, true)}
          </div>
        </div>

        <!-- Footer / Instructions & QR Code -->
        <div class="footer-section">
          <div class="notes-box">
            <div class="notes-title">Important Terms & Notes:</div>
            <div>• This is a computer-generated account statement and does not require a physical signature.</div>
            <div>• Please report any discrepancy within 7 business days of statement issuance.</div>
            <div>• Keep this statement for your financial records and tax bookkeeping.</div>
          </div>
          <div class="qr-box">
            ${QR_CODE_SVG}
            <div class="qr-label">Scan to get App</div>
          </div>
        </div>

        <!-- Dark Bottom Bar -->
        <div class="bottom-bar">
          <div class="bottom-left">HISAB<span style="color:#FF7A00">PRO</span> • SIMPLE ACCOUNTS. BETTER BUSINESS.</div>
          <div class="bottom-right">www.hisabpro.in</div>
        </div>
      </body>
    </html>
  `;

  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
      dialogTitle: `HisabPro Statement - ${customer.name}`,
    });
  }
};

/**
 * Generate formatted WhatsApp message matching statement details
 */
export const generatePlainTextReport = (options: GenerateReportOptions): string => {
  const { customer, transactions, periodLabel } = options;
  const currentOverallBalance = calculateCustomerBalance(transactions);

  let periodGiven = 0;
  let periodGot = 0;
  for (const tx of transactions) {
    const amt = Number(tx.amount) || 0;
    if (tx.transaction_type === 'you_gave') {
      periodGiven += amt;
    } else {
      periodGot += amt;
    }
  }

  const isLenaHai = currentOverallBalance.status === 'lena_hai';
  const isDenaHai = currentOverallBalance.status === 'dena_hai';
  const statusLabel = isLenaHai ? 'To Receive' : isDenaHai ? 'To Pay' : 'Settled';
  const balanceWords = numberToWordsIndian(currentOverallBalance.displayAmount);

  let text = `📊 *HISABPRO ACCOUNT STATEMENT*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n`;
  text += `👤 *Customer:* ${customer.name}\n`;
  if (customer.phone) text += `📞 *Phone:* ${customer.phone}\n`;
  text += `📅 *Period:* ${periodLabel}\n`;
  text += `⏰ *Generated On:* ${formatDate(new Date().toISOString())}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  text += `💰 *SUMMARY*\n`;
  text += `🔴 *Total Given:* ${formatCurrency(periodGiven, true)}\n`;
  text += `🟢 *Total Received:* ${formatCurrency(periodGot, true)}\n`;
  text += `📝 *Total Entries:* ${transactions.length}\n\n`;

  text += `━━━━━━━━━━━━━━━━━━━━\n`;
  text += `⚖️ *OUTSTANDING BALANCE*\n`;
  text += `👉 *${formatCurrency(currentOverallBalance.displayAmount, true)} (${statusLabel})*\n`;
  text += `_${balanceWords}_\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (transactions.length > 0) {
    text += `📋 *TRANSACTION DETAILS:*\n`;
    const recent = transactions.slice(0, 8);
    recent.forEach((tx, i) => {
      const isGave = tx.transaction_type === 'you_gave';
      const icon = isGave ? '🔴 Given' : '🟢 Received';
      text += `${i + 1}. ${formatDate(tx.transaction_date)} | ${icon} | ${formatCurrency(
        tx.amount,
        true
      )}${tx.note ? `\n   Note: ${tx.note}` : ''}\n`;
    });
    if (transactions.length > 8) {
      text += `...and ${transactions.length - 8} more entries.\n`;
    }
  }

  text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_Generated via HisabPro • Simple Accounts. Better Business._\n`;
  text += `_🌐 www.hisabpro.in_`;

  return text;
};
