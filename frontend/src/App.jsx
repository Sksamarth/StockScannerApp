import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ScannerProvider } from './context/ScannerContext'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Scanner from './pages/Scanner'
import Alerts from './pages/Alerts'
import AlertHistory from './pages/AlertHistory'
import StrategyManager from './pages/StrategyManager'
import Settings from './pages/Settings'
import Debug from './pages/Debug'
import ErrorBoundary from './components/ErrorBoundary'

function AppLayout() {
  const { upstoxSession } = useAuth()
  if (!upstoxSession) return <Login />

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/history" element={<AlertHistory />} />
          <Route path="/strategies" element={<StrategyManager />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/debug" element={<Debug />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <ScannerProvider>
            <AppLayout />
            <Toaster
              position="top-right"
              toastOptions={{ style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' } }}
            />
          </ScannerProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
