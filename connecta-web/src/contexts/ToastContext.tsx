import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (title: string, type?: ToastType, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/* ── Per-toast config ── */
const TOAST_CONFIG: Record<ToastType, {
  icon: React.ReactNode;
  accent: string;
  bg: string;
  iconBg: string;
  label: string;
}> = {
  success: {
    icon: <CheckCircle2 size={18} strokeWidth={2.5} />,
    accent: '#10B981',
    bg: 'rgba(16,185,129,0.08)',
    iconBg: 'rgba(16,185,129,0.15)',
    label: 'Success',
  },
  error: {
    icon: <AlertCircle size={18} strokeWidth={2.5} />,
    accent: '#EF4444',
    bg: 'rgba(239,68,68,0.08)',
    iconBg: 'rgba(239,68,68,0.15)',
    label: 'Error',
  },
  warning: {
    icon: <AlertTriangle size={18} strokeWidth={2.5} />,
    accent: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    iconBg: 'rgba(245,158,11,0.15)',
    label: 'Warning',
  },
  info: {
    icon: <Info size={18} strokeWidth={2.5} />,
    accent: '#FD6730',
    bg: 'rgba(253,103,48,0.08)',
    iconBg: 'rgba(253,103,48,0.15)',
    label: 'Info',
  },
};

const DURATION = 4500;

/* ── Single Toast Item ── */
const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const cfg = TOAST_CONFIG[toast.type];
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setElapsed((e) => e + 50);
    }, 50);
    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    if (elapsed >= DURATION) {
      onDismiss(toast.id);
    }
  }, [elapsed, toast.id, onDismiss]);

  const progress = Math.min((elapsed / DURATION) * 100, 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -60, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.9, transition: { duration: 0.2, ease: 'easeIn' } }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: 'relative',
        pointerEvents: 'auto',
        background: `linear-gradient(135deg, ${cfg.bg} 0%, rgba(255,255,255,0.95) 100%)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${cfg.accent}28`,
        borderRadius: '16px',
        padding: '14px 16px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        boxShadow: `0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px ${cfg.accent}20, inset 0 1px 0 rgba(255,255,255,0.6)`,
        overflow: 'hidden',
        cursor: 'default',
        minWidth: '300px',
        maxWidth: '380px',
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        background: cfg.accent,
        borderRadius: '16px 0 0 16px',
      }} />

      {/* Icon */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: cfg.iconBg,
        color: cfg.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginLeft: '6px',
      }}>
        {cfg.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
        <div style={{
          fontWeight: 700,
          fontSize: '0.875rem',
          color: '#111827',
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
        }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{
            fontSize: '0.8rem',
            color: '#6B7280',
            marginTop: '3px',
            lineHeight: 1.4,
            fontWeight: 400,
          }}>
            {toast.message}
          </div>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'rgba(0,0,0,0.05)',
          border: 'none',
          borderRadius: '8px',
          color: '#9CA3AF',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.1)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'rgba(0,0,0,0.06)',
        borderRadius: '0 0 16px 16px',
      }}>
        <motion.div
          style={{
            height: '100%',
            background: cfg.accent,
            borderRadius: '0 0 16px 16px',
            transformOrigin: 'left',
          }}
          animate={{ width: `${100 - progress}%` }}
          transition={{ duration: 0.05, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
};

/* ── Provider ── */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, type: ToastType = 'info', message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const success = useCallback((title: string, message?: string) => showToast(title, 'success', message), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast(title, 'error', message), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast(title, 'info', message), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast(title, 'warning', message), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}

      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        pointerEvents: 'none',
        width: 'max-content',
        maxWidth: 'calc(100vw - 32px)',
      }}>
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
