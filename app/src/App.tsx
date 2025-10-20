import './App.css'
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom'
import LandingPAge from './pages/landing_page/LandingPage'
import Auth from './pages/Auth/Auth'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import Dashboard from './pages/Dashboard/Dashboard'
import JobDetail from './pages/JobDetail/JobDetail'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPAge />} />
        <Route path='/auth' element={<Auth />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/job/:jobId' element={<JobDetail />} />
      </Routes>
    </Router>
  )
}

export default App
