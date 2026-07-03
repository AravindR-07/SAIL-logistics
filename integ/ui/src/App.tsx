import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Monitoring from './pages/Monitoring'
import VesselScheduling from './pages/VesselScheduling'
import PortPlanning from './pages/PortPlanning'
import RailwayDispatch from './pages/RailwayDispatch'
import OptimizationEngine from './pages/OptimizationEngine'
import SensitivityAnalysis from './pages/SensitivityAnalysis'
import AnalyticsReports from './pages/AnalyticsReports'
import DataIntegration from './pages/DataIntegration'
import Settings from './pages/Settings'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/vessel-scheduling" element={<VesselScheduling />} />
              <Route path="/port-planning" element={<PortPlanning />} />
              <Route path="/railway-dispatch" element={<RailwayDispatch />} />
              <Route path="/optimization" element={<OptimizationEngine />} />
              <Route path="/analysis" element={<SensitivityAnalysis />} />
              <Route path="/analytics" element={<AnalyticsReports />} />
              <Route path="/data-integration" element={<DataIntegration />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

export default App

