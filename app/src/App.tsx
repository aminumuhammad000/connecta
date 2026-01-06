import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/landing_page/LandingPage'

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page - Main Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Redirect all other paths to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
