import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { type CurrencyCode } from '../../utils/currency';
import { Sun, Moon, LogOut, LayoutDashboard, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../common/Logo';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { selectedCurrency, setSelectedCurrency, currencies } = useCurrency();
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = ['/', '/login', '/register', '/register/role', '/register/password', '/register/skills', '/register/profile-setup', '/forgot-password'].includes(location.pathname);

  const handleDashboardRedirect = () => {
    if (!user) return;
    if (user.userType === 'client') {
      navigate('/client/dashboard');
    } else {
      navigate('/freelancer/dashboard');
    }
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'var(--card-glass)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      padding: '14px 28px',
      transition: 'var(--transition-fast)'
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand Real Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Logo height={38} />
        </Link>

        {/* Right Action Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Header Currency Selector Dropdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 10px',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'var(--text-primary)'
          }}>
            <Globe size={15} color="var(--primary)" />
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                outline: 'none'
              }}
              title="Select Display Currency"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                  {c.flag} {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Theme Switcher */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={19} color="#F59E0B" /> : <Moon size={19} color="#4B5563" />}
          </motion.button>

          {isAuthenticated && user ? (
            <div style={{ position: 'relative' }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '4px 12px 4px 4px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'var(--grad-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  overflow: 'hidden'
                }}>
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
                  )}
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {user.firstName}
                </span>
              </motion.div>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '50px',
                      width: '200px',
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '8px',
                      zIndex: 1100
                    }}
                  >
                    <button
                      onClick={handleDashboardRedirect}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        background: 'none',
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      <LayoutDashboard size={18} /> Dashboard
                    </button>
                    <button
                      onClick={logout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        background: 'none',
                        color: 'var(--error)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : isAuthPage && location.pathname !== '/login' ? (
            <Link to="/login" style={{
              fontWeight: 600,
              fontSize: '0.9rem',
              color: 'var(--primary)',
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              textDecoration: 'none'
            }}>
              Sign In
            </Link>
          ) : isAuthPage && location.pathname === '/login' ? (
            <Link to="/register/role" style={{
              fontWeight: 600,
              fontSize: '0.9rem',
              color: '#ffffff',
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--grad-primary)',
              textDecoration: 'none'
            }}>
              Register
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
};
