import React from 'react';
import { ShieldCheck, Award } from 'lucide-react';

export interface VerifiedBadgeProps {
  tier?: 'community' | 'vetted_pro' | 'top_1_percent' | string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ tier = 'community', showText = true, size = 'md' }) => {
  if (!tier || tier === 'community') return null;

  const isTop1 = tier === 'top_1_percent';

  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
  const fontSize = size === 'sm' ? '0.72rem' : size === 'lg' ? '0.85rem' : '0.78rem';
  const padding = size === 'sm' ? '2px 6px' : size === 'lg' ? '4px 10px' : '3px 8px';

  const bg = isTop1 
    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)';

  const border = isTop1 ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)';
  const color = isTop1 ? '#D97706' : '#10B981';

  const label = isTop1 ? 'Top 1% Enterprise ⭐' : 'Vetted Pro ✓';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: bg,
        border: border,
        color: color,
        borderRadius: 'var(--radius-full)',
        padding: padding,
        fontSize: fontSize,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        boxShadow: isTop1 ? '0 2px 8px rgba(245, 158, 11, 0.15)' : '0 2px 8px rgba(16, 185, 129, 0.15)'
      }}
      title={isTop1 ? 'Connecta Top 1% Senior Expert' : 'Connecta Verified Pro Talent'}
    >
      {isTop1 ? <Award size={iconSize} /> : <ShieldCheck size={iconSize} />}
      {showText && <span>{label}</span>}
    </span>
  );
};
