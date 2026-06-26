import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import { Navbar } from './components/UI/Navbar'
import { PawLoader } from './components/UI/PawLoader'
import Auth from './pages/Auth'
import ColonyDetail from './pages/ColonyDetail'
import Dashboard from './pages/Dashboard'
import Volunteers from './pages/Volunteers'
import RecoveryPage from './pages/RecoveryPage'
import AdoptionPage from './pages/AdoptionPage'
import MatchmakerPage from './pages/MatchmakerPage'

const MapPage = React.lazy(() => import('./pages/MapPage'))
const NetworkGraph = React.lazy(() => import('./pages/NetworkGraph'))

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <PawLoader />
      </div>
    )
  }
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function AdminRoute({ children }) {
  const { isAdmin, loading, user } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <PawLoader />
      </div>
    )
  }
  if (!user) return <Navigate to="/auth" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route path="/" element={
        <ProtectedRoute>
          <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex-1 overflow-hidden">
              <Suspense fallback={<div className="h-full flex items-center justify-center"><PawLoader /></div>}>
                <MapPage />
              </Suspense>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/colony/:id" element={
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 overflow-y-auto">
              <ColonyDetail />
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 overflow-y-auto">
              <Dashboard />
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/recovery" element={
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 overflow-y-auto">
              <RecoveryPage />
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/adoption" element={
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 overflow-y-auto">
              <AdoptionPage />
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/matchmaker" element={
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 overflow-y-auto">
              <MatchmakerPage />
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/network" element={
        <AdminRoute>
          <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex-1 overflow-hidden">
              <Suspense fallback={<div className="h-full flex items-center justify-center"><PawLoader /></div>}>
                <NetworkGraph />
              </Suspense>
            </div>
          </div>
        </AdminRoute>
      } />
      <Route path="/volunteers" element={
        <AdminRoute>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 overflow-y-auto">
              <Volunteers />
            </div>
          </div>
        </AdminRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: '#fff',
              color: '#374151',
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#16a34a', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
