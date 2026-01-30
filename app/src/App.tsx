import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/landing_page/LandingPage';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import Security from './pages/legal/Security';
import Careers from './pages/company/Careers';
import About from './pages/company/About';
import Contact from './pages/company/Contact';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page - Main Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Legal & Company Pages */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/security" element={<Security />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Redirect all other paths to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
