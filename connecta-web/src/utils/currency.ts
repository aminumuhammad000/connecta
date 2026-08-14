export type CurrencyCode = 'USD' | 'GBP' | 'EUR' | 'NGN' | 'KES' | 'GHS' | 'UGX' | 'ZAR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  rateToUSD: number; // 1 USD = X Local Currency
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', rateToUSD: 1.0 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', rateToUSD: 0.79 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', rateToUSD: 0.92 },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬', rateToUSD: 1500.0 },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪', rateToUSD: 130.0 },
  GHS: { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', flag: '🇬🇭', rateToUSD: 15.5 },
  UGX: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', flag: '🇺🇬', rateToUSD: 3700.0 },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦', rateToUSD: 18.5 },
};

/**
 * Format a number into standard localized currency string
 */
export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  const code = (currencyCode.toUpperCase() in SUPPORTED_CURRENCIES) 
    ? (currencyCode.toUpperCase() as CurrencyCode) 
    : 'USD';
  const config = SUPPORTED_CURRENCIES[code];

  try {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return `${config.symbol}${formatted} ${config.code}`;
  } catch {
    return `${config.symbol}${amount} ${config.code}`;
  }
};

/**
 * Format dual currency pricing: e.g. "$1,200 USD (~₦1,800,000 NGN)"
 */
export const formatDualCurrency = (amountInUSD: number, userCurrencyCode: string = 'USD'): string => {
  const primaryUSD = formatCurrency(amountInUSD, 'USD');
  const userCode = userCurrencyCode.toUpperCase() as CurrencyCode;

  if (userCode === 'USD' || !(userCode in SUPPORTED_CURRENCIES)) {
    return primaryUSD;
  }

  const targetConfig = SUPPORTED_CURRENCIES[userCode];
  const convertedAmount = amountInUSD * targetConfig.rateToUSD;
  const secondaryFormatted = formatCurrency(convertedAmount, userCode);

  return `${primaryUSD} (~${secondaryFormatted})`;
};

/**
 * Format job budget respecting the job's chosen currency code
 */
export const formatJobBudget = (budget: number, jobCurrency?: string): string => {
  const code = (jobCurrency && jobCurrency.toUpperCase() in SUPPORTED_CURRENCIES)
    ? jobCurrency.toUpperCase()
    : 'USD';
  return formatCurrency(budget, code);
};
