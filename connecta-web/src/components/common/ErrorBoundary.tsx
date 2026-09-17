import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React component tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}>
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-color, rgba(0,0,0,0.1))',
            borderRadius: '24px',
            padding: '36px',
            maxWidth: '520px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <AlertTriangle size={30} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-primary, #111827)' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #6B7280)', lineHeight: 1.6, margin: '0 0 24px' }}>
              We encountered an unexpected error rendering this view. Don't worry, your data and session are safe.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  background: 'var(--primary, #FD6730)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <RefreshCw size={15} /> Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/jobs'}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  background: 'var(--bg-tertiary, #f3f4f6)',
                  color: 'var(--text-primary, #111827)',
                  border: '1px solid var(--border-color, rgba(0,0,0,0.1))',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Home size={15} /> Browse Jobs
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
