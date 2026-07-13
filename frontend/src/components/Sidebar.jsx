import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Bell, Code2, Settings, ScanLine, History } from 'lucide-react'
import { useScanner } from '../context/ScannerContext'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scanner', icon: ScanLine, label: 'Scanner' },
  { to: '/alerts', icon: Bell, label: 'Live Alerts' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/strategies', icon: Code2, label: 'Strategies' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { status, alerts } = useScanner()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar w-60 flex-shrink-0 flex flex-col h-screen sticky top-0 border-r border-white/5" style={{ background: '#0d0d18' }}>
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>📈</div>
            <div>
              <div className="text-white font-bold text-base leading-tight">StockScanner</div>
              <div className="text-xs text-gray-500">NSE / BSE Live</div>
            </div>
          </div>
          {/* Scanner status */}
          <div className="mt-3 flex items-center gap-2">
            <div className={`pulse-dot ${status === 'running' ? 'bg-green-400' : status === 'paused' ? 'bg-yellow-400' : 'bg-gray-600'}`} />
            <span className={`text-xs font-medium ${status === 'running' ? 'text-green-400' : status === 'paused' ? 'text-yellow-400' : 'text-gray-600'}`}>
              Scanner {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={17} />
              <span>{label}</span>
              {label === 'Live Alerts' && alerts.length > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
                  {alerts.length > 99 ? '99+' : alerts.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 text-xs text-gray-700 text-center">v1.0.0 · StockScanner</div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 px-2 py-2" style={{ background: '#0d0d18' }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `flex flex-col items-center gap-1 flex-1 py-1 rounded-lg text-xs transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-600'}`
          }>
            <Icon size={20} />
            <span className="text-[10px]">{label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
