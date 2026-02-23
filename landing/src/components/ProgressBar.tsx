import React from 'react';
import styles from './ProgressBar.module.css';

type Props = {
  value: number; // 0-100
  className?: string;
  height?: number;
  color?: string;
};

const ProgressBar: React.FC<Props> = ({ value, className = '', height = 10, color }) => {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const fillStyle: React.CSSProperties = {
    width: `${pct}%`,
    height: `${height}px`,
    backgroundColor: color || 'var(--color-primary, #FD6730)'
  };

  return (
    <div className={`${styles.container} ${className}`} style={{ height }}>
      <div className={styles.fill} style={fillStyle} data-value={pct} />
    </div>
  );
};

export default ProgressBar;
