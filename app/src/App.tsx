import './App.css'
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom'
import LandingPAge from './pages/landing_page/LandingPage'
import Auth from './pages/Auth/Auth'
import Login from './pages/Auth/Login'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPAge />} />
        <Route path='/Auth' element={<Auth />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
