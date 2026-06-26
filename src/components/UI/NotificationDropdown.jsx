import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

export function NotificationDropdown({ notifications, unreadCount, enabled, onToggle, onMarkAllRead, onClearAll }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const typeIcons = {
    trap_captured: '🪤',
    new_colony: '📍',
    cat_released: '🎉',
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open) onMarkAllRead() }}
        aria-label="View notifications"
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold min-w-[18px] px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={onToggle}
                aria-label={enabled ? "Disable notifications" : "Enable notifications"}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {enabled ? '🔔 On' : '🔕 Off'}
              </button>
              {notifications.length > 0 && (
                <button onClick={onClearAll} className="text-xs text-gray-400 hover:text-gray-600">
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <div className="text-2xl mb-2">🔔</div>
                <p className="text-sm text-gray-400">No notifications yet</p>
                {!enabled && (
                  <button onClick={onToggle} className="text-xs text-green-700 hover:underline mt-1">
                    Enable notifications
                  </button>
                )}
              </div>
            ) : (
              notifications.map(notif => (
                <Link
                  key={notif.id}
                  to={notif.link}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    !notif.read ? 'bg-green-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg flex-shrink-0 mt-0.5">{typeIcons[notif.type] || '📣'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
