// Pure calculation functions test
function calculateCustomerBalance(transactions) {
  let totalGave = 0;
  let totalGot = 0;

  for (const tx of transactions) {
    const amount = Number(tx.amount) || 0;
    if (tx.transaction_type === 'you_gave') {
      totalGave += amount;
    } else if (tx.transaction_type === 'you_got') {
      totalGot += amount;
    }
  }

  totalGave = Math.round(totalGave * 100) / 100;
  totalGot = Math.round(totalGot * 100) / 100;
  const netBalance = Math.round((totalGave - totalGot) * 100) / 100;

  let status = 'settled';
  if (netBalance > 0.001) {
    status = 'lena_hai';
  } else if (netBalance < -0.001) {
    status = 'dena_hai';
  } else {
    status = 'settled';
  }

  return {
    totalGave,
    totalGot,
    netBalance,
    status,
    displayAmount: Math.abs(netBalance),
  };
}

function calculateDashboardSummary(enrichedCustomers, allTransactions, allExpenses) {
  let totalGiven = 0;
  let totalReceived = 0;

  for (const tx of allTransactions) {
    const amount = Number(tx.amount) || 0;
    if (tx.transaction_type === 'you_gave') {
      totalGiven += amount;
    } else if (tx.transaction_type === 'you_got') {
      totalReceived += amount;
    }
  }

  let lenaHai = 0;
  let denaHai = 0;

  for (const c of enrichedCustomers) {
    if (c.status === 'lena_hai') {
      lenaHai += c.displayAmount;
    } else if (c.status === 'dena_hai') {
      denaHai += c.displayAmount;
    }
  }

  totalGiven = Math.round(totalGiven * 100) / 100;
  totalReceived = Math.round(totalReceived * 100) / 100;
  lenaHai = Math.round(lenaHai * 100) / 100;
  denaHai = Math.round(denaHai * 100) / 100;
  const netBalance = Math.round((lenaHai - denaHai) * 100) / 100;

  return {
    totalGiven,
    totalReceived,
    lenaHai,
    denaHai,
    netBalance,
  };
}

function formatCurrency(amount, showDecimal = false) {
  const absAmount = Math.abs(amount || 0);
  const formatted = showDecimal
    ? absAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : absAmount.toLocaleString('en-IN', {
        maximumFractionDigits: 0,
      });

  return `₹${formatted}`;
}

function assert(cond, msg) {
  if (!cond) throw new Error('FAIL: ' + msg);
  console.log('✅ PASS: ' + msg);
}

console.log('=== RUNNING HISABPRO VERIFICATION TESTS ===');

// 1. Lena Hai test
const bal1 = calculateCustomerBalance([
  { transaction_type: 'you_gave', amount: 5000 },
  { transaction_type: 'you_got', amount: 2000 },
]);
assert(bal1.netBalance === 3000, 'Customer balance is 3000');
assert(bal1.status === 'lena_hai', 'Customer status is lena_hai');
assert(bal1.displayAmount === 3000, 'Customer display amount is 3000');

// 2. Dena Hai test
const bal2 = calculateCustomerBalance([
  { transaction_type: 'you_gave', amount: 2000 },
  { transaction_type: 'you_got', amount: 5000 },
]);
assert(bal2.netBalance === -3000, 'Customer balance is -3000');
assert(bal2.status === 'dena_hai', 'Customer status is dena_hai');
assert(bal2.displayAmount === 3000, 'Display amount is positive 3000');

// 3. Settled test
const bal3 = calculateCustomerBalance([
  { transaction_type: 'you_gave', amount: 5000 },
  { transaction_type: 'you_got', amount: 5000 },
]);
assert(bal3.netBalance === 0, 'Customer balance is 0');
assert(bal3.status === 'settled', 'Customer status is settled');

// 4. Dashboard totals
const enrichedCustomers = [
  { id: 'c1', status: 'lena_hai', displayAmount: 3000 },
  { id: 'c2', status: 'dena_hai', displayAmount: 1500 },
  { id: 'c3', status: 'settled', displayAmount: 0 },
];
const allTxs = [
  { transaction_type: 'you_gave', amount: 5000 },
  { transaction_type: 'you_got', amount: 2000 },
  { transaction_type: 'you_gave', amount: 1000 },
  { transaction_type: 'you_got', amount: 2500 },
];
const dash = calculateDashboardSummary(enrichedCustomers, allTxs, []);
assert(dash.totalGiven === 6000, 'Dashboard total given is 6000');
assert(dash.totalReceived === 4500, 'Dashboard total received is 4500');
assert(dash.lenaHai === 3000, 'Dashboard lena hai is 3000');
assert(dash.denaHai === 1500, 'Dashboard dena hai is 1500');
assert(dash.netBalance === 1500, 'Dashboard net balance is 1500 (3000 - 1500)');

// 5. Currency format
assert(formatCurrency(125000) === '₹1,25,000', 'Formatted 125000 is ₹1,25,000');
assert(formatCurrency(-3500) === '₹3,500', 'Formatted -3500 is ₹3,500');

console.log('=== ALL TESTS PASSED! ===');
