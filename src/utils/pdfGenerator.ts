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
 * Generate a PDF Statement for a customer and share it natively
 */
export const generateAndShareCustomerReportPdf = async (
  options: GenerateReportOptions
): Promise<void> => {
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

  const tableRowsHtml = transactions
    .map((tx, idx) => {
      const isGave = tx.transaction_type === 'you_gave';
      const typeLabel = isGave ? 'Maine Diye (Gave)' : 'Mujhe Mile (Got)';
      const typeColor = isGave ? '#EF4444' : '#22C55E';
      const formattedAmt = formatCurrency(tx.amount, true);

      return `
        <tr style="border-bottom: 1px solid #E2E8F0; background-color: ${
          idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
        };">
          <td style="padding: 10px 12px; font-size: 13px; color: #1E293B;">${formatDate(
            tx.transaction_date
          )}</td>
          <td style="padding: 10px 12px; font-size: 13px; font-weight: 600; color: ${typeColor};">${typeLabel}</td>
          <td style="padding: 10px 12px; font-size: 13px; color: #64748B;">${tx.note || '-'}</td>
          <td style="padding: 10px 12px; font-size: 13px; font-weight: 700; text-align: right; color: ${typeColor};">${formattedAmt}</td>
        </tr>
      `;
    })
    .join('');

  const statusLabel =
    currentOverallBalance.status === 'lena_hai'
      ? 'Lena Hai (Customer Owes You)'
      : currentOverallBalance.status === 'dena_hai'
      ? 'Dena Hai (You Owe Customer)'
      : 'Settled (Hisab Barabar)';

  const statusColor =
    currentOverallBalance.status === 'lena_hai'
      ? '#22C55E'
      : currentOverallBalance.status === 'dena_hai'
      ? '#EF4444'
      : '#64748B';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>HisabPro Statement - ${customer.name}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0B0F11;
            margin: 0;
            padding: 30px;
            background-color: #FFFFFF;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #FF7A00;
            padding-bottom: 18px;
            margin-bottom: 24px;
          }
          .brand-title {
            font-size: 26px;
            font-weight: 800;
            color: #FF7A00;
            letter-spacing: -0.5px;
          }
          .brand-tagline {
            font-size: 12px;
            color: #64748B;
            margin-top: 2px;
          }
          .report-info {
            text-align: right;
            font-size: 12px;
            color: #64748B;
          }
          .customer-box {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
          }
          .customer-name {
            font-size: 18px;
            font-weight: 700;
            color: #0F172A;
          }
          .customer-phone {
            font-size: 13px;
            color: #64748B;
            margin-top: 4px;
          }
          .summary-cards {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
          }
          .summary-card {
            flex: 1;
            padding: 14px;
            border-radius: 8px;
            background: #F1F5F9;
            border: 1px solid #E2E8F0;
          }
          .summary-card-title {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748B;
          }
          .summary-card-value {
            font-size: 18px;
            font-weight: 800;
            margin-top: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th {
            background-color: #0B0F11;
            color: #FFFFFF;
            font-size: 12px;
            font-weight: 600;
            text-align: left;
            padding: 10px 12px;
            text-transform: uppercase;
          }
          th.right {
            text-align: right;
          }
          .footer {
            margin-top: 36px;
            padding-top: 14px;
            border-top: 1px solid #E2E8F0;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #94A3B8;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand-title">HISABPRO</div>
            <div class="brand-tagline">Your Money, In Control.</div>
          </div>
          <div class="report-info">
            <div><strong>Period:</strong> ${periodLabel}</div>
            <div><strong>Generated:</strong> ${formatDate(new Date().toISOString())}</div>
          </div>
        </div>

        <div class="customer-box">
          <div>
            <div class="customer-name">${customer.name}</div>
            <div class="customer-phone">${customer.phone ? 'Phone: ' + customer.phone : 'No phone registered'}</div>
            ${customer.notes ? `<div style="font-size: 12px; color: #64748B; margin-top: 4px;">Notes: ${customer.notes}</div>` : ''}
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; color: #64748B; font-weight: 600;">CURRENT BALANCE</div>
            <div style="font-size: 22px; font-weight: 800; color: ${statusColor};">
              ${formatCurrency(currentOverallBalance.displayAmount, true)}
            </div>
            <div style="font-size: 12px; font-weight: 600; color: ${statusColor};">
              ${statusLabel}
            </div>
          </div>
        </div>

        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-card-title">Period Given (Maine Diye)</div>
            <div class="summary-card-value" style="color: #EF4444;">${formatCurrency(periodGiven, true)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-card-title">Period Got (Mujhe Mile)</div>
            <div class="summary-card-value" style="color: #22C55E;">${formatCurrency(periodGot, true)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-card-title">Transactions in Period</div>
            <div class="summary-card-value" style="color: #0F172A;">${transactions.length}</div>
          </div>
        </div>

        <h3 style="font-size: 14px; text-transform: uppercase; color: #475569; margin-bottom: 8px;">
          Transaction Ledger
        </h3>

        <table>
          <thead>
            <tr>
              <th style="width: 22%;">Date</th>
              <th style="width: 28%;">Type</th>
              <th style="width: 28%;">Note</th>
              <th class="right" style="width: 22%;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${
              transactions.length > 0
                ? tableRowsHtml
                : '<tr><td colspan="4" style="text-align: center; padding: 24px; color: #64748B;">No transactions recorded in this period.</td></tr>'
            }
          </tbody>
        </table>

        <div class="footer">
          <div>Generated by HisabPro Mobile Application</div>
          <div>Page 1 of 1</div>
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
 * Generate plain-text summary suitable for WhatsApp or copy-paste
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

  const statusText =
    currentOverallBalance.status === 'lena_hai'
      ? `Lena Hai: ${formatCurrency(currentOverallBalance.displayAmount)}`
      : currentOverallBalance.status === 'dena_hai'
      ? `Dena Hai: ${formatCurrency(currentOverallBalance.displayAmount)}`
      : `Settled (₹0)`;

  let text = `*HisabPro Account Summary*\n`;
  text += `👤 *Customer:* ${customer.name}\n`;
  if (customer.phone) text += `📞 *Phone:* ${customer.phone}\n`;
  text += `📅 *Period:* ${periodLabel}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🔴 *Period Maine Diye:* ${formatCurrency(periodGiven)}\n`;
  text += `🟢 *Period Mujhe Mile:* ${formatCurrency(periodGot)}\n`;
  text += `📊 *Total Transactions:* ${transactions.length}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n`;
  text += `⚖️ *Current Balance:* *${statusText}*\n\n`;

  if (transactions.length > 0) {
    text += `*Recent Entries:*\n`;
    const recent = transactions.slice(0, 5);
    for (const tx of recent) {
      const type = tx.transaction_type === 'you_gave' ? '🔴 Diye' : '🟢 Mile';
      text += `• ${formatDate(tx.transaction_date)}: ${type} ${formatCurrency(tx.amount)}${
        tx.note ? ` (${tx.note})` : ''
      }\n`;
    }
    if (transactions.length > 5) {
      text += `...and ${transactions.length - 5} more transactions.\n`;
    }
  }

  text += `\n_Generated via HisabPro - Your Money, In Control._`;
  return text;
};
