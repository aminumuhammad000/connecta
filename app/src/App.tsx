import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import LandingPAge from './pages/landing_page/LandingPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPAge />} />
      </Routes>
    </Router>
  )
}

export default App
