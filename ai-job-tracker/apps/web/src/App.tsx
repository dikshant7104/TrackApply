import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from './stores/auth.store'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { ApplicationsPage } from './pages/dashboard/ApplicationsPage'
import { ResumesPage } from './pages/dashboard/ResumesPage'
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage'
import { ProfilePage } from './pages/dashboard/ProfilePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: 'DM Sans, sans-serif',
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="resumes" element={<ResumesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
