import React from 'react';
import { useLocation } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      background: 'transparent',
      borderTop: 'none',
      boxShadow: 'none',
      padding: '20px 24px',
      textAlign: 'center',
      fontSize: '0.8rem',
      color: 'var(--text-muted)',
      marginTop: 'auto',
      position: 'relative',
      zIndex: 10
    }}>
      © 2026 Connecta. Developed by Pioneers ICT. All rights reserved.
    </footer>
  );
};
