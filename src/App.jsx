import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Splash from './pages/Splash'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Pickups from './pages/Pickups'
import RequestPickup from './pages/RequestPickup'
import Rewards from './pages/Rewards'
import Impact from './pages/Impact'
import Leaderboard from './pages/Leaderboard'
import Challenges from './pages/Challenges'
import Announcements from './pages/Announcements'
import Feedback from './pages/Feedback'
import Help from './pages/Help'
import AppShell from './components/AppShell'

// Map / QR heavy pages — lazy loaded to keep the main bundle small
const TrackPickup = lazy(() => import('./pages/TrackPickup'))
const Facilities = lazy(() => import('./pages/Facilities'))
const CollectorDashboard = lazy(() => import('./pages/collector/CollectorDashboard'))
const CollectorPickup = lazy(() => import('./pages/collector/CollectorPickup'))
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'))

function PageSpinner() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-eco-200 border-t-eco-600" />
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-eco-200 border-t-eco-600" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Main app (behind auth, with bottom nav) */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/pickups" element={<Pickups />} />
          <Route path="/pickups/new" element={<RequestPickup />} />
          <Route path="/pickups/:id" element={<TrackPickup />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/help" element={<Help />} />
        </Route>

        {/* Collection partner portal (no user bottom-nav shell) */}
        <Route
          path="/collector"
          element={
            <ProtectedRoute>
              <CollectorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collector/pickups/:id"
          element={
            <ProtectedRoute>
              <CollectorPickup />
            </ProtectedRoute>
          }
        />

        {/* Admin panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </AuthProvider>
  )
}

export default App
