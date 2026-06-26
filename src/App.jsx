import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import { Navbar } from './components/UI/Navbar'
import { PawLoader } from './components/UI/PawLoader'
import { ErrorBoundary } from './components/UI/ErrorBoundary'

const Auth = React.lazy(() => import('./pages/Auth'))
const ColonyDetail = React.lazy(() => import('./pages/ColonyDetail'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Volunteers = React.lazy(() => import('./pages/Volunteers'))
const RecoveryPage = React.lazy(() => import('./pages/RecoveryPage'))
const AdoptionPage = React.lazy(() => import('./pages/AdoptionPage'))
const MatchmakerPage = React.lazy(() => import('./pages/MatchmakerPage'))
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
      <Route path="/auth" element={
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><PawLoader /></div>}>
            {user ? <Navigate to="/" replace /> : <Auth />}
          </Suspense>
        </ErrorBoundary>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex-1 overflow-hidden">
              <ErrorBoundary>
                <Suspense fallback={<div className="h-full flex items-center justify-center"><PawLoader /></div>}>
                  <MapPage />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/colony/:id" element={
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 overflow-y-auto">
              <ErrorBoundary>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><PawLoader /></div>}>
                  <ColonyDetail />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 overflow-y-auto">
              <ErrorBoundary>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><PawLoader /></div>}>
                  <Dashboard />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/recovery" element={
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 overflow-y-auto">
              <ErrorBoundary>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><PawLoader /></div>}>
                  <RecoveryPage />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/adoption" element={
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 overflow-y-auto">
              <ErrorBoundary>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><PawLoader /></div>}>
                  <AdoptionPage />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/matchmaker" element={
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 overflow-y-auto">
              <ErrorBoundary>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><PawLoader /></div>}>
                  <MatchmakerPage />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/network" element={
        <AdminRoute>
          <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex-1 overflow-hidden">
              <ErrorBoundary>
                <Suspense fallback={<div className="h-full flex items-center justify-center"><PawLoader /></div>}>
                  <NetworkGraph />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </AdminRoute>
      } />
      <Route path="/volunteers" element={
        <AdminRoute>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 overflow-y-auto">
              <ErrorBoundary>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><PawLoader /></div>}>
                  <Volunteers />
                </Suspense>
              </ErrorBoundary>
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
