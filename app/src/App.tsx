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
import Profile from './pages/profiles/Profile'
import Proposals from './pages/Proposals/Proposals'
import ProjectDashboard from './pages/ProjectDashboard/ProjectDashboard'
import ProjectDetail from './pages/ProjectDashboard/ProjectDetail'
import { EditProfile } from './pages/EditProfile/EditProfile'
import { AddPortfolio } from './pages/AddPortfolio/AddPortfolio'
import { Messages } from './pages/Messages/Messages'
import Chats from './pages/Chats/Chats'
import ConnectaAI from './pages/ConnectaAI/ConnectaAI'

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
          <Route path='/profile' element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path='/edit-profile' element={
            <ProtectedRoute>
              <EditProfile />
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
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
