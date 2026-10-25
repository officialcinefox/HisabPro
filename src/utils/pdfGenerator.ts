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

// ─── Number to Words (Indian format) ────────────────────────────────────────

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

  function two(n: number): string {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  }
  function three(n: number): string {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return (h ? ones[h] + ' Hundred' : '') + (rest ? (h ? ' and ' : '') + two(rest) : '');
  }

  const crores = Math.floor(rounded / 10000000);
  let rem = rounded % 10000000;
  const lakhs = Math.floor(rem / 100000);
  rem %= 100000;
  const thousands = Math.floor(rem / 1000);
  rem %= 1000;
  const hundreds = rem;

  const parts: string[] = [];
  if (crores > 0) parts.push(three(crores) + ' Crore');
  if (lakhs > 0) parts.push(three(lakhs) + ' Lakh');
  if (thousands > 0) parts.push(three(thousands) + ' Thousand');
  if (hundreds > 0) parts.push(three(hundreds));

  return 'Rupees ' + parts.join(' ') + ' Only';
}

// ─── Build Single-Page Compact A4 HTML Template ──────────────────────────────

function buildHtml(options: GenerateReportOptions): string {
  const { customer, transactions, periodLabel } = options;
  const balance = calculateCustomerBalance(transactions);

  const sortedTx = [...transactions].sort((a, b) =>
    a.transaction_date.localeCompare(b.transaction_date)
  );

  let periodGiven = 0;
  let periodGot = 0;
  let running = 0;

  const tableRows = sortedTx
    .map((tx, i) => {
      const amt = Number(tx.amount) || 0;
      const isGave = tx.transaction_type === 'you_gave';
      if (isGave) { periodGiven += amt; running += amt; }
      else { periodGot += amt; running -= amt; }

      const typeBadge = isGave
        ? `<span class="badge badge-given">&#8593; Given</span>`
        : `<span class="badge badge-received">&#8595; Received</span>`;
      const amtStr = (isGave ? '+ ' : '- ') + formatCurrency(amt, true);
      const amtColor = isGave ? '#DC2626' : '#16A34A';
      const balStr = running > 0
        ? formatCurrency(running, true)
        : running < 0
        ? `${formatCurrency(Math.abs(running), true)}`
        : '₹0.00';
      const desc = tx.note || (isGave ? 'Maine Diye' : 'Mujhe Mile');
      const rowBg = i % 2 === 0 ? '#FFFFFF' : '#F9FAFB';

      return `
        <tr style="background:${rowBg};">
          <td class="tc">${i + 1}</td>
          <td>${formatDate(tx.transaction_date)}</td>
          <td>${desc}</td>
          <td class="tc">${typeBadge}</td>
          <td class="tr" style="color:${amtColor};font-weight:800;">${amtStr}</td>
          <td class="tr" style="font-weight:700;">${balStr}</td>
        </tr>`;
    })
    .join('');

  const emptyRow = `<tr><td colspan="6" class="tc" style="padding:16px;color:#94A3B8;">No transactions recorded in this period.</td></tr>`;

  const isLena = balance.status === 'lena_hai';
  const isDena = balance.status === 'dena_hai';
  const balAmt = formatCurrency(balance.displayAmount, true);
  const balWords = numberToWordsIndian(balance.displayAmount);
  const initials = (customer.name || 'C').charAt(0).toUpperCase();
  const now = new Date();
  const generatedOn = formatDate(now.toISOString()) + ', ' +
    now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const outstandingDesc = isLena
    ? `Amount to be received from ${customer.name}`
    : isDena
    ? `Amount to be paid to ${customer.name}`
    : 'Account fully settled';
  const receiveTitle = isLena ? 'Amount to be Received' : isDena ? 'Amount to be Paid' : 'Balance';
  const receiveSub = isLena
    ? `${customer.name} needs to pay you the following amount`
    : isDena
    ? `You need to pay the following amount`
    : 'Account is settled at zero';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>HisabPro Statement – ${customer.name}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
html, body {
  background:#F1F5F9;
  color:#0F172A;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  margin:0;
  padding:16px;
}
@page {
  size: A4 portrait;
  margin: 6mm;
}
@media print{
  html, body {
    background:#FFFFFF!important;
    padding:0!important;
    margin:0!important;
  }
  .no-print{display:none!important;}
  .page{
    box-shadow:none!important;
    border-radius:0!important;
    margin:0 auto!important;
    max-width:100%!important;
    page-break-inside:avoid!important;
  }
}
.no-print{
  background:#0B0F11;
  padding:10px 16px;
  border-radius:8px;
  margin:0 auto 12px auto;
  max-width:760px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}
.no-print-title{color:#FFFFFF;font-size:13px;font-weight:700;}
.no-print-title span{color:#FF7A00;}
.btn-print{
  background:#FF7A00;
  color:#0B0F11;
  border:none;
  padding:8px 16px;
  border-radius:6px;
  font-weight:800;
  font-size:12px;
  cursor:pointer;
}
.page{
  background:#FFFFFF;
  max-width:760px;
  margin:0 auto;
  border-radius:12px;
  overflow:hidden;
  box-shadow:0 4px 20px rgba(0,0,0,0.08);
  page-break-inside:avoid;
}

/* ── Dark Header ── */
.hdr{
  background:#0B0F11;
  padding:16px 20px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}
.hdr-left{display:flex;align-items:center;gap:12px;}
.logo-box{
  width:38px;
  height:38px;
  background:#FF7A00;
  border-radius:10px;
  display:flex;
  align-items:center;
  justify-content:center;
}
.logo-box svg{width:24px;height:24px;}
.brand-name{font-size:20px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;}
.brand-name span{color:#FF7A00;}
.brand-tag{font-size:9px;color:#94A3B8;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;margin-top:2px;}
.hdr-right{text-align:right;}
.hdr-title{font-size:20px;font-weight:900;color:#FFFFFF;}
.hdr-title span{color:#FF7A00;}
.hdr-sub{font-size:11px;color:#94A3B8;margin-top:2px;}

/* ── Body Padding ── */
.body-pad{padding:14px 20px;}

/* ── Customer Card ── */
.customer-card{
  background:#FFFFFF;
  border:1px solid #E2E8F0;
  border-radius:12px;
  padding:12px 16px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:12px;
}
.cust-left{display:flex;align-items:center;gap:12px;}
.avatar{
  width:46px;
  height:46px;
  border-radius:50%;
  background:#FF7A00;
  color:#FFFFFF;
  font-size:20px;
  font-weight:900;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
}
.cust-label{font-size:10px;color:#94A3B8;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;}
.cust-name{font-size:20px;font-weight:900;color:#0F172A;line-height:1.2;}
.cust-phone{font-size:12px;color:#64748B;margin-top:2px;display:flex;align-items:center;gap:4px;font-weight:600;}
.cust-right{
  display:flex;
  flex-direction:column;
  gap:8px;
}
.meta-item{
  display:flex;
  align-items:flex-start;
  gap:8px;
}
.meta-icon{
  width:16px;
  height:16px;
  flex-shrink:0;
  margin-top:2px;
}
.meta-content{
  text-align:left;
}
.meta-label{
  font-size:10px;
  color:#64748B;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:0.4px;
  line-height:1;
}
.meta-val{
  font-size:12px;
  color:#0F172A;
  font-weight:800;
  margin-top:2px;
  line-height:1.2;
}

/* ── Summary Cards ── */
.summary-grid{display:flex;gap:10px;margin-bottom:12px;}
.s-card{flex:1;border-radius:10px;padding:10px 14px;}
.s-card.given{background:#FEF2F2;border:1px solid #FECACA;}
.s-card.received{background:#F0FDF4;border:1px solid #BBF7D0;}
.s-card.entries{background:#F8FAFC;border:1px solid #E2E8F0;}
.s-icon{
  width:26px;
  height:26px;
  border-radius:6px;
  display:flex;
  align-items:center;
  justify-content:center;
  margin-bottom:6px;
  font-size:13px;
}
.s-icon.red{background:#EF4444;color:#FFF;font-weight:900;}
.s-icon.green{background:#22C55E;color:#FFF;font-weight:900;}
.s-icon.gray{background:#E2E8F0;font-size:12px;}
.s-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748B;}
.s-amount{font-size:18px;font-weight:900;margin-top:2px;}
.s-sub{font-size:10px;color:#94A3B8;margin-top:1px;}

/* ── Outstanding Banner ── */
.outstanding{
  background:#FFF7ED;
  border:1.5px solid #FED7AA;
  border-radius:12px;
  padding:12px 16px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:12px;
}
.out-left{display:flex;align-items:center;gap:12px;}
.out-icon{
  width:36px;
  height:36px;
  background:#FF7A00;
  border-radius:10px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:18px;
  color:#FFF;
  flex-shrink:0;
}
.out-title{font-size:14px;font-weight:900;color:#7C2D12;}
.out-sub{font-size:11px;color:#C2410C;margin-top:2px;}
.out-amount{font-size:24px;font-weight:900;color:#FF7A00;}

/* ── Transaction Table ── */
.table-title{font-size:13px;font-weight:900;color:#0F172A;margin-bottom:6px;}
.table-title span{color:#FF7A00;}
table{
  width:100%;
  border-collapse:collapse;
  border:1px solid #E2E8F0;
  border-radius:10px;
  overflow:hidden;
  margin-bottom:12px;
}
thead tr{background:#0B0F11;}
th{
  color:#FFFFFF;
  font-size:10px;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:0.5px;
  padding:9px 12px;
  text-align:left;
}
td{
  padding:8px 12px;
  font-size:12px;
  color:#334155;
  border-bottom:1px solid #F1F5F9;
}
tr:last-child td{border-bottom:none;}
.tc{text-align:center;}
.tr{text-align:right;}
.badge{
  display:inline-block;
  padding:3px 8px;
  border-radius:9999px;
  font-size:10px;
  font-weight:700;
  letter-spacing:0.3px;
}
.badge-given{background:#FEE2E2;color:#DC2626;}
.badge-received{background:#DCFCE7;color:#16A34A;}

/* ── Receive Banner ── */
.receive-card{
  background:#FFF7ED;
  border:1.5px solid #FED7AA;
  border-radius:12px;
  padding:12px 16px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:12px;
}
.rec-left{display:flex;align-items:center;gap:12px;}
.rec-icon{
  width:36px;
  height:36px;
  background:#FF7A00;
  border-radius:10px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:18px;
  color:#FFF;
  flex-shrink:0;
}
.rec-title{font-size:14px;font-weight:900;color:#7C2D12;}
.rec-sub{font-size:11px;color:#C2410C;margin-top:2px;}
.rec-right{text-align:right;}
.rec-amount{font-size:24px;font-weight:900;color:#FF7A00;}
.rec-words{font-size:11px;color:#C2410C;font-style:italic;margin-top:2px;}

/* ── Footer ── */
.footer-row{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:16px;
  padding-top:10px;
  border-top:1px dashed #CBD5E1;
}
.note-box{flex:1;}
.note-title{
  font-size:10px;
  font-weight:800;
  color:#475569;
  text-transform:uppercase;
  letter-spacing:0.5px;
  margin-bottom:4px;
}
.note-item{font-size:10px;color:#64748B;line-height:1.6;}
.qr-col{text-align:center;}
.qr-wrap{
  width:64px;
  height:64px;
  border:1.5px solid #E2E8F0;
  border-radius:8px;
  padding:4px;
  background:#FFFFFF;
  display:flex;
  align-items:center;
  justify-content:center;
  margin:0 auto;
}
.qr-label{font-size:9px;font-weight:700;color:#0F172A;margin-top:3px;}
.qr-sub{font-size:8px;color:#64748B;line-height:1.3;max-width:80px;margin:1px auto 0 auto;}
.qr-app{color:#FF7A00;font-weight:800;}

/* ── Dark Bottom Bar ── */
.bottom-bar{
  background:#0B0F11;
  padding:10px 20px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}
.bb-left{display:flex;align-items:center;gap:10px;}
.bb-logo-box{
  width:26px;
  height:26px;
  background:#FF7A00;
  border-radius:6px;
  display:flex;
  align-items:center;
  justify-content:center;
}
.bb-brand{font-size:13px;font-weight:900;color:#FFFFFF;}
.bb-brand span{color:#FF7A00;}
.bb-tag{font-size:9px;color:#64748B;letter-spacing:0.5px;text-transform:uppercase;}
.bb-right{
  border:1px solid #334155;
  padding:4px 10px;
  border-radius:9999px;
  display:flex;
  align-items:center;
  gap:4px;
}
.bb-url{font-size:11px;color:#94A3B8;font-weight:600;}
</style>
</head>
<body>

<!-- Web toolbar (hidden on print) -->
<div class="no-print">
  <div class="no-print-title">&#128196; <span>HISAB</span>PRO &nbsp;Statement Preview</div>
  <button class="btn-print" onclick="window.print()">&#128424; Save as PDF / Print</button>
</div>

<div class="page">

  <!-- Dark Header -->
  <div class="hdr">
    <div class="hdr-left">
      <div class="logo-box">
        <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4L14 4L14 14L4 14Z" fill="white" fill-opacity="0.3"/>
          <path d="M14 14L24 4L24 24L14 24Z" fill="white"/>
          <path d="M4 14L14 24L4 24Z" fill="white" fill-opacity="0.6"/>
        </svg>
      </div>
      <div>
        <div class="brand-name">Hisab<span>Pro</span></div>
        <div class="brand-tag">Simple Accounts. Better Business.</div>
      </div>
    </div>
    <div class="hdr-right">
      <div class="hdr-title">Account <span>Statement</span></div>
      <div class="hdr-sub">Your transactions at a glance</div>
    </div>
  </div>

  <div class="body-pad">

    <!-- Customer Card -->
    <div class="customer-card">
      <div class="cust-left">
        <div class="avatar">${initials}</div>
        <div>
          <div class="cust-label">Customer</div>
          <div class="cust-name">${customer.name}</div>
          ${customer.phone ? `<div class="cust-phone"><span>&#128222;</span> ${customer.phone}</div>` : ''}
        </div>
      </div>
      <div class="cust-right">
        <div class="meta-item">
          <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <div class="meta-content">
            <div class="meta-label">Statement Period</div>
            <div class="meta-val">${periodLabel}</div>
          </div>
        </div>
        <div class="meta-item">
          <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <div class="meta-content">
            <div class="meta-label">Generated On</div>
            <div class="meta-val">${generatedOn}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3 Summary Cards -->
    <div class="summary-grid">
      <div class="s-card given">
        <div class="s-icon red">&#8593;</div>
        <div class="s-label">Total Given</div>
        <div class="s-amount" style="color:#DC2626;">${formatCurrency(periodGiven, true)}</div>
        <div class="s-sub">Total amount you gave</div>
      </div>
      <div class="s-card received">
        <div class="s-icon green">&#8595;</div>
        <div class="s-label">Total Received</div>
        <div class="s-amount" style="color:#16A34A;">${formatCurrency(periodGot, true)}</div>
        <div class="s-sub">Total amount received</div>
      </div>
      <div class="s-card entries">
        <div class="s-icon gray">&#128203;</div>
        <div class="s-label">Total Entries</div>
        <div class="s-amount" style="color:#0F172A;">${transactions.length}</div>
        <div class="s-sub">Total transactions</div>
      </div>
    </div>

    <!-- Outstanding Balance Banner -->
    <div class="outstanding">
      <div class="out-left">
        <div class="out-icon">&#128178;</div>
        <div>
          <div class="out-title">Outstanding Balance</div>
          <div class="out-sub">${outstandingDesc}</div>
        </div>
      </div>
      <div class="out-amount">${balAmt}</div>
    </div>

    <!-- Transaction Table -->
    <div class="table-title">Transaction <span>Details</span></div>
    <table>
      <thead>
        <tr>
          <th class="tc" style="width:5%;">#</th>
          <th style="width:16%;">Date</th>
          <th style="width:30%;">Description</th>
          <th class="tc" style="width:17%;">Type</th>
          <th class="tr" style="width:16%;">Amount</th>
          <th class="tr" style="width:16%;">Balance</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows.length ? tableRows : emptyRow}
      </tbody>
    </table>

    <!-- Amount to be Received/Paid Card -->
    <div class="receive-card">
      <div class="rec-left">
        <div class="rec-icon">&#129689;</div>
        <div>
          <div class="rec-title">${receiveTitle}</div>
          <div class="rec-sub">${receiveSub}</div>
        </div>
      </div>
      <div class="rec-right">
        <div class="rec-amount">${balAmt}</div>
        <div class="rec-words">(${balWords})</div>
      </div>
    </div>

    <!-- Footer: Notes + QR -->
    <div class="footer-row">
      <div class="note-box">
        <div class="note-title">&#8505; Note</div>
        <div class="note-item">• This is a system generated statement from HisabPro.</div>
        <div class="note-item">• All amounts are in Indian Rupees (₹).</div>
        <div class="note-item">• For any queries, please contact us.</div>
      </div>
      <div class="qr-col">
        <div class="qr-wrap">
          <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="6" fill="#FFFFFF"/>
            <rect x="8" y="8" width="28" height="28" rx="4" fill="#0B0F11"/>
            <rect x="12" y="12" width="20" height="20" rx="2" fill="#FFFFFF"/>
            <rect x="16" y="16" width="12" height="12" rx="1" fill="#FF7A00"/>
            <rect x="64" y="8" width="28" height="28" rx="4" fill="#0B0F11"/>
            <rect x="68" y="12" width="20" height="20" rx="2" fill="#FFFFFF"/>
            <rect x="72" y="16" width="12" height="12" rx="1" fill="#FF7A00"/>
            <rect x="8" y="64" width="28" height="28" rx="4" fill="#0B0F11"/>
            <rect x="12" y="68" width="20" height="20" rx="2" fill="#FFFFFF"/>
            <rect x="16" y="72" width="12" height="12" rx="1" fill="#FF7A00"/>
            <rect x="42" y="10" width="6" height="6" fill="#0B0F11"/>
            <rect x="52" y="10" width="6" height="6" fill="#0B0F11"/>
            <rect x="44" y="22" width="6" height="6" fill="#0B0F11"/>
            <rect x="10" y="42" width="6" height="6" fill="#0B0F11"/>
            <rect x="22" y="44" width="6" height="6" fill="#0B0F11"/>
            <rect x="38" y="38" width="10" height="10" rx="2" fill="#FF7A00"/>
            <rect x="52" y="38" width="10" height="10" rx="2" fill="#0B0F11"/>
            <rect x="64" y="44" width="6" height="6" fill="#0B0F11"/>
            <rect x="76" y="42" width="6" height="6" fill="#0B0F11"/>
            <rect x="86" y="44" width="6" height="6" fill="#0B0F11"/>
            <rect x="38" y="52" width="10" height="10" rx="2" fill="#0B0F11"/>
            <rect x="52" y="52" width="10" height="10" rx="2" fill="#FF7A00"/>
            <rect x="64" y="56" width="6" height="6" fill="#0B0F11"/>
            <rect x="42" y="68" width="6" height="6" fill="#0B0F11"/>
            <rect x="54" y="68" width="6" height="6" fill="#0B0F11"/>
            <rect x="66" y="68" width="6" height="6" fill="#0B0F11"/>
            <rect x="78" y="68" width="6" height="6" fill="#0B0F11"/>
            <rect x="86" y="78" width="6" height="6" fill="#0B0F11"/>
            <rect x="44" y="82" width="6" height="6" fill="#0B0F11"/>
            <rect x="56" y="82" width="6" height="6" fill="#0B0F11"/>
            <rect x="70" y="82" width="6" height="6" fill="#0B0F11"/>
          </svg>
        </div>
        <div class="qr-label">Scan to get</div>
        <div class="qr-sub"><span class="qr-app">HisabPro App</span><br>Track customers & grow.</div>
      </div>
    </div>

  </div><!-- /body-pad -->

  <!-- Dark Bottom Bar -->
  <div class="bottom-bar">
    <div class="bb-left">
      <div class="bb-logo-box">
        <svg viewBox="0 0 28 28" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4L14 4L14 14L4 14Z" fill="white" fill-opacity="0.3"/>
          <path d="M14 14L24 4L24 24L14 24Z" fill="white"/>
          <path d="M4 14L14 24L4 24Z" fill="white" fill-opacity="0.6"/>
        </svg>
      </div>
      <div>
        <div class="bb-brand">Hisab<span>Pro</span></div>
        <div class="bb-tag">Simple Accounts. Better Business.</div>
      </div>
    </div>
    <div class="bb-right">
      <span style="color:#FF7A00;font-size:12px;">&#127760;</span>
      <span class="bb-url">www.hisabpro.in</span>
    </div>
  </div>

</div><!-- /page -->
</body>
</html>`;
}

// ─── Web: open print window (works as "Save as PDF" in Chrome) ───────────────

async function webPrintPdf(html: string): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const w = window.open('', '_blank');
  if (!w) {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document ?? iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 3000);
      }, 500);
    }
    return;
  }

  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 600);
}

// ─── Main PDF Generator ──────────────────────────────────────────────────────

export const generateAndShareCustomerReportPdf = async (
  options: GenerateReportOptions
): Promise<void> => {
  const html = buildHtml(options);

  if (Platform.OS === 'web') {
    await webPrintPdf(html);
    return;
  }

  // Mobile: print to file then share
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
      dialogTitle: `HisabPro Statement – ${options.customer.name}`,
    });
  }
};

/**
 * Share via WhatsApp:
 * - On native mobile: generates actual PDF file and shares it via the share sheet directly into WhatsApp
 * - On web: opens PDF print/preview in a tab AND opens WhatsApp with message informing statement is ready
 */
export const generateAndShareViaWhatsApp = async (
  options: GenerateReportOptions
): Promise<void> => {
  const html = buildHtml(options);
  const { customer } = options;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      // 1. Open PDF preview tab with auto-print
      const pdfTab = window.open('', '_blank');
      if (pdfTab) {
        pdfTab.document.open();
        pdfTab.document.write(html);
        pdfTab.document.close();
        pdfTab.focus();
        setTimeout(() => pdfTab.print(), 600);
      }

      // 2. Open WhatsApp chat
      const cleanPhone = customer.phone ? customer.phone.replace(/[^0-9]/g, '') : '';
      const waMsg = encodeURIComponent(
        `Hi ${customer.name}, please find attached your HisabPro account statement.`
      );
      const waUrl = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${waMsg}`
        : `https://wa.me/?text=${waMsg}`;
      setTimeout(() => window.open(waUrl, '_blank'), 400);
    }
    return;
  }

  // Mobile: generate PDF file and share directly to WhatsApp
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
      dialogTitle: `Share Statement PDF via WhatsApp – ${customer.name}`,
    });
  }
};

// ─── Plain Text Report ────────────────────────────────────────────────────────

export const generatePlainTextReport = (options: GenerateReportOptions): string => {
  const { customer, transactions, periodLabel } = options;
  const balance = calculateCustomerBalance(transactions);

  let periodGiven = 0;
  let periodGot = 0;
  for (const tx of transactions) {
    const amt = Number(tx.amount) || 0;
    if (tx.transaction_type === 'you_gave') periodGiven += amt;
    else periodGot += amt;
  }

  const isLena = balance.status === 'lena_hai';
  const isDena = balance.status === 'dena_hai';
  const statusLabel = isLena ? 'To Receive' : isDena ? 'To Pay' : 'Settled';
  const balWords = numberToWordsIndian(balance.displayAmount);

  let t = `📊 *HISABPRO ACCOUNT STATEMENT*\n`;
  t += `━━━━━━━━━━━━━━━━━━━━\n`;
  t += `👤 *Customer:* ${customer.name}\n`;
  if (customer.phone) t += `📞 *Phone:* ${customer.phone}\n`;
  t += `📅 *Period:* ${periodLabel}\n`;
  t += `⏰ *Generated On:* ${formatDate(new Date().toISOString())}\n`;
  t += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  t += `💰 *SUMMARY*\n`;
  t += `🔴 *Total Given:* ${formatCurrency(periodGiven, true)}\n`;
  t += `🟢 *Total Received:* ${formatCurrency(periodGot, true)}\n`;
  t += `📝 *Total Entries:* ${transactions.length}\n\n`;
  t += `━━━━━━━━━━━━━━━━━━━━\n`;
  t += `⚖️ *OUTSTANDING BALANCE*\n`;
  t += `👉 *${formatCurrency(balance.displayAmount, true)} (${statusLabel})*\n`;
  t += `_${balWords}_\n`;
  t += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (transactions.length > 0) {
    t += `📋 *TRANSACTION DETAILS:*\n`;
    const sorted = [...transactions]
      .sort((a, b) => a.transaction_date.localeCompare(b.transaction_date))
      .slice(0, 10);
    sorted.forEach((tx, i) => {
      const isGave = tx.transaction_type === 'you_gave';
      const icon = isGave ? '🔴 Given' : '🟢 Received';
      t += `${i + 1}. ${formatDate(tx.transaction_date)} | ${icon} | ${formatCurrency(tx.amount, true)}`;
      if (tx.note) t += ` (${tx.note})`;
      t += '\n';
    });
    if (transactions.length > 10) {
      t += `...and ${transactions.length - 10} more entries.\n`;
    }
  }

  t += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  t += `_Generated via HisabPro • Simple Accounts. Better Business._\n`;
  t += `_🌐 www.hisabpro.in_`;
  return t;
};
