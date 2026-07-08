import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
import Workout from './pages/Workout'
// import History from './pages/History'
import SkillPicker from './pages/SkillPicker'
import Nav from './components/Nav'

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/skills" element={<SkillPicker />} />
        <Route path="/workout" element={<Workout />} />
        {/* <Route path="/history" element={<History />} /> */}
      </Routes>
    </BrowserRouter >
  )
}

export default App