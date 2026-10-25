import { CustomerStatus, TransactionType } from '../types';

/**
 * Format currency in Indian Rupees format (e.g. ₹1,25,000 or ₹500)
 */
export const formatCurrency = (amount: number, showDecimal = false): string => {
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
};

/**
 * Get current date string (YYYY-MM-DD) in Asia/Kolkata timezone
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  // Using Intl to resolve Kolkata date
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now);
};

/**
 * Format date string (YYYY-MM-DD or ISO) into readable Indian date (e.g. 23 Oct 2026)
 */
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};

/**
 * Format date and time (e.g. 23 Oct 2026, 03:45 PM)
 */
export const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateStr;
  }
};

/**
 * Format customer status label and styling (English)
 */
export const getStatusBadgeInfo = (status: CustomerStatus) => {
  switch (status) {
    case 'lena_hai':
      return {
        label: 'To Receive',
        subtitle: "You'll get",
        type: 'positive' as const,
      };
    case 'dena_hai':
      return {
        label: 'To Pay',
        subtitle: "You'll give",
        type: 'negative' as const,
      };
    case 'settled':
    default:
      return {
        label: 'Settled',
        subtitle: 'No balance',
        type: 'settled' as const,
      };
  }
};

/**
 * Transaction type helpers (English)
 */
export const getTransactionTypeInfo = (type: TransactionType) => {
  if (type === 'you_gave') {
    return {
      label: 'You Gave',
      subtitle: 'Debit',
      type: 'negative' as const,
      sign: '+', // increases what customer owes user
    };
  }
  return {
    label: 'You Got',
    subtitle: 'Credit',
    type: 'positive' as const,
    sign: '-', // reduces what customer owes user
  };
};

/**
 * Format relative time (e.g. 'Today', 'Yesterday', '2 days ago', etc.)
 */
export const formatTimeAgo = (dateStr?: string | null): string => {
  if (!dateStr) return 'No transactions yet';
  try {
    const todayStr = getTodayDateString();
    if (dateStr === todayStr) return 'Today';

    const txDate = new Date(dateStr);
    const today = new Date(todayStr);
    const diffDays = Math.round(
      (today.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 1 && diffDays < 30) return `${diffDays} days ago`;
    if (diffDays >= 30 && diffDays < 60) return '1 month ago';
    if (diffDays >= 60) return `${Math.floor(diffDays / 30)} months ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
};
