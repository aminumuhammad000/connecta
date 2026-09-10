import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { Globe, DollarSign, ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
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
        const isClient = res.data.role === 'client';
        if (isClient) {
          toastSuccess('Preferences Saved!', 'Next, setup your company profile');
          navigate('/register/client-profile-setup');
        } else {
          toastSuccess('Preferences Saved!', 'Next, build your freelancer profile');
          navigate('/register/profile-setup');
        }
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
        maxWidth: '680px',
        margin: '0 auto',
        padding: '30px 20px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '32px 28px', width: '100%' }}
        >
          {/* Header & Back Action */}
          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <button
              type="button"
              onClick={() => navigate('/register/skills')}
              title="Go back"
              aria-label="Go back"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(253, 103, 48, 0.08)',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                transition: 'transform 0.2s ease, background 0.2s ease'
              }}
            >
              <ArrowLeft size={18} />
            </button>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'rgba(253, 103, 48, 0.08)',
                color: 'var(--primary)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.4px',
                marginBottom: '10px'
              }}>
                Step 3 of 4 · Location & Billing
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                Country & Currency
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                Choose your country and default wallet currency
              </p>
            </div>
          </div>

          {/* Country Selection Section */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={15} color="var(--primary)" /> Select Country *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))', gap: '10px' }}>
              {AFRICAN_COUNTRIES.map((c) => {
                const isSelected = selectedCountry === c.name;
                return (
                  <motion.div
                    key={c.code}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCountrySelect(c)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(253, 103, 48, 0.06)' : 'var(--bg-secondary)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      position: 'relative',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <div style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                      background: isSelected ? 'rgba(253, 103, 48, 0.12)' : 'var(--border-color)',
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      marginBottom: '6px',
                      letterSpacing: '0.5px'
                    }}>
                      {c.code}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: isSelected ? 700 : 500, color: 'var(--text-primary)' }}>
                      {c.name}
                    </div>
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '15px',
                        height: '15px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center'
                      }}>
                        <Check size={10} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Currency Selection Section (Minimalist Dropdown Select) */}
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={15} color="var(--primary)" /> Preferred Currency *
            </label>
            <div className="input-wrapper">
              <DollarSign className="input-icon-left" size={17} />
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="input-field"
                style={{ cursor: 'pointer', appearance: 'auto', fontWeight: 600 }}
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                    {curr.name} ({curr.symbol} {curr.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Save & Continue Action */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '0.98rem' }}
          >
            Save Location & Currency <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
