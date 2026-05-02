import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './components/Landing'
import Workspace from './components/Workspace'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/workspace/:contentType/:contentId" element={<Workspace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
