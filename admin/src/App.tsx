import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import Proposals from './pages/Proposals'
import Projects from './pages/Projects'
import Payments from './pages/Payments'
import Notifications from './pages/Notifications'
import Reviews from './pages/Reviews'
import Contracts from './pages/Contracts'
import GigApplications from './pages/GigApplications'
import Analytics from './pages/Analytics'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/proposals" element={<Proposals />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/contracts" element={<Contracts />} />
      <Route path="/applications" element={<GigApplications />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
