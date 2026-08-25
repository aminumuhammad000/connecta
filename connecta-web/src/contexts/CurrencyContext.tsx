import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_CURRENCIES, formatCurrency, type CurrencyCode, type CurrencyConfig } from '../utils/currency';
import { currencyAPI } from '../services/api';

interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (code: string) => void;
  currencies: CurrencyConfig[];
  currenciesMap: Record<string, CurrencyConfig>;
  loadingCurrencies: boolean;
  refreshCurrencies: () => Promise<void>;
  formatPrice: (amountInUSD: number) => string;
  formatDualPrice: (amountInUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currenciesList, setCurrenciesList] = useState<CurrencyConfig[]>(Object.values(SUPPORTED_CURRENCIES));
  const [currenciesMap, setCurrenciesMap] = useState<Record<string, CurrencyConfig>>(SUPPORTED_CURRENCIES as any);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);

  const [selectedCurrency, setSelectedCurrencyState] = useState<string>(() => {
    const saved = localStorage.getItem('connecta_currency');
    return saved || 'USD';
  });

  const fetchBackendCurrencies = async () => {
    setLoadingCurrencies(true);
    try {
      const res = await currencyAPI.getCurrencies(true);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const fetchedList: CurrencyConfig[] = res.data.map((c: any) => ({
          code: c.code,
          symbol: c.symbol,
          name: c.name,
          flag: c.flag || '🌐',
          rateToUSD: Number(c.rateToUSD) || 1.0,
        }));

        const newMap: Record<string, CurrencyConfig> = {};
        fetchedList.forEach((c) => {
          newMap[c.code] = c;
        });

        setCurrenciesList(fetchedList);
        setCurrenciesMap(newMap);
      }
    } catch (err) {
      console.warn('Using fallback local currency map:', err);
    } finally {
      setLoadingCurrencies(false);
    }
  };

  useEffect(() => {
    fetchBackendCurrencies();
  }, []);

  const setSelectedCurrency = (code: string) => {
    setSelectedCurrencyState(code);
    localStorage.setItem('connecta_currency', code);
  };

  const formatPrice = (amountInUSD: number) => {
    if (selectedCurrency === 'USD') {
      return formatCurrency(amountInUSD, 'USD');
    }
    const targetConfig = currenciesMap[selectedCurrency] || SUPPORTED_CURRENCIES[selectedCurrency as CurrencyCode];
    if (!targetConfig) {
      return formatCurrency(amountInUSD, 'USD');
    }
    const converted = amountInUSD * targetConfig.rateToUSD;
    return `${targetConfig.symbol}${new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 2 }).format(converted)} ${targetConfig.code}`;
  };

  const formatDualPrice = (amountInUSD: number) => {
    const primaryUSD = formatCurrency(amountInUSD, 'USD');
    if (selectedCurrency === 'USD') return primaryUSD;

    const targetConfig = currenciesMap[selectedCurrency] || SUPPORTED_CURRENCIES[selectedCurrency as CurrencyCode];
    if (!targetConfig) return primaryUSD;

    const convertedAmount = amountInUSD * targetConfig.rateToUSD;
    const secondaryFormatted = `${targetConfig.symbol}${new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 2 }).format(convertedAmount)} ${targetConfig.code}`;

    return `${primaryUSD} (~${secondaryFormatted})`;
  };

  return (
    <CurrencyContext.Provider value={{
      selectedCurrency,
      setSelectedCurrency,
      currencies: currenciesList,
      currenciesMap,
      loadingCurrencies,
      refreshCurrencies: fetchBackendCurrencies,
      formatPrice,
      formatDualPrice
    }}>
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
