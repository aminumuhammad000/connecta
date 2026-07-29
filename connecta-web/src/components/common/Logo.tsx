import React from 'react';

interface LogoProps {
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({ height = 36, className, style }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', ...style }} className={className}>
      <img
        src="/logo.png"
        alt="Connecta Logo"
        style={{
          height: `${height}px`,
          width: 'auto',
          objectFit: 'contain',
          display: 'block'
        }}
      />
    </div>
  );
};
