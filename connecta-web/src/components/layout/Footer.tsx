import React from 'react';
import { useLocation } from 'react-router-dom';

export const Footer: React.FC = () => {
  const location = useLocation();
  const isAuthPage = ['/', '/login', '/register', '/register/role', '/register/password', '/register/skills', '/register/profile-setup', '/forgot-password'].includes(location.pathname);

  if (isAuthPage) {
    return (
      <footer style={{
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        marginTop: 'auto'
      }}>
        © {new Date().getFullYear()} Connecta. Secure Platform.
      </footer>
    );
  }

  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      padding: '24px',
      textAlign: 'center',
      fontSize: '0.85rem',
      color: 'var(--text-muted)',
      marginTop: 'auto'
    }}>
      © {new Date().getFullYear()} Connecta Nigeria. All rights reserved.
    </footer>
  );
};
