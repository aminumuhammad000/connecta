import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Layout } from './components/layout/Layout';
import { WorkerLoginPage } from './pages/WorkerLoginPage';
import { WorkerSignupPage } from './pages/WorkerSignupPage';
import { EmployerLoginPage } from './pages/EmployerLoginPage';
import { OnboardingWizard } from './pages/OnboardingWizard';
import { DashboardPage } from './pages/DashboardPage';
import { WorkforcePage } from './pages/WorkforcePage';
import { WorkerProfilePage } from './pages/WorkerProfilePage';
import { JobsPage } from './pages/JobsPage';
import { JobApplicantsPage } from './pages/JobApplicantsPage';
import { AttendancePage } from './pages/AttendancePage';
import { PaymentsPage } from './pages/PaymentsPage';
import { WorkerPaymentHistoryPage } from './pages/WorkerPaymentHistoryPage';
import { ContractsPage } from './pages/ContractsPage';
import { MessagesPage } from './pages/MessagesPage';
import { SettingsPage } from './pages/SettingsPage';
import { WorkerHomePage } from './pages/worker/WorkerHomePage';
import { WorkerJobsPage } from './pages/worker/WorkerJobsPage';
import { WorkerAttendancePage } from './pages/worker/WorkerAttendancePage';
import { WorkerPaymentsPage } from './pages/worker/WorkerPaymentsPage';
import { WorkerContractsPage } from './pages/worker/WorkerContractsPage';
import { WorkerProfilePage as WorkerSelfProfilePage } from './pages/worker/WorkerProfilePage';
import { WorkerWalletPage } from './pages/worker/WorkerWalletPage';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode; raw?: boolean }> = ({ children, raw }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (raw) {
    return <>{children}</>;
  }

  return <Layout>{children}</Layout>;
};

const DefaultPublicOrHome: React.FC<{ component: React.ReactComponentElement<any> }> = ({ component }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.userType === 'freelancer') {
      return <Navigate to="/workforce/me" replace />;
    }
    return <Navigate to="/employer/dashboard" replace />;
  }

  return component;
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Entry Points */}
            <Route path="/" element={<DefaultPublicOrHome component={<WorkerLoginPage />} />} />
            <Route path="/login" element={<DefaultPublicOrHome component={<WorkerLoginPage />} />} />
            <Route path="/signup" element={<DefaultPublicOrHome component={<WorkerSignupPage />} />} />
            
            {/* Hidden Employer Login */}
            <Route path="/employer/login" element={<DefaultPublicOrHome component={<EmployerLoginPage />} />} />

            <Route path="/onboarding" element={<OnboardingWizard />} />

            {/* Employer Workforce Routes (Full Screen Light UI) */}
            <Route path="/employer/dashboard" element={<ProtectedRoute raw><DashboardPage /></ProtectedRoute>} />
            <Route path="/employer/workforce" element={<ProtectedRoute raw><WorkforcePage /></ProtectedRoute>} />
            <Route path="/employer/workforce/:workerId" element={<ProtectedRoute raw><WorkerProfilePage /></ProtectedRoute>} />
            <Route path="/employer/jobs" element={<ProtectedRoute raw><JobsPage /></ProtectedRoute>} />
            <Route path="/employer/jobs/:jobId/applicants" element={<ProtectedRoute raw><JobApplicantsPage /></ProtectedRoute>} />
            <Route path="/employer/payments" element={<ProtectedRoute raw><PaymentsPage /></ProtectedRoute>} />
            <Route path="/employer/payments/worker/:workerId" element={<ProtectedRoute raw><WorkerPaymentHistoryPage /></ProtectedRoute>} />
            <Route path="/employer/settings" element={<ProtectedRoute raw><SettingsPage /></ProtectedRoute>} />

            {/* Legacy URL Redirects */}
            <Route path="/dashboard" element={<Navigate to="/employer/dashboard" replace />} />
            <Route path="/workforce" element={<Navigate to="/employer/workforce" replace />} />
            <Route path="/jobs" element={<Navigate to="/employer/jobs" replace />} />
            <Route path="/payments" element={<Navigate to="/employer/payments" replace />} />
            <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            {/* Worker Experience Routes */}
            <Route path="/workforce/me" element={<ProtectedRoute raw><WorkerHomePage /></ProtectedRoute>} />
            <Route path="/workforce/me/jobs" element={<ProtectedRoute raw><WorkerJobsPage /></ProtectedRoute>} />
            <Route path="/workforce/me/attendance" element={<ProtectedRoute raw><WorkerAttendancePage /></ProtectedRoute>} />
            <Route path="/workforce/me/payments" element={<ProtectedRoute raw><WorkerPaymentsPage /></ProtectedRoute>} />
            <Route path="/workforce/me/contracts" element={<ProtectedRoute raw><WorkerContractsPage /></ProtectedRoute>} />
            <Route path="/workforce/me/wallet" element={<ProtectedRoute raw><WorkerWalletPage /></ProtectedRoute>} />
            <Route path="/workforce/me/profile" element={<ProtectedRoute raw><WorkerSelfProfilePage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<DefaultPublicOrHome component={<WorkerLoginPage />} />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
