import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = '8px',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`skeleton-box ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--bg-tertiary) 25%, var(--border-color) 50%, var(--bg-tertiary) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.5s infinite linear',
        ...style,
      }}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '20px',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Skeleton width="46px" height="46px" borderRadius="50%" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Skeleton width="40%" height="14px" />
          <Skeleton width="25%" height="10px" />
        </div>
      </div>
      <Skeleton width="100%" height="70px" borderRadius="14px" />
      <div style={{ display: 'flex', gap: '10px' }}>
        <Skeleton width="80px" height="28px" borderRadius="20px" />
        <Skeleton width="80px" height="28px" borderRadius="20px" />
        <Skeleton width="80px" height="28px" borderRadius="20px" />
      </div>
    </div>
  );
};

export const MinimalistLoader: React.FC<{ loading?: boolean }> = ({ loading = true }) => {
  if (!loading) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 9999,
        background: 'rgba(253,103,48,0.15)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          background: 'var(--grad-primary)',
          boxShadow: '0 0 10px var(--primary)',
          animation: 'topProgress 1.6s infinite ease-in-out',
        }}
      />
    </div>
  );
};
