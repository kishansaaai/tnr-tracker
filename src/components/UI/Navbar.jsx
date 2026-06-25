import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useNotifications } from '../../hooks/useNotifications'
import { NotificationDropdown } from './NotificationDropdown'

export function Navbar() {
  const { profile, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const { notifications, unreadCount, enabled, toggleNotifications, markAllRead, clearAll } = useNotifications()

  const links = [
    { to: '/', label: 'Map', icon: '🗺️' },
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/recovery', label: 'Recovery', icon: '🏥' },
    { to: '/adoption', label: 'Adoption', icon: '🏠' },
    { to: '/matchmaker', label: 'Matchmaker', icon: '💘' },
    { to: '/network', label: 'Network', icon: '🕸️' },
    ...(isAdmin ? [{ to: '/volunteers', label: 'Volunteers', icon: '👥' }] : []),
  ]

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm z-10 relative">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-green-800 text-lg hover:text-green-700 transition-colors">
          <span className="w-8 h-8 rounded-lg bg-green-700 text-white text-xs flex items-center justify-center">TNR</span>
          <span className="hidden sm:inline">TNR Tracker</span>
        </Link>

        <div className="flex items-center gap-0.5">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1 px-2 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'bg-green-50 text-green-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="hidden lg:inline">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            enabled={enabled}
            onToggle={toggleNotifications}
            onMarkAllRead={markAllRead}
            onClearAll={clearAll}
          />
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs font-bold">
              {profile?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="font-medium">{profile?.name || 'User'}</span>
            {isAdmin && (
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Admin</span>
            )}
          </div>
          <button
            onClick={signOut}
            className="text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
