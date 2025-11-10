import ClientChat from './pages/client/ClientChatReal';
import CreateJob from './pages/client/CreateJob'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPAge from './pages/landing_page/LandingPage'
import Waitlist from './pages/Waitlist/Waitlist'
import Auth from './pages/Auth/Auth'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import Dashboard from './pages//Dashboard/Dashboard'
import JobDetail from './pages/JobDetail/JobDetail'
import FProfiles from './pages/profiles/Profile';
import Proposals from './pages/Proposals/Proposals'
import ProjectDashboard from './pages/ProjectDashboard/ProjectDashboard'
import ProjectDetail from './pages/ProjectDashboard/ProjectDetail'
import { EditProfile } from './pages/EditProfile/EditProfile'
import { AddPortfolio } from './pages/AddPortfolio/AddPortfolio'
import { Messages } from './pages/Messages/Messages'
import Chats from './pages/Chats/Chats'
import CompleteProfile from './pages/CompleteProfile/CompleteProfile'
import ConnectaAI from './pages/ConnectaAI/ConnectaAI'
import ClientDashboard from './pages/client/ClientDashboard'
import ClientProjects from './pages/client/ClientProjects'
import Profile from './pages/client/Profile/Profile';
import FreelancerWallet from './pages/Payments/FreelancerWallet';
import ClientWallet from './pages/Payments/ClientWallet';
import PaymentPage from './pages/Payments/PaymentPage';
import PaymentCallback from './pages/Payments/PaymentCallback';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ==================== AUTH ROUTES (Public) ==================== */}
          <Route path="/" element={<Waitlist />} />
          <Route path="/landing" element={<LandingPAge />} />
          <Route path='/auth' element={<Auth />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          
          {/* ==================== END AUTH ROUTES ==================== */}
          
          {/* Job detail route (legacy) - redirects to freelancer job detail */}
          <Route path="/job/:jobId" element={
            <ProtectedRoute>
              <JobDetail />
            </ProtectedRoute>
          } />          
          
          {/* Catch-all route for unmatched paths */}
          <Route path="*" element={
            <Navigate to="/freelancer/dashboard" replace />
          } />

          {/* ==================== FREELANCER ROUTES ==================== */}
          <Route path='/freelancer/dashboard' element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/job/:jobId' element={
            <ProtectedRoute>
              <JobDetail />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/profile' element={
            <ProtectedRoute>
              <FProfiles />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/edit-profile' element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/complete-profile' element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/add-portfolio' element={
            <ProtectedRoute>
              <AddPortfolio />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/proposals' element={
            <ProtectedRoute>
              <Proposals />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/projects' element={
            <ProtectedRoute>
              <ProjectDashboard />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/project/:projectId' element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/messages' element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          {/* ==================== FREELANCER ROUTES ==================== */}
          <Route path='/freelancer/dashboard' element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/job/:jobId' element={
            <ProtectedRoute>
              <JobDetail />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/profile' element={
            <ProtectedRoute>
              <FProfiles />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/edit-profile' element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/complete-profile' element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/add-portfolio' element={
            <ProtectedRoute>
              <AddPortfolio />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/proposals' element={
            <ProtectedRoute>
              <Proposals />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/projects' element={
            <ProtectedRoute>
              <ProjectDashboard />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/project/:projectId' element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/messages' element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/chats' element={
            <ProtectedRoute>
              <Chats />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/ai' element={
            <ProtectedRoute>
              <ConnectaAI />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/wallet' element={
            <ProtectedRoute>
              <FreelancerWallet />
            </ProtectedRoute>
          } />
          {/* ==================== END FREELANCER ROUTES ==================== */}

          {/* ==================== CLIENT ROUTES ==================== */}
          <Route path='/client/dashboard' element={
            <ProtectedRoute>
              <div className="client-projects-bg">
                <ClientDashboard />
              </div>
            </ProtectedRoute>
          } />
          <Route path='/client/projects' element={
            <ProtectedRoute>
              <div className="client-projects-bg">
                <ClientProjects />
              </div>
            </ProtectedRoute>
          } />
          <Route path='/client/create-job' element={
            <ProtectedRoute>
              <div className="client-projects-bg">
                <CreateJob />
              </div>
            </ProtectedRoute>
          } />
          <Route path='/client/chats' element={
            <ProtectedRoute>
              <div className="client-projects-bg">
                <ClientChat />
              </div>
            </ProtectedRoute>
          } />
          <Route path='/client/profile' element={
            <ProtectedRoute>
              <div className="client-projects-bg">
                <Profile />
              </div>
            </ProtectedRoute>
          } />
          <Route path='/client/messages' element={
            <ProtectedRoute>
              <ClientChat />
            </ProtectedRoute>
          } />
          <Route path='/client/ai' element={
            <ProtectedRoute>
              <div className="client-projects-bg">
                <ConnectaAI />
              </div>
            </ProtectedRoute>
          } />
          <Route path='/client/wallet' element={
            <ProtectedRoute>
              <div className="client-projects-bg">
                <ClientWallet />
              </div>
            </ProtectedRoute>
          } />
          {/* ==================== END CLIENT ROUTES ==================== */}

          {/* ==================== PAYMENT ROUTES ==================== */}
          <Route path='/payment' element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } />
          <Route path='/payment/callback' element={
            <ProtectedRoute>
              <PaymentCallback />
            </ProtectedRoute>
          } />
          {/* ==================== END PAYMENT ROUTES ==================== */}
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
