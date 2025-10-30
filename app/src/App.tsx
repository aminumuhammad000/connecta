import ClientChat from './pages/client/ClientChat';
import CreateJob from './pages/client/CreateJob'
import './App.css'
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPAge from './pages/landing_page/LandingPage'
import Auth from './pages/Auth/Auth'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import Dashboard from './pages/Dashboard/Dashboard'
import JobDetail from './pages/JobDetail/JobDetail'
import Profile from './pages/client/Profile/Profile';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPAge />} />
          <Route path='/auth' element={<Auth />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          
          {/* Protected Routes */}
          <Route path='/dashboard' element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path='/job/:jobId' element={
            <ProtectedRoute>
              <JobDetail />
            </ProtectedRoute>
          } />
          <Route path='/freelancer/profile' element={
            <ProtectedRoute>
              <FProfiles />
            </ProtectedRoute>
          } />
          <Route path='/edit-profile' element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path='/complete-profile' element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          } />
          <Route path='/add-portfolio' element={
            <ProtectedRoute>
              <AddPortfolio />
            </ProtectedRoute>
          } />
          <Route path='/message' element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path='/messages' element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path='/chats' element={
            <ProtectedRoute>
              <Chats />
            </ProtectedRoute>
          } />
          <Route path='/proposals' element={
            <ProtectedRoute>
              <Proposals />
            </ProtectedRoute>
          } />
          <Route path='/project-dashboard' element={
            <ProtectedRoute>
              <ProjectDashboard />
            </ProtectedRoute>
          } />
          <Route path='/project/:projectId' element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } />
          <Route path='/connecta-ai' element={
            <ProtectedRoute>
              <ConnectaAI />
            </ProtectedRoute>
          } />
          <Route path='/client-dashboard' element={
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
                  <Route path='/client-chats' element={
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
          <Route path='/client/create-job' element={
            <ProtectedRoute>
              <div className="client-projects-bg">
                <CreateJob />
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
