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

// ─── Number to Words ────────────────────────────────────────────────────────

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

// ─── Build HTML template matching reference image ───────────────────────────

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

  const emptyRow = `<tr><td colspan="6" class="tc" style="padding:28px;color:#94A3B8;">No transactions recorded in this period.</td></tr>`;

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
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#F1F5F9;color:#0F172A;padding:20px;}
@media print{
  body{background:#FFFFFF;padding:0;}
  .no-print{display:none!important;}
  .page{box-shadow:none;border-radius:0;margin:0;max-width:100%;}
}
.no-print{
  background:#0B0F11;padding:12px 16px;border-radius:10px;margin-bottom:16px;
  display:flex;justify-content:space-between;align-items:center;
}
.no-print-title{color:#FFFFFF;font-size:13px;font-weight:700;}
.no-print-title span{color:#FF7A00;}
.btn-print{background:#FF7A00;color:#0B0F11;border:none;padding:8px 16px;border-radius:8px;font-weight:800;font-size:12px;cursor:pointer;}
.page{background:#FFFFFF;max-width:760px;margin:0 auto;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);}

/* ── Dark Header ── */
.hdr{background:#0B0F11;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;}
.hdr-left{display:flex;align-items:center;gap:14px;}
.logo-box{width:44px;height:44px;background:#FF7A00;border-radius:12px;display:flex;align-items:center;justify-content:center;}
.logo-box svg{width:28px;height:28px;}
.brand-name{font-size:22px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;}
.brand-name span{color:#FF7A00;}
.brand-tag{font-size:10px;color:#94A3B8;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;margin-top:2px;}
.hdr-right{text-align:right;}
.hdr-title{font-size:22px;font-weight:900;color:#FFFFFF;}
.hdr-title span{color:#FF7A00;}
.hdr-sub{font-size:11px;color:#94A3B8;margin-top:3px;}

/* ── Body Padding ── */
.body-pad{padding:20px 24px;}

/* ── Customer Card ── */
.customer-card{background:#FFFFFF;border:1px solid #E2E8F0;border-radius:14px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}
.cust-left{display:flex;align-items:center;gap:14px;}
.avatar{width:52px;height:52px;border-radius:50%;background:#FF7A00;color:#FFFFFF;font-size:22px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.cust-label{font-size:11px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;}
.cust-name{font-size:22px;font-weight:900;color:#0F172A;line-height:1.2;}
.cust-phone{font-size:13px;color:#64748B;margin-top:4px;display:flex;align-items:center;gap:5px;font-weight:600;}
.cust-right{text-align:right;}
.meta-row{font-size:12px;color:#475569;margin-bottom:6px;display:flex;align-items:center;justify-content:flex-end;gap:6px;}
.meta-row strong{color:#0F172A;}

/* ── Summary Cards ── */
.summary-grid{display:flex;gap:12px;margin-bottom:16px;}
.s-card{flex:1;border-radius:12px;padding:14px 16px;}
.s-card.given{background:#FEF2F2;border:1px solid #FECACA;}
.s-card.received{background:#F0FDF4;border:1px solid #BBF7D0;}
.s-card.entries{background:#F8FAFC;border:1px solid #E2E8F0;}
.s-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:8px;font-size:16px;}
.s-icon.red{background:#EF4444;}
.s-icon.green{background:#22C55E;}
.s-icon.gray{background:#E2E8F0;}
.s-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748B;}
.s-amount{font-size:20px;font-weight:900;margin-top:4px;}
.s-sub{font-size:11px;color:#94A3B8;margin-top:2px;}

/* ── Outstanding Banner ── */
.outstanding{background:#FFF7ED;border:1.5px solid #FED7AA;border-radius:14px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}
.out-left{display:flex;align-items:center;gap:14px;}
.out-icon{width:42px;height:42px;background:#FF7A00;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
.out-title{font-size:15px;font-weight:900;color:#7C2D12;}
.out-sub{font-size:12px;color:#C2410C;margin-top:3px;}
.out-amount{font-size:28px;font-weight:900;color:#FF7A00;}

/* ── Transaction Table ── */
.table-title{font-size:15px;font-weight:900;color:#0F172A;margin-bottom:10px;}
.table-title span{color:#FF7A00;}
table{width:100%;border-collapse:collapse;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;margin-bottom:20px;}
thead tr{background:#0B0F11;}
th{color:#FFFFFF;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;padding:12px 14px;text-align:left;}
td{padding:12px 14px;font-size:13px;color:#334155;border-bottom:1px solid #F1F5F9;}
tr:last-child td{border-bottom:none;}
.tc{text-align:center;}
.tr{text-align:right;}
.badge{display:inline-block;padding:4px 10px;border-radius:9999px;font-size:11px;font-weight:700;letter-spacing:0.3px;}
.badge-given{background:#FEE2E2;color:#DC2626;}
.badge-received{background:#DCFCE7;color:#16A34A;}

/* ── Receive Banner ── */
.receive-card{background:#FFF7ED;border:1.5px solid #FED7AA;border-radius:14px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}
.rec-left{display:flex;align-items:center;gap:14px;}
.rec-icon{width:42px;height:42px;background:#FF7A00;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
.rec-title{font-size:15px;font-weight:900;color:#7C2D12;}
.rec-sub{font-size:12px;color:#C2410C;margin-top:3px;}
.rec-right{text-align:right;}
.rec-amount{font-size:26px;font-weight:900;color:#FF7A00;}
.rec-words{font-size:11px;color:#C2410C;font-style:italic;margin-top:4px;}

/* ── Footer ── */
.footer-row{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:20px;padding-top:16px;border-top:1px dashed #CBD5E1;}
.note-box{flex:1;}
.note-title{font-size:11px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;display:flex;align-items:center;gap:5px;}
.note-item{font-size:11px;color:#64748B;line-height:1.7;}
.qr-col{text-align:center;}
.qr-wrap{width:90px;height:90px;border:2px solid #E2E8F0;border-radius:12px;padding:6px;background:#FFFFFF;display:flex;align-items:center;justify-content:center;}
.qr-label{font-size:10px;font-weight:700;color:#0F172A;margin-top:6px;}
.qr-sub{font-size:10px;color:#64748B;margin-top:2px;line-height:1.4;max-width:90px;}
.qr-app{color:#FF7A00;font-weight:800;}

/* ── Dark Bottom Bar ── */
.bottom-bar{background:#0B0F11;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;}
.bb-left{display:flex;align-items:center;gap:12px;}
.bb-logo-box{width:32px;height:32px;background:#FF7A00;border-radius:8px;display:flex;align-items:center;justify-content:center;}
.bb-brand{font-size:14px;font-weight:900;color:#FFFFFF;}
.bb-brand span{color:#FF7A00;}
.bb-tag{font-size:10px;color:#64748B;letter-spacing:0.5px;text-transform:uppercase;}
.bb-right{border:1px solid #334155;padding:6px 14px;border-radius:9999px;display:flex;align-items:center;gap:6px;}
.bb-url{font-size:12px;color:#94A3B8;font-weight:600;}
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
        <div class="meta-row">
          <span>&#128197;</span>
          <div><div style="font-size:10px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Statement Period</div>
          <strong>${periodLabel}</strong></div>
        </div>
        <div class="meta-row">
          <span>&#128203;</span>
          <div><div style="font-size:10px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Generated On</div>
          <strong>${generatedOn}</strong></div>
        </div>
      </div>
    </div>

    <!-- 3 Summary Cards -->
    <div class="summary-grid">
      <div class="s-card given">
        <div class="s-icon red" style="color:#FFF;font-size:14px;font-weight:900;">&#8593;</div>
        <div class="s-label">Total Given</div>
        <div class="s-amount" style="color:#DC2626;">${formatCurrency(periodGiven, true)}</div>
        <div class="s-sub">Total amount you gave</div>
      </div>
      <div class="s-card received">
        <div class="s-icon green" style="color:#FFF;font-size:14px;font-weight:900;">&#8595;</div>
        <div class="s-label">Total Received</div>
        <div class="s-amount" style="color:#16A34A;">${formatCurrency(periodGot, true)}</div>
        <div class="s-sub">Total amount received</div>
      </div>
      <div class="s-card entries">
        <div class="s-icon gray" style="font-size:14px;">&#128203;</div>
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
          <svg width="70" height="70" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <div class="qr-sub"><span class="qr-app">HisabPro App</span><br>Track your customers, expenses and grow your business.</div>
      </div>
    </div>

  </div><!-- /body-pad -->

  <!-- Dark Bottom Bar -->
  <div class="bottom-bar">
    <div class="bb-left">
      <div class="bb-logo-box">
        <svg viewBox="0 0 28 28" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      <span style="color:#FF7A00;font-size:13px;">&#127760;</span>
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

  // Open a new blank tab, inject the styled HTML, then trigger print
  const w = window.open('', '_blank');
  if (!w) {
    // If popup blocked, use hidden iframe fallback
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
      }, 600);
    }
    return;
  }

  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  // Delay to let CSS and fonts load
  setTimeout(() => w.print(), 800);
}

// ─── Main PDF generator ──────────────────────────────────────────────────────

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

// ─── WhatsApp text report ─────────────────────────────────────────────────────

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
