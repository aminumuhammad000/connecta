import React, { createContext, useContext, useState } from 'react';
import { SUPPORTED_CURRENCIES, formatCurrency, formatDualCurrency, type CurrencyCode } from '../utils/currency';

interface CurrencyContextType {
  selectedCurrency: CurrencyCode;
  setSelectedCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;
  formatDualPrice: (amountInUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('connecta_currency') as CurrencyCode;
    return saved && saved in SUPPORTED_CURRENCIES ? saved : 'USD';
  });

  const setSelectedCurrency = (code: CurrencyCode) => {
    setSelectedCurrencyState(code);
    localStorage.setItem('connecta_currency', code);
  };

  const formatPrice = (amountInUSD: number) => {
    if (selectedCurrency === 'USD') {
      return formatCurrency(amountInUSD, 'USD');
    }
    const targetConfig = SUPPORTED_CURRENCIES[selectedCurrency];
    const converted = amountInUSD * targetConfig.rateToUSD;
    return formatCurrency(converted, selectedCurrency);
  };

  const formatDualPrice = (amountInUSD: number) => {
    return formatDualCurrency(amountInUSD, selectedCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setSelectedCurrency, formatPrice, formatDualPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
