import React, { createContext, useContext, useState, useCallback } from 'react';

interface NotificationContextType {
  showLoader: () => void;
  hideLoader: () => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showLoader = useCallback(() => {
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
  }, []);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 4000);
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 4000);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ showLoader, hideLoader, showSuccess, showError, isLoading }}
    >
      {children}

      {/* Global Loader */}
      {isLoading && (
        <div className="global-loader-overlay">
          <div className="global-loader">
            <div className="loader-spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="notification notification-success">
          <div className="notification-icon">✓</div>
          <p>{successMessage}</p>
          <button className="notification-close" onClick={() => setSuccessMessage(null)}>
            ×
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="notification notification-error">
          <div className="notification-icon">✕</div>
          <p>{errorMessage}</p>
          <button className="notification-close" onClick={() => setErrorMessage(null)}>
            ×
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
