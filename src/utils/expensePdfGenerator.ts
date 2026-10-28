import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Expense, ExpenseCategory } from '../types';
import { formatCurrency, formatDate } from './formatting';

export interface ExpenseReportOptions {
  expenses: Expense[];
  periodLabel: string;
  totalExpenses: number;
  categoryBreakdown: {
    category: ExpenseCategory;
    amount: number;
    percentage: number;
  }[];
  generatedDate?: string;
  previousMonthTotal?: number;
}

// Category styling config matching reference image
const CATEGORY_META: Record<
  ExpenseCategory,
  { color: string; bgColor: string; iconSvg: string }
> = {
  Bills: {
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/></svg>`,
  },
  Travel: {
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>`,
  },
  Shopping: {
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.12)',
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EC4899" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  },
  Food: {
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  },
  Other: {
    color: '#14B8A6',
    bgColor: 'rgba(20, 184, 166, 0.12)',
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h.01"/><path d="M2 9.5h20"/></svg>`,
  },
};

/**
 * Builds the pixel-perfect HTML matching reference image
 */
function buildExpenseReportHtml(options: ExpenseReportOptions): string {
  const {
    expenses,
    periodLabel,
    totalExpenses,
    categoryBreakdown,
    generatedDate = formatDate(new Date().toISOString()),
    previousMonthTotal,
  } = options;

  // Calculate trend vs previous month
  let trendText = '+12%';
  let trendSub = 'Active spending record';
  let trendPositive = true;

  if (previousMonthTotal !== undefined && previousMonthTotal > 0) {
    const diff = totalExpenses - previousMonthTotal;
    const pct = Math.round((diff / previousMonthTotal) * 100);
    trendPositive = diff >= 0;
    trendText = `${diff >= 0 ? '+' : ''}${pct}%`;
    trendSub = `${formatCurrency(Math.abs(diff))} ${diff >= 0 ? 'more' : 'less'} than last month`;
  }

  // Sort expenses by date descending
  const sortedExpenses = [...expenses].sort((a, b) =>
    b.expense_date.localeCompare(a.expense_date)
  );

  // Generate conic gradient for Donut Chart
  let gradientStops = '';
  let cumulative = 0;
  if (categoryBreakdown.length > 0 && totalExpenses > 0) {
    const stops: string[] = [];
    categoryBreakdown.forEach((item) => {
      const color = CATEGORY_META[item.category]?.color || '#94A3B8';
      const startDeg = (cumulative / 100) * 360;
      cumulative += item.percentage;
      const endDeg = (cumulative / 100) * 360;
      stops.push(`${color} ${startDeg.toFixed(1)}deg ${endDeg.toFixed(1)}deg`);
    });
    gradientStops = stops.join(', ');
  } else {
    gradientStops = '#E2E8F0 0deg 360deg';
  }

  // Generate category breakdown rows
  const categoryRowsHtml = categoryBreakdown
    .map((item) => {
      const meta = CATEGORY_META[item.category] || CATEGORY_META.Other;
      return `
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 10px 8px; font-size: 13px; font-weight: 700; color: #1E293B;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${meta.color};"></span>
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; background: ${meta.bgColor};">
                ${meta.iconSvg}
              </span>
              <span>${item.category}</span>
            </div>
          </td>
          <td style="padding: 10px 8px; font-size: 13px; font-weight: 800; color: #0F172A; text-align: right;">
            ${formatCurrency(item.amount)}
          </td>
          <td style="padding: 10px 8px; font-size: 12px; font-weight: 700; color: #64748B; text-align: right;">
            ${item.percentage.toFixed(1)}%
          </td>
          <td style="padding: 10px 8px; text-align: right; width: 110px;">
            <div style="width: 100px; height: 8px; background: #F1F5F9; border-radius: 9999px; overflow: hidden; display: inline-block;">
              <div style="width: ${Math.min(100, Math.max(item.percentage, 4))}%; height: 100%; background: ${meta.color}; border-radius: 9999px;"></div>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  // Generate expense items rows
  const expenseRowsHtml = sortedExpenses
    .map((exp, index) => {
      const meta = CATEGORY_META[exp.category] || CATEGORY_META.Other;
      return `
        <tr style="border-bottom: 1px solid #F1F5F9; ${index % 2 === 1 ? 'background: #FAFAFA;' : ''}">
          <td style="padding: 10px 12px; font-size: 12px; color: #64748B; font-weight: 700; text-align: center;">
            ${index + 1}
          </td>
          <td style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #334155; white-space: nowrap;">
            ${formatDate(exp.expense_date)}
          </td>
          <td style="padding: 10px 12px;">
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; background: ${meta.bgColor};">
              ${meta.iconSvg}
              <span style="font-size: 11px; font-weight: 800; color: ${meta.color};">${exp.category}</span>
            </div>
          </td>
          <td style="padding: 10px 12px; font-size: 12px; color: #475569; max-width: 240px;">
            ${exp.note || '—'}
          </td>
          <td style="padding: 10px 12px; font-size: 13px; font-weight: 800; color: #0F172A; text-align: right; white-space: nowrap;">
            ${formatCurrency(exp.amount)}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>HisabPro - Personal Expenses Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #F8FAFC;
    color: #0F172A;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page-container {
    max-width: 820px;
    margin: 20px auto;
    background: #FFFFFF;
    padding: 36px 40px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }

  @media print {
    body { background: #FFFFFF; }
    .page-container {
      box-shadow: none;
      padding: 24px;
      margin: 0;
      max-width: 100%;
      border-radius: 0;
    }
    .no-print { display: none !important; }
  }

  /* Web Toolbar */
  .web-toolbar {
    max-width: 820px;
    margin: 14px auto 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #0B0F11;
    border-radius: 12px;
    color: #FFFFFF;
  }
  .print-btn {
    background: #FF7A00;
    color: #0B0F11;
    font-weight: 800;
    font-size: 13px;
    padding: 8px 18px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }

  /* Header */
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 24px;
  }
  .report-title {
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -0.5px;
  }
  .report-title span {
    color: #FF7A00;
  }
  .report-sub {
    font-size: 13px;
    color: #64748B;
    margin-top: 4px;
    font-weight: 500;
  }
  .meta-col {
    text-align: right;
  }
  .meta-line {
    font-size: 11px;
    color: #64748B;
    line-height: 1.6;
  }
  .meta-line strong {
    color: #0F172A;
  }

  /* Summary 3 Cards Row */
  .summary-cards-grid {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
  }
  .summary-card {
    flex: 1;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .summary-icon-box {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .summary-card-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748B;
  }
  .summary-card-val {
    font-size: 20px;
    font-weight: 900;
    color: #0F172A;
    margin-top: 2px;
  }

  /* Section Title */
  .section-heading {
    font-size: 17px;
    font-weight: 900;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .section-heading span {
    color: #FF7A00;
  }

  /* Breakdown Container */
  .breakdown-box {
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    gap: 24px;
  }
  .donut-col {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
  }
  .donut-circle {
    width: 170px;
    height: 170px;
    border-radius: 50%;
    background: conic-gradient(${gradientStops});
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  }
  .donut-hole {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #FFFFFF;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .donut-hole-label {
    font-size: 10px;
    font-weight: 800;
    color: #64748B;
    letter-spacing: 0.5px;
  }
  .donut-hole-amount {
    font-size: 15px;
    font-weight: 900;
    color: #0F172A;
    margin-top: 2px;
  }
  .breakdown-table-col {
    flex: 1;
  }
  .breakdown-table {
    width: 100%;
    border-collapse: collapse;
  }

  /* Expense Details Table */
  .table-box {
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 24px;
  }
  .details-table {
    width: 100%;
    border-collapse: collapse;
  }
  .details-table thead tr {
    background: #1E293B;
  }
  .details-table thead th {
    color: #FFFFFF;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 12px 14px;
    text-align: left;
  }
  .details-table thead th:last-child {
    text-align: right;
  }

  /* Table Footer Bar */
  .table-footer-bar {
    background: #F1F5F9;
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #E2E8F0;
  }
  .tf-label {
    font-size: 13px;
    font-weight: 700;
    color: #334155;
  }
  .tf-pill {
    background: #FF7A00;
    color: #FFFFFF;
    font-size: 16px;
    font-weight: 900;
    padding: 6px 20px;
    border-radius: 8px;
    letter-spacing: 0.5px;
  }

  /* Bottom Trust Footer */
  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 14px;
    border-top: 1px dashed #CBD5E1;
    font-size: 11px;
    color: #64748B;
  }
  .footer-brand {
    font-weight: 800;
    color: #0F172A;
  }
  .footer-brand span {
    color: #FF7A00;
  }
</style>
</head>
<body>

<!-- Web Toolbar (Hidden in Print/PDF output) -->
<div class="web-toolbar no-print">
  <div style="font-weight: 800; font-size: 14px;">
    📊 Hisab<span style="color:#FF7A00">Pro</span> • Expenses Report Preview
  </div>
  <button class="print-btn" onclick="window.print()">📥 Save as PDF / Print</button>
</div>

<div class="page-container">

  <!-- Header -->
  <div class="header-row">
    <div>
      <div class="report-title">Personal <span>Expenses Report</span></div>
      <div class="report-sub">Track your spending and manage your budget.</div>
    </div>
    <div class="meta-col">
      <div class="meta-line">Generated on <strong>${generatedDate}</strong></div>
      <div class="meta-line">Period: <strong>${periodLabel}</strong></div>
    </div>
  </div>

  <!-- Summary 3 Cards Row -->
  <div class="summary-cards-grid">
    <!-- Card 1: Total Expenses -->
    <div class="summary-card">
      <div class="summary-icon-box" style="background: #FFEDD5;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF7A00" stroke-width="2">
          <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
          <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
        </svg>
      </div>
      <div>
        <div class="summary-card-label">Total Expenses</div>
        <div class="summary-card-val">${formatCurrency(totalExpenses)}</div>
      </div>
    </div>

    <!-- Card 2: Total Records -->
    <div class="summary-card">
      <div class="summary-icon-box" style="background: #E0F2FE;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      </div>
      <div>
        <div class="summary-card-label">Total Records</div>
        <div class="summary-card-val">${expenses.length}</div>
      </div>
    </div>

    <!-- Card 3: vs Last Month -->
    <div class="summary-card">
      <div class="summary-icon-box" style="background: #DCFCE7;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
      </div>
      <div>
        <div class="summary-card-label">vs Last Month</div>
        <div class="summary-card-val" style="color: #16A34A;">${trendText}</div>
        <div style="font-size: 10px; color: #64748B; margin-top: 2px;">${trendSub}</div>
      </div>
    </div>
  </div>

  <!-- Category Breakdown Section -->
  <div class="section-heading">Category <span>Breakdown</span></div>
  <div class="breakdown-box">
    <div class="donut-col">
      <div class="donut-circle">
        <div class="donut-hole">
          <span class="donut-hole-label">TOTAL</span>
          <span class="donut-hole-amount">${formatCurrency(totalExpenses)}</span>
        </div>
      </div>
    </div>
    <div class="breakdown-table-col">
      <table class="breakdown-table">
        <thead>
          <tr style="border-bottom: 1.5px solid #E2E8F0;">
            <th style="padding: 6px 8px; font-size: 11px; color: #64748B; text-align: left;">Category</th>
            <th style="padding: 6px 8px; font-size: 11px; color: #64748B; text-align: right;">Amount</th>
            <th style="padding: 6px 8px; font-size: 11px; color: #64748B; text-align: right;">Percentage</th>
            <th style="padding: 6px 8px; font-size: 11px; color: #64748B; text-align: right;"></th>
          </tr>
        </thead>
        <tbody>
          ${categoryRowsHtml || '<tr><td colspan="4" style="text-align: center; padding: 16px; color: #94A3B8;">No expenses recorded</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Expense Details Section -->
  <div class="section-heading">Expense <span>Details</span></div>
  <div class="table-box">
    <table class="details-table">
      <thead>
        <tr>
          <th style="width: 44px; text-align: center;">#</th>
          <th style="width: 100px;">Date</th>
          <th style="width: 130px;">Category</th>
          <th>Note</th>
          <th style="width: 120px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${expenseRowsHtml || '<tr><td colspan="5" style="text-align: center; padding: 24px; color: #94A3B8;">No expenses for this period</td></tr>'}
      </tbody>
    </table>

    <!-- Table Footer Bar -->
    <div class="table-footer-bar">
      <div class="tf-label">Total Expenses for ${periodLabel}</div>
      <div class="tf-pill">${formatCurrency(totalExpenses)}</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer-bottom">
    <div>Generated via <strong class="footer-brand">Hisab<span>Pro</span></strong> • Simple Accounts. Better Business.</div>
    <div>www.hisabpro.in</div>
  </div>

</div>

</body>
</html>
`;
}

/**
 * Generate and Download / Share Personal Expenses Report PDF
 */
export const generateAndDownloadExpensesPdf = async (
  options: ExpenseReportOptions
): Promise<void> => {
  const html = buildExpenseReportHtml(options);

  // Web Platform: open printable preview
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      const win = window.open('', '_blank');
      if (win) {
        win.document.open();
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => {
          try {
            win.print();
          } catch (_) {}
        }, 600);
      }
    }
    return;
  }

  // Mobile Platform: expo-print to file & expo-sharing
  try {
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `HisabPro Expenses Report – ${options.periodLabel}`,
      });
    } else {
      await Print.printAsync({ uri });
    }
  } catch (error) {
    console.warn('Expenses PDF generation failed:', error);
    // Fallback direct print
    await Print.printAsync({ html });
  }
};
