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
 * Format customer status label and styling
 */
export const getStatusBadgeInfo = (status: CustomerStatus) => {
  switch (status) {
    case 'lena_hai':
      return {
        label: 'Lena Hai',
        subtitle: 'You will get',
        type: 'positive' as const,
      };
    case 'dena_hai':
      return {
        label: 'Dena Hai',
        subtitle: 'You will give',
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
 * Transaction type helpers
 */
export const getTransactionTypeInfo = (type: TransactionType) => {
  if (type === 'you_gave') {
    return {
      label: 'Maine Diye',
      subtitle: 'You Gave',
      type: 'negative' as const,
      sign: '+', // increases what customer owes user (Lena Hai)
    };
  }
  return {
    label: 'Mujhe Mile',
    subtitle: 'You Got',
    type: 'positive' as const,
    sign: '-', // reduces what customer owes user
  };
};
