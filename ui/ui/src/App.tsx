
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import WhatIfAnalysis from './pages/WhatIfAnalysis'
import LogisticControlTower from './pages/LogisticControlTower'
import PortPlanning from './pages/PortPlanning'
import RailwayDispatch from './pages/RailwayDispatch'
import OptimizationEngine from './pages/OptimizationEngine'
import SensitivityAnalysis from './pages/SensitivityAnalysis'
import AnalyticsReports from './pages/AnalyticsReports'
import DataIntegration from './pages/DataIntegration'
import Settings from './pages/Settings'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import { AuthProvider, useAuth } from './context/AuthContext'

function RoleProtectedRoute({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role || 'viewer';

  // Admin bypass
  if (userRole === 'admin') {
    return children;
  }

  if (!allowedRoles.includes('all') && !allowedRoles.includes(userRole)) {
    // Redirect to dashboard or show unauthorized
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/what-if" element={<WhatIfAnalysis />} />
              <Route path="/vessel-scheduling" element={
                <RoleProtectedRoute allowedRoles={['admin', 'corporate_logistics', 'port_manager', 'railway_officer', 'finance']}>
                  <LogisticControlTower />
                </RoleProtectedRoute>
              } />
              <Route path="/port-planning" element={
                <RoleProtectedRoute allowedRoles={['admin', 'corporate_logistics', 'port_manager', 'ai_analyst']}>
                  <PortPlanning />
                </RoleProtectedRoute>
              } />

              <Route path="/railway-dispatch" element={
                <RoleProtectedRoute allowedRoles={['admin', 'corporate_logistics', 'railway_officer', 'port_manager', 'plant_head']}>
                  <RailwayDispatch />
                </RoleProtectedRoute>
              } />

              <Route path="/optimization" element={
                <RoleProtectedRoute allowedRoles={['admin', 'corporate_logistics', 'ai_analyst', 'finance']}>
                  <OptimizationEngine />
                </RoleProtectedRoute>
              } />

              <Route path="/analysis" element={<SensitivityAnalysis />} />
              <Route path="/analytics" element={<AnalyticsReports />} />

              <Route path="/data-integration" element={
                <RoleProtectedRoute allowedRoles={['ai_analyst']}>
                  <DataIntegration />
                </RoleProtectedRoute>
              } />

              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}


function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
