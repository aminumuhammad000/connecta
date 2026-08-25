import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { Globe, DollarSign, ArrowRight, Sparkles, Check } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  defaultCurrency: string;
}

export const AFRICAN_COUNTRIES: CountryOption[] = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', defaultCurrency: 'NGN' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', defaultCurrency: 'GHS' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', defaultCurrency: 'KSH' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', defaultCurrency: 'ZAR' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', defaultCurrency: 'USD' },
];

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'KSH', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

import { useCurrency } from '../../contexts/CurrencyContext';

export const CountryCurrencyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const { currencies } = useCurrency();

  const [selectedCountry, setSelectedCountry] = useState<string>(user?.country || 'Nigeria');
  const [selectedCurrency, setSelectedCurrency] = useState<string>(user?.currency || 'NGN');
  const [submitting, setSubmitting] = useState(false);

  const handleCountrySelect = (country: CountryOption) => {
    setSelectedCountry(country.name);
    setSelectedCurrency(country.defaultCurrency);
  };

  const handleSave = async () => {
    if (!selectedCountry || !selectedCurrency) {
      toastError('Selection Required', 'Please select both your country and preferred currency');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authAPI.updateMe({
        country: selectedCountry,
        currency: selectedCurrency
      });
      if (res.success && res.data) {
        updateUser(res.data);
        toastSuccess('Preferences Saved!', 'Next, build your freelancer profile bio');
        navigate('/register/profile-setup');
      } else {
        toastError('Failed', res.message || 'Could not save preferences');
      }
    } catch (err: any) {
      toastError('Error', err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Navbar />

      <main style={{
        flex: 1,
        maxWidth: '720px',
        margin: '0 auto',
        padding: '50px 24px 80px',
        width: '100%',
        position: 'relative',
        zIndex: 10
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '40px 32px' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--grad-glow)',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              marginBottom: '12px'
            }}>
              <Sparkles size={14} /> Profile Setup: Location & Currency
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
              Select Country & Preferred Currency
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Choose your country of residence and default billing currency for local wallet payouts
            </p>
          </div>

          {/* Country Selection Section */}
          <div style={{ marginBottom: '32px' }}>
            <label className="form-label" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} color="var(--primary)" /> Select Country *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
              {AFRICAN_COUNTRIES.map((c) => {
                const isSelected = selectedCountry === c.name;
                return (
                  <motion.div
                    key={c.code}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleCountrySelect(c)}
                    style={{
                      padding: '16px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--grad-glow)' : 'var(--bg-secondary)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      position: 'relative',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '6px' }}>{c.flag}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: isSelected ? 700 : 500, color: 'var(--text-primary)' }}>
                      {c.name}
                    </div>
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center'
                      }}>
                        <Check size={12} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Currency Selection Section */}
          <div style={{ marginBottom: '36px' }}>
            <label className="form-label" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={18} color="var(--primary)" /> Preferred Currency ({currencies.length} Supported Currencies) *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
              {currencies.map((curr) => {
                const isSelected = selectedCurrency === curr.code;
                return (
                  <motion.div
                    key={curr.code}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedCurrency(curr.code)}
                    style={{
                      padding: '16px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--grad-glow)' : 'var(--bg-secondary)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      position: 'relative',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                      {curr.symbol} ({curr.code})
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {curr.name}
                    </div>
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center'
                      }}>
                        <Check size={12} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Save & Continue Action */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
          >
            Save Location & Currency <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
