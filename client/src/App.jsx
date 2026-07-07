import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
// import Workout from './pages/Workout'
// import History from './pages/History'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/setup" element={<Setup />} />
        {/* <Route path="/workout" element={<Workout />} /> */}
        {/* <Route path="/history" element={<History />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App