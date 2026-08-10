import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { RoleProvider } from './contexts/RoleContext';
import { ToastProvider } from './contexts/ToastContext';

// Pages
import { LandingPage } from './pages/auth/LandingPage';
import { OnboardingScreen } from './pages/auth/OnboardingScreen';
import { RoleSelectionPage } from './pages/auth/RoleSelectionPage';
import { SignupPage } from './pages/auth/SignupPage';
import { SignupPasswordPage } from './pages/auth/SignupPasswordPage';
import { SkillSelectionPage } from './pages/auth/SkillSelectionPage';
import { FreelancerProfileSetupPage } from './pages/auth/FreelancerProfileSetupPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ClientDashboardPage } from './pages/dashboard/ClientDashboardPage';
import { FreelancerDashboardPage } from './pages/dashboard/FreelancerDashboardPage';
import { JobDetailsPage } from './pages/dashboard/JobDetailsPage';
import { FindJobsPage } from './pages/dashboard/FindJobsPage';
import { MyProposalsPage } from './pages/dashboard/MyProposalsPage';
import { MessagesPage } from './pages/dashboard/MessagesPage';
import { MyWalletPage } from './pages/dashboard/MyWalletPage';
import { SavedGigsPage } from './pages/dashboard/SavedGigsPage';
import { MyProfilePage } from './pages/dashboard/MyProfilePage';
import { HelpSupportPage } from './pages/dashboard/HelpSupportPage';
import { AiAssistantPage } from './pages/dashboard/AiAssistantPage';
import { FeedPage } from './pages/dashboard/FeedPage';
import { ClientProjectsPage } from './pages/dashboard/ClientProjectsPage';
import { HiredTalentPage } from './pages/dashboard/HiredTalentPage';
import { PostJobPage } from './pages/dashboard/PostJobPage';
import { ProposalDetailsPage } from './pages/dashboard/ProposalDetailsPage';
import { ClientWriteReviewPage } from './pages/dashboard/ClientWriteReviewPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RoleProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {/* Default Onboarding & Landing */}
                <Route path="/" element={<OnboardingScreen />} />
                <Route path="/landing" element={<LandingPage />} />
                
                {/* Onboarding & Auth */}
                <Route path="/register/role" element={<RoleSelectionPage />} />
                <Route path="/register" element={<SignupPage />} />
                <Route path="/register/password" element={<SignupPasswordPage />} />
                <Route path="/register/skills" element={<SkillSelectionPage />} />
                <Route path="/register/profile-setup" element={<FreelancerProfileSetupPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Dashboards & Jobs */}
                <Route path="/client/dashboard" element={<ClientDashboardPage />} />
                <Route path="/freelancer/dashboard" element={<FreelancerDashboardPage />} />
                <Route path="/client/projects" element={<ClientProjectsPage />} />
                <Route path="/client/talent" element={<HiredTalentPage />} />
                <Route path="/client/reviews/new" element={<ClientWriteReviewPage />} />
                <Route path="/jobs" element={<FindJobsPage />} />
                <Route path="/jobs/new" element={<PostJobPage />} />
                <Route path="/jobs/:id" element={<JobDetailsPage />} />

                {/* Navigation Items */}
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/ai-assistant" element={<AiAssistantPage />} />
                <Route path="/proposals" element={<MyProposalsPage />} />
                <Route path="/proposals/:id" element={<ProposalDetailsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/wallet" element={<MyWalletPage />} />
                <Route path="/saved-gigs" element={<SavedGigsPage />} />
                <Route path="/settings" element={<MyProfilePage />} />
                <Route path="/support" element={<HelpSupportPage />} />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
