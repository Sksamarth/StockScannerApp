import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Bell, Code2, Settings, ScanLine } from 'lucide-react'
import { useScanner } from '../context/ScannerContext'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scanner', icon: ScanLine, label: 'Scanner' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/strategies', icon: Code2, label: 'Strategies' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { status, alerts } = useScanner()

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📈</span>
          <span className="text-white font-bold text-lg">StockScanner</span>
        </div>
        <div className={`mt-2 text-xs flex items-center gap-1 ${status === 'running' ? 'text-green-400' : status === 'paused' ? 'text-yellow-400' : 'text-gray-600'}`}>
          <span className={`w-2 h-2 rounded-full ${status === 'running' ? 'bg-green-400 animate-pulse' : status === 'paused' ? 'bg-yellow-400' : 'bg-gray-600'}`} />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
            {label === 'Alerts' && alerts.length > 0 && (
              <span className="ml-auto bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">{alerts.length}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
