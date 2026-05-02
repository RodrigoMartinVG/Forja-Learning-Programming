import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

const Landing = lazy(() => import('./components/Landing'))
const Workspace = lazy(() => import('./components/Workspace'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Suspense fallback={null}><Landing /></Suspense>} />
        <Route path="/workspace" element={<Suspense fallback={null}><Workspace /></Suspense>} />
        <Route path="/workspace/:contentType/:contentId" element={<Suspense fallback={null}><Workspace /></Suspense>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
